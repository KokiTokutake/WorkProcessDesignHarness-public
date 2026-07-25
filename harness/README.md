# 業務設計ハーネス

「業務設計の教科書」(`docs/transcription.md`)の方法論(WORKING1〜7)を使って、対象業務を
AS-IS/TO-BE比較レポート(HTML・レーン図つき)にまとめるための作業一式。

## ディレクトリ構成

```
harness/
  framework.md              方法論のリファレンス(ムダ時間分類・優先順位マトリクス・AI活用4パターンなど)
  templates/                ヒアリング〜分析用のMarkdownテンプレート(WORKING1-7準拠)
    01_業務ステップ一覧.md
    02_個別定義シート.md
    03_前後工程すり合わせ.md
    04_情報の地図.md
    05_課題一覧.md
    06_TOBEパターン設計.md
    07_優先順位マトリクス.md
  report/
    template.html           成果物本体。単体で開けるHTMLレポート(レーン図・優先順位マトリクス入り)
  cases/
    <案件名>/                案件ごとに templates/ の複製を置いて記入する
```

## 進め方

**対話形式でガイドしてほしい場合**: このリポジトリには `business-analysis-guide` スキルが
入っている(`.claude/skills/business-analysis-guide/`)。「業務分析を始めたい」のように話しかければ、
案件フォルダの作成からPhase1〜8の質問、JSON化、レポート生成まで一通り対話でガイドしてくれる。
以下は手動で進める場合の手順。

1. `cases/` 配下に案件フォルダを作り、`templates/` の7ファイルをコピーする。
2. `framework.md` を横に置きながら、01→07の順に埋めていく(WORKING1〜7に対応)。
   ヒアリングを重ねるたびに個別定義シート(02)やすり合わせ(03)を更新して構わない。
3. 07まで埋まったら、内容を `report/template.html` 内の
   `<script id="report-data" type="application/json">` ブロックのJSON形式に転記する
   (各テンプレート末尾の「JSON化メモ」がフィールド対応表)。
4. ブラウザで `template.html` を開いて確認する。担当者(レーン)やステップ数が変わっても
   `renderLane()` が自動でレーン図・接続矢印を再計算するので、JSONを差し替えるだけでよい。

## JSONスキーマの要点

```jsonc
{
  "meta": { "scope": "...", "date": "...", "author": "...", "target": "..." },
  "actors": ["営業", "経理", "顧客"],          // レーンの並び順
  "asis": { "steps": [ { "id": "A1", "actor": "営業", "name": "...",
             "input": "...", "output": "...", "trigger": "...", "waste": "探す時間|null" } ] },
  "issues": [ { "id": "I1", "step": "A2", "category": "探す時間", "text": "...",
                "minutes": 15, "freq": 25 } ],
  "tobePatterns": [ {
      "id": "P1", "name": "業務簡素化", "tagline": "...",
      "effectLevel": 0-10, "ease": 0-10, "effortLabel": "小|中|大", "impactLabel": "小|中|大|特大",
      "steps": [ /* asis.steps と同じ形式 */ ],
      "effect": { "timeSavedH": 0, "leadTime": "...", "errorRate": "...", "qualitative": ["..."] },
      "prerequisites": ["..."], "risks": ["..."]
  } ]
}
```

- `actors` に無い担当者をステップで使わないこと(レーンが見つからず描画されない)。
- `waste` は課題一覧(05)のタグ(探す時間/確認する時間/問い合わせる時間/判断待ち時間)と揃える。
- `tobePatterns` は3〜4件が目安(A:業務簡素化 / B:ルールベース自動化 / C:生成AI活用 / D:AIエージェント型)。

## サンプル

`report/template.html` には書籍WORKING3のサンプル「請求書作成業務」の実データが埋め込み済み。
新規案件を始める前に、まずこれを開いて完成形のイメージをつかむとよい。
