# checkAutopilotDevices
## 概要
Intuneに登録されているAutopilotデバイスと、対象グループの差分を取得する

## 処理フロー
1. Intuneに接続する
1. Windowsデバイスの一覧を取得する
1. 「AutoPilot-個人PC用」グループに所属しているデバイスの一覧を取得する
1. 差分を抽出する
1. 「AutoPilot-個人PC用」のデバイス名が割り当てられていなければ、別リストを作成する

## Intuneへの接続
認証情報はAppScriptから取得する

## 

