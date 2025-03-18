import Kuroshiro from "./kuroshiro.js";
import KuromojiAnalyzer from "./kuroshiro-analyzer-kuromoji.js";

const kuroshiro = new Kuroshiro();
await kuroshiro.init(new KuromojiAnalyzer());
const result = await kuroshiro.convert("感じ取れたら手を繋ごう、重なるのは人生のライン and レミリア最高！", { mode: 'furigana', to: "hiragana" });
console.log(result)