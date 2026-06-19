import { PutCommand, GetCommand, UpdateCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { randomUUID } from "crypto";
import { ddb, TABLE_NAME, GSI1_NAME } from "./dynamodb";
import { Drop, Claim, ClaimResult } from "./types";

function dropPk(dropId: string) { return `DROP#${dropId}`; }

function deriveStatus(drop: { startTime: string; remainingStock: number }) {
  if (drop.remainingStock <= 0) return "sold_out";
  return new Date(drop.startTime).getTime() <= Date.now() ? "live" : "upcoming";
}

export async function createDrop(input: {
  name: string; brand: string; description: string;
  price: number; imageUrl: string; totalStock: number; startTime: string;
}): Promise<Drop> {
  const dropId = randomUUID();
  const now = new Date().toISOString();
  const item: any = {
    PK: dropPk(dropId), SK: "META", dropId,
    ...input, remainingStock: input.totalStock,
    status: "upcoming", createdAt: now,
    GSI1PK: "STATUS#active",
    GSI1SK: `${input.startTime}#${dropId}`,
  };
  await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  const { PK, SK, GSI1PK, GSI1SK, ...rest } = item;
  return rest as Drop;
}

export async function listDrops(): Promise<Drop[]> {
  const result = await ddb.send(new QueryCommand({
    TableName: TABLE_NAME, IndexName: GSI1_NAME,
    KeyConditionExpression: "GSI1PK = :pk",
    ExpressionAttributeValues: { ":pk": "STATUS#active" },
    ScanIndexForward: true,
  }));
  return (result.Items || []).map((item: any) => {
    const { PK, SK, GSI1PK, GSI1SK, ...rest } = item;
    return { ...rest, status: deriveStatus(rest) } as Drop;
  });
}

export async function getDrop(dropId: string): Promise<Drop | null> {
  const result = await ddb.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { PK: dropPk(dropId), SK: "META" },
  }));
  if (!result.Item) return null;
  const { PK, SK, GSI1PK, GSI1SK, ...rest } = result.Item as any;
  return { ...rest, status: deriveStatus(rest) } as Drop;
}

export async function getClaim(dropId: string, userId: string): Promise<Claim | null> {
  const result = await ddb.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { PK: dropPk(dropId), SK: `CLAIM#${userId}` },
  }));
  if (!result.Item) return null;
  const { PK, SK, ...rest } = result.Item as any;
  return rest as Claim;
}

export async function claimDrop(dropId: string, userId: string): Promise<ClaimResult> {
  const existing = await getClaim(dropId, userId);
  if (existing) return { success: false, message: "You already claimed this drop." };
  try {
    const result = await ddb.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: dropPk(dropId), SK: "META" },
      UpdateExpression: "SET remainingStock = remainingStock - :one",
      ConditionExpression: "remainingStock > :zero",
      ExpressionAttributeValues: { ":one": 1, ":zero": 0 },
      ReturnValues: "UPDATED_NEW",
    }));
    const remainingStock = result.Attributes?.remainingStock as number;
    await ddb.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: dropPk(dropId), SK: `CLAIM#${userId}`,
        dropId, userId, claimedAt: new Date().toISOString(), status: "confirmed",
      },
    }));
    return { success: true, message: "Claim confirmed!", remainingStock };
  } catch (err) {
    if (err instanceof ConditionalCheckFailedException) {
      return { success: false, message: "Sold out — better luck next drop!" };
    }
    throw err;
  }
}