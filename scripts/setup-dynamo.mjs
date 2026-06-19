import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from "@aws-sdk/client-dynamodb";

const TABLE_NAME = process.env.DROPRUSH_TABLE_NAME || "DropRush";
const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });

async function tableExists() {
  try { await client.send(new DescribeTableCommand({ TableName: TABLE_NAME })); return true; }
  catch { return false; }
}

async function main() {
  console.log(`→ Setting up DynamoDB table: ${TABLE_NAME}`);
  if (await tableExists()) { console.log(`✓ Table already exists.`); return; }
  await client.send(new CreateTableCommand({
    TableName: TABLE_NAME, BillingMode: "PAY_PER_REQUEST",
    AttributeDefinitions: [
      { AttributeName: "PK", AttributeType: "S" }, { AttributeName: "SK", AttributeType: "S" },
      { AttributeName: "GSI1PK", AttributeType: "S" }, { AttributeName: "GSI1SK", AttributeType: "S" },
    ],
    KeySchema: [{ AttributeName: "PK", KeyType: "HASH" }, { AttributeName: "SK", KeyType: "RANGE" }],
    GlobalSecondaryIndexes: [{
      IndexName: "GSI1",
      KeySchema: [{ AttributeName: "GSI1PK", KeyType: "HASH" }, { AttributeName: "GSI1SK", KeyType: "RANGE" }],
      Projection: { ProjectionType: "ALL" },
    }],
  }));
  console.log(`✓ Table "${TABLE_NAME}" created!`);
}

main().catch(e => { console.error("✗ Failed:", e.message); process.exit(1); });