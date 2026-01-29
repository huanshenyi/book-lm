import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";

export const bedrock = createAmazonBedrock(
  {
    region: "us-east-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    sessionToken: process.env.AWS_SESSION_TOKEN!,
  }
);
