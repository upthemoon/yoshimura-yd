# yoshimura-yd.com

ヨシムラ電設有限会社 公式サイト (Wix 移行版・静的サイト)

## 概要

- 業種: 送電線鉄塔組立工事
- 所在地: 愛知県愛知郡東郷町
- 設立: 1994 年
- 主要取引先: 株式会社シーテック (中部電力パワーグリッド系列)

## 技術構成

- 静的 HTML / CSS / Vanilla JS
- GitHub Pages デプロイ (上行は `main` ブランチ)
- ドメイン: `yoshimura-yd.com` (Wix → お名前.com 移管後・GitHub Pages 配信)
- メール: `info@yoshimura-yd.com` (iCloud+ カスタムドメイン・移管完了後切替)
- フォーム: Formspree

## ローカル開発

```
cd ~/yoshimura-yd
python3 -m http.server 8769
# http://localhost:8769
```

## ページ構成

- `/` (index.html) — Home
- `/services.html` — 事業内容
- `/company.html` — 会社情報
- `/recruit.html` — 採用
- `/contact.html` — お問い合わせ
- `/privacy.html` — プライバシーポリシー

## デプロイ

`main` への push で GitHub Pages 自動デプロイ。

## ライセンス

© 1994- Yoshimura Electric Construction Co., Ltd. All rights reserved.
