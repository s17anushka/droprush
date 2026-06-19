import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const TABLE = process.env.DROPRUSH_TABLE_NAME || "DropRush";
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" }), { marshallOptions: { removeUndefinedValues: true } });

function drop({ name, brand, description, price, totalStock, min }) {
  const dropId = randomUUID();
  const startTime = new Date(Date.now() + min * 60000).toISOString();
  return { PK: `DROP#${dropId}`, SK: "META", dropId, name, brand, description, price, imageUrl: "", totalStock, remainingStock: totalStock, startTime, status: "upcoming", createdAt: new Date().toISOString(), GSI1PK: "STATUS#active", GSI1SK: `${startTime}#${dropId}` };
}

const seeds = [
  drop({ name: "Air Rush 001", brand: "Nike", description: "Exclusive colorway. One per customer.", price: 220, totalStock: 4, min: -1 }),
  drop({ name: "Ultraboost Shadow", brand: "Adidas", description: "Black-on-black. Limited pairs.", price: 180, totalStock: 4, min: 30 }),
  drop({ name: "Forum Low Obsidian", brand: "Adidas", description: "Limited collab drop.", price: 140, totalStock: 4, min: 60 }),
  drop({ name: "Dunk Low Panda", brand: "Nike", description: "Most hyped drop of the year.", price: 110, totalStock: 4, min: 120 }),
];

console.log(`→ Seeding 4 drops...`);
for (const item of seeds) {
  await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
  console.log(`  ✓ ${item.brand} — ${item.name}`);
}
console.log(`✓ Done! Visit http://localhost:3000`);