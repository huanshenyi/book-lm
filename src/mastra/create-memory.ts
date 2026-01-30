import { Memory } from '@mastra/memory';
import { LibSQLVector } from '@mastra/libsql';
import { bedrock } from '../lib/bedrock-providers';

export const memory = new Memory({
  embedder: bedrock.embedding("amazon.nova-2-multimodal-embeddings-v1:0"),
  vector: new LibSQLVector({
    id: 'support-agent-vector',
    url: "file:./local.db",
  }),
  options: {
    lastMessages: 10,
    semanticRecall: {
      topK: 3,
      messageRange: 2,
      scope: "resource",
    },
    generateTitle: {
      model: bedrock("us.anthropic.claude-sonnet-4-5-20250929-v1:0"),
      instructions: "ユーザーの最初のメッセージに基づいて、会話の簡潔なタイトルを日本語で生成してください（10文字以内）",
    },
    workingMemory: {
      enabled: true,
      scope: "thread",
      template: `## ユーザープロフィール
- 名前: <不明>
- 使用言語: <自動検出>
- 場所: <不明>
- タイムゾーン: <不明>

## 好み
- コミュニケーションスタイル: <未設定>
- 関心のあるトピック: <なし>

## 重要な情報
- <なし>

## 直近のコンテキスト
- 最後のトピック: <なし>
- 保留中のフォローアップ: <なし>`
    }
  }
});
