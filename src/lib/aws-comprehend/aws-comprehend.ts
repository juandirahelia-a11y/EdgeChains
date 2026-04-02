import { ComprehendClient, DetectPiiEntitiesCommand } from "@aws-sdk/client-comprehend";

export class AWSComprehendRedactor {
  private client: ComprehendClient;

  constructor(region: string = "us-east-1") {
    this.client = new ComprehendClient({ region });
  }

  async redact(text: string): Promise<string> {
    const command = new DetectPiiEntitiesCommand({
      Text: text,
      LanguageCode: "en",
    });

    const response = await this.client.send(command);
    let redactedText = text;

    // Sort entities by BeginOffset in reverse to avoid index shifting
    const entities = response.Entities?.sort((a, b) => (b.BeginOffset ?? 0) - (a.BeginOffset ?? 0)) || [];

    for (const entity of entities) {
      const start = entity.BeginOffset ?? 0;
      const end = entity.EndOffset ?? 0;
      redactedText = redactedText.slice(0, start) + "[REDACTED]" + redactedText.slice(end);
    }

    return redactedText;
  }
}

