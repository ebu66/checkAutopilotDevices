# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 概要

clasp でローカル管理する Google Apps Script (GAS) プロジェクト。`.clasp.json` の `rootDir` は空なのでリポジトリ直下が push 対象。ソースは `コード.js`、マニフェストは `appsscript.json`（V8 / Asia/Tokyo）。ファイル構成が変わったらこのファイルを更新すること。

`コード.js` は Microsoft Graph (v1.0) を UrlFetchApp で直接呼ぶ。ヘルパーは `getAccessToken_`（トークン取得）と `graphGetAll_`（`@odata.nextLink` をたどって全件取得）。末尾 `_` の関数はエディタの実行メニューに出ない private 関数で、エディタから実行するエントリポイントは `_` なしで定義する。

## コマンド

ビルド・lint・テストの仕組みは無い。`npm install` は補完用の型定義 `@types/google-apps-script` を入れるだけ。

clasp (v3.4.1) は package.json ではなくグローバルにインストールされている。v3 ではコマンド名が変わっている（旧名はエイリアスとして有効）。

```
clasp login                      # 初回のみ。事前に https://script.google.com/home/usersettings で Apps Script API を有効化
clasp clone-script <scriptId>    # 既存プロジェクトを紐付け（.clasp.json を生成）
clasp show-file-status           # push 対象ファイルの確認
clasp push                       # ローカル → GAS
clasp pull                       # GAS → ローカル
clasp open-script                # ブラウザでエディタを開く
clasp tail-logs                  # 実行ログ
```

`clasp run-function` は API 実行可能としてのデプロイと標準 GCP プロジェクトの紐付けが必要。未設定ならエディタから関数を実行する。

## 押さえておくべき前提

- **トランスパイルなし**: clasp v3 はファイルをそのまま push する。プレーンな JavaScript (V8 ランタイム) で書き、`import` / `export` / `require` は使わない。GAS 上では全 `.js` ファイルが単一のグローバルスコープを共有するため、関数名・トップレベル変数の衝突に注意。
- **型チェックは無効**: jsconfig.json は `types: ["google-apps-script"]` で補完のみ有効、`checkJs: false`。型エラーはエディタに出ないので、GAS API の使い方は自分で確認する。
- **`.clasp.json` は gitignore 対象**: スクリプト ID はリポジトリに含まれない。新しい環境では `clasp clone-script` で各自生成する。`rootDir` が設定されていればそのディレクトリだけが push 対象になる。
- **push はリモートを上書きする**: Web エディタで直接編集した内容は、先に `clasp pull` しないと `clasp push` で失われる。ローカルで削除したファイルはリモートからも消える。
- **`appsscript.json` がマニフェスト**: タイムゾーン・OAuth スコープ・高度なサービスはここで管理し、ローカルで編集して push する。

## 仕様

プログラムの使用については、`spec.md`を参照すること。
なお、認証情報は、GASプロジェクトのスクリプトプロパティから取得することとする。
プロパティ名は `TENANT_ID` / `CLIENT_ID` / `CLIENT_SECRET`（Entra ID のアプリ登録。クライアント資格情報フローで Graph のトークンを取得する）。

