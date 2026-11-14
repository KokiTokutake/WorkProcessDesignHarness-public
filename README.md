# 業務設計ハーネス

業務をAS-IS/TO-BE比較レポート(HTML・レーン図つき)にまとめるための作業一式。

「業務設計の教科書」(WORKING1〜7)の方法論をテンプレート化したもので、次の流れを1本で通せる。

1. 現状業務(AS-IS)をステップ・担当者・INPUT/OUTPUTで整理する
2. ムダ時間(探す/確認する/問い合わせる/判断待ち)を課題として洗い出し、月間ロスを試算する
3. 改善案(TO-BE)を4パターン(業務簡素化/ルールベース自動化/生成AI活用/AIエージェント型)で設計する
4. 効果と実行しやすさで優先順位をつけ、単体で開けるHTMLレポートにまとめる

Claude Code 用のスキル `business-analysis-guide` を同梱しており、ユーザーレベルに組み込めば
**どのフォルダからでも**対話形式で分析を進められる(案件データはこのリポジトリに集約される)。

## クイックスタート

```text
# どのフォルダで起動した Claude Code でも、次のように話しかけるだけ
> 業務分析を始めたい
> 請求書作成業務のAS-ISとTO-BEを整理したい
> 前回の業務分析の続きをやりたい
```

スキルが Phase 0(スコープ確認)から Phase 8(レポート生成)まで1フェーズずつ質問し、回答を
`harness/cases/<案件名>/` に書き込んでいく。途中でセッションを閉じても `PROGRESS.md` から再開できる。

## インストール(ユーザーレベルへの組み込み)

スキル本体は `skill/business-analysis-guide/` にあり、`~/.claude/skills/` からジャンクションで
参照させる。リポジトリ側が唯一の正本なので、スキルを直せばそのまま全プロジェクトに反映される。

リポジトリのルートで次を実行する。

```powershell
# PowerShell (管理者権限不要)。リポジトリのルートで実行する
New-Item -ItemType Junction `
  -Path "$env:USERPROFILE\.claude\skills\business-analysis-guide" `
  -Target "$PWD\skill\business-analysis-guide"
```

macOS / Linux の場合:

```bash
ln -s "$PWD/skill/business-analysis-guide" ~/.claude/skills/business-analysis-guide
```

確認方法: 任意のフォルダで Claude Code を起動し、スキル一覧に `business-analysis-guide` が出ればよい。
リンクが正しく張れているかは、次でリポジトリのルートのパスが表示されるかで確かめられる。

```powershell
node "$env:USERPROFILE\.claude\skills\business-analysis-guide\scripts\harness_root.js"
# => リポジトリのルートの絶対パス
```

レポート生成スクリプト単体の動作は、リポジトリのルートで次を実行して確かめられる。

```powershell
node "$env:USERPROFILE\.claude\skills\business-analysis-guide\scripts\build_report.js" `
  ".\harness\cases\invoice-sample\data.json" `
  "$env:TEMP\report-check.html"
# => OK: wrote ... (7 AS-IS steps, 4 issues, 4 TO-BE patterns)
```

### 前提

- Claude Code
- Node.js(`build_report.js` の実行に使う。外部パッケージ不要)

### 注意点

- **ハーネスの場所はジャンクションの先から自動で求める**(`scripts/harness_root.js`)。
  パスをどこかに書き込む必要はない。リポジトリを移動・リネームしたら、上記ジャンクションを
  張り直すだけでよい。スキルフォルダを単体でコピーすると場所を求められないので、必ずリンクで組み込む。
- **案件はどこから起動しても `harness/cases/` に作られる。** 顧客の業務情報が含まれるため、
  リポジトリを公開・共有する前に `cases/` の中身(サンプル以外)を確認すること。
- アンインストールはジャンクションを消すだけでよい(リンク先の実体は消えない)。
  `Remove-Item "$env:USERPROFILE\.claude\skills\business-analysis-guide"`

## ディレクトリ構成

```
README.md                   このファイル(全体設計・JSONスキーマ)
skill/
  business-analysis-guide/  Claude Code スキル本体(~/.claude/skills/ からジャンクションで参照)
    SKILL.md                対話ガイドの手順(Phase 0〜8)
    scripts/build_report.js data.json をテンプレートに埋め込んでレポートを生成・構造チェック
    scripts/harness_root.js ジャンクションの先をたどってリポジトリのルートを返す
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
      PROGRESS.md           フェーズ1〜8の進捗(スキルが再開時に読む)
      data.json             レポート用データ(Phase 8で生成)
      report.html           完成レポート(Phase 8で生成)
```

## 進め方

**対話形式でガイドしてほしい場合**: 上の「インストール」を済ませたうえで、「業務分析を始めたい」の
ように話しかければ、案件フォルダの作成からPhase1〜8の質問、JSON化、レポート生成まで一通り
対話でガイドしてくれる(フェーズ構成は `skill/business-analysis-guide/SKILL.md` を参照)。
以下は手動で進める場合の手順。

1. `cases/` 配下に案件フォルダを作り、`templates/` の7ファイルをコピーする。
2. `framework.md` を横に置きながら、01→07の順に埋めていく(WORKING1〜7に対応)。
   ヒアリングを重ねるたびに個別定義シート(02)やすり合わせ(03)を更新して構わない。
3. 07まで埋まったら、内容を `report/template.html` 内の
   `<script id="report-data" type="application/json">` ブロックのJSON形式に転記する
   (各テンプレート末尾の「JSON化メモ」がフィールド対応表)。
   JSONを手で埋め込むとタグを壊しやすいので、案件フォルダに `data.json` として書き出し、
   次のスクリプトで埋め込むのが安全(必須キー漏れや存在しない担当者の参照もここで検出される)。
   ```
   node skill/business-analysis-guide/scripts/build_report.js \
     harness/cases/<案件名>/data.json harness/cases/<案件名>/report.html
   ```
4. ブラウザで生成された `report.html` を開いて確認する。担当者(レーン)やステップ数が変わっても
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

同じサンプルを01〜07のMarkdown・`data.json`・`report.html` まで通しで記入した例が
`harness/cases/invoice-sample/` にある。各フェーズで何をどの粒度で書けばよいかの参考にする。
