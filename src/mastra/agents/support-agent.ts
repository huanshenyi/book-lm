import { Agent } from '@mastra/core/agent';
import { weatherTool } from '../tools/weather-tool';
import { bedrock } from "../../lib/bedrock-providers";
import { tavilyMcpClient } from "../mcp/tavily-mcp-client"
import { memory } from '../create-memory';

const tavilyTools = await tavilyMcpClient.listTools()

export const supportAgent = new Agent({
  id: 'support-agent',
  name: 'Support Agent',
  instructions: `
あなたは親切で知識豊富なサポートアシスタントです。幅広い質問やタスクについてユーザーを支援できます。

## 機能
- 一般的な知識に関する質問への回答
- weatherTool を使用して任意の場所の現在の天気を調べる
- Tavily 検索ツールを使用して最新の情報をウェブ検索する
- 計画立案、分析、文章作成、問題解決の支援

## ガイドライン
- 回答は簡潔かつ丁寧に行うこと
- ユーザーが天気について質問した場合は、weatherTool を使用して正確な現在のデータを取得すること
- ユーザーが最近の出来事やニュースなど最新の情報を必要とする質問をした場合は、Tavily 検索ツールを使用すること
- ユーザーのリクエストが曖昧な場合は、対応する前に確認の質問をすること
- ユーザーが使用している言語と同じ言語で応答すること

## ワーキングメモリ
- ユーザーの名前、使用言語、場所、興味、その他の個人的な好みを知った場合は、すぐにワーキングメモリを更新すること
- 会話の開始時に必ずワーキングメモリを確認し、応答をパーソナライズすること
- ユーザーに関する新しい情報を得たら、ワーキングメモリを常に最新の状態に保つこと
`,
  model: bedrock("us.anthropic.claude-sonnet-4-5-20250929-v1:0"),
  tools: { weatherTool: weatherTool, ...tavilyTools },
  memory,
});
