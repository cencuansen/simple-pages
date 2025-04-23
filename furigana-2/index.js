import Kuroshiro from "kuroshiro";
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji";

(async function main() {
    const kuroshiro = new Kuroshiro();
    await kuroshiro.init(new KuromojiAnalyzer());

    const str = "お仕事中"

    // hiragana(平假名) → おしごとちゅう
    const hiraganaResult = await kuroshiro.convert(str, {to: "hiragana"});

    // furigana(振假名) → お<ruby>仕事<rp>(</rp><rt>しごと</rt><rp>)</rp></ruby><ruby>中<rp>(</rp><rt>ちゅう</rt><rp>)</rp></ruby>
    const furiganaResult = await kuroshiro.convert(str, {mode: "furigana", to: "hiragana"});

    // okurigana(送假名) → お仕事(しごと)中(ちゅう)
    const okuriganaResult = await kuroshiro.convert(str, {mode: "okurigana", to: "hiragana"});

    console.log("平假名 ", hiraganaResult);
    console.log("振假名 ", furiganaResult);
    console.log("送假名 ", okuriganaResult);
})();