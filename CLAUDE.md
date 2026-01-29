# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Next.js 16 + Mastra AI フレームワークで構築された天気エージェントチャットアプリケーション。AWS Bedrock（Claude Sonnet 4.5）をLLMプロバイダーとして使用し、ストリーミングチャットUI、ツール実行、会話メモリを備える。

## 開発コマンド

```bash
npm run dev      # 開発サーバー起動
npm run build    # プロダクションビルド
npm run start    # プロダクションサーバー起動
npm run lint     # ESLint実行
```

## 環境変数

`.env` に以下を設定する必要がある:

- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_SESSION_TOKEN` — AWS Bedrock認証
- `MASTRA_CLOUD_ACCESS_TOKEN` — Mastra Cloud観測（任意）

## アーキテクチャ

### レイヤー構成

```
フロントエンド (React Client Components)
  └─ src/app/chat/page.tsx — チャットUI（useChat hook + ストリーミング）
      │
      ▼ HTTP POST/GET
API層 (Next.js Route Handlers)
  └─ src/app/api/chat/route.ts — handleChatStream + メモリ管理
      │
      ▼
Mastraコア
  └─ src/mastra/index.ts — エージェント・ワークフロー・ストレージの統括
      ├─ agents/weather-agent.ts — Bedrock Claude + weatherTool + Memory
      ├─ tools/weather-tool.ts — Open-Meteo APIで天気取得
      └─ workflows/weather-workflow.ts — 天気取得→アクティビティ提案の2ステップ
```

### 主要なデータフロー

1. チャットUIが `POST /api/chat` にメッセージ送信
2. `handleChatStream`（@mastra/ai-sdk）がweather-agentにルーティング
3. エージェントが必要に応じて`weatherTool`を呼び出し（Open-Meteo API）
4. レスポンスをストリーミングでUIに返却
5. メモリが `threadId` / `resourceId` 単位で会話を保持

### Mastra パターン

- **Agent**: LLM駆動の意思決定。ツールとメモリを持つ。`new Agent({ id, model, tools, memory, instructions })`
- **Tool**: Zodスキーマで入出力を定義。`createTool({ id, inputSchema, outputSchema, execute })`
- **Workflow**: 決定論的なステップ実行。`new Workflow({ name }).step(...).then(...).commit()`
- **Memory**: `new Memory()` でスレッドベースの会話コンテキスト管理
- **Storage**: `LibSQLStore` でデフォルトはインメモリ（`:memory:`）。永続化は `file:../mastra.db` に変更可能

### フロントエンド構成

- `src/components/ai-elements/` — チャット専用コンポーネント（prompt-input, message, tool, conversation）
- `src/components/ui/` — shadcn/ui（New Yorkスタイル、Radix UIベース）
- `src/lib/bedrock-providers.ts` — AWS Bedrock SDK初期化
- `src/lib/utils.ts` — `cn()` ユーティリティ（clsx + tailwind-merge）

## 技術スタック詳細

- **Next.js 16** / React 19 / TypeScript 5
- **Tailwind CSS 4**（@tailwindcss/postcss経由）
- **AI SDK**: `ai` v6 + `@ai-sdk/react` v3 + `@ai-sdk/amazon-bedrock`
- **Mastra**: `@mastra/core`, `@mastra/ai-sdk`, `@mastra/memory`, `@mastra/libsql`, `@mastra/loggers`, `@mastra/observability`
- パスエイリアス: `@/*` → `./src/*`

## 新しいエージェント・ツール・ワークフローの追加

1. `src/mastra/agents/`, `src/mastra/tools/`, `src/mastra/workflows/` にファイル作成
2. `src/mastra/index.ts` の Mastra インスタンスに登録
3. APIルートで `agentId` を指定して呼び出し
