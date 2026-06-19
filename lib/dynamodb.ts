import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export const TABLE_NAME = process.env.DROPRUSH_TABLE_NAME || "DropRush";
export const GSI1_NAME = "GSI1";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

export const ddb = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});