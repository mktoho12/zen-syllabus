# ZEN 大学のシラバス

[ZEN 大学のシラバス](https://syllabus.zen.ac.jp/)に載っている授業のデータを Google スプレッドシートに展開する。

## Deploy

.clasp.json.sample をコピーして .clasp.json ファイルを作る

```
cp .clasp.json.sample .clasp.json
```

.clasp.json を開いて `scriptId` を自分のものに置き換える

Google App Script に Push する

```
npm run deploy
```
