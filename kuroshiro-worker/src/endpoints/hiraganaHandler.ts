import {Bool, OpenAPIRoute, Str} from "chanfana";
import {z} from "zod";
import Kuroshiro from "kuroshiro";
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji";
import MecabAnalyzer from "kuroshiro-analyzer-mecab";


export class HiraganaHandler extends OpenAPIRoute {
    schema = {
        tags: ["Hiragana"],
        summary: "get hiragana",
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: z.object({
                            inputText: Str({description: "输入文本"}),
                        }),
                    },
                },
            },
        },
        responses: {
            "200": {
                description: "返回处理结果",
                content: {
                    "application/json": {
                        schema: z.object({
                            series: z.object({
                                success: Bool(),
                                result: z.object({
                                    hiraganaResult: z.string(),
                                    okuriganaResult: z.string(),
                                    furiganaResult: z.string(),
                                }),
                            }),
                        }),
                    },
                },
            },
            "404": {
                description: "处理失败",
                content: {
                    "application/json": {
                        schema: z.object({
                            series: z.object({
                                success: Bool(),
                                error: Str(),
                                result: z.object({
                                    hiraganaResult: z.string(),
                                    okuriganaResult: z.string(),
                                    furiganaResult: z.string(),
                                }),
                            }),
                        }),
                    },
                },
            },
        },
    };

    async handle(c) {
        // Get validated data
        const data = await this.getValidatedData<typeof this.schema>();

        // Retrieve the validated slug
        const {inputText} = data.body;
        console.log('inputText ', inputText)
        // Implement your own object fetch here

        let hiraganaResult: string = "";
        let furiganaResult: string = "";
        let okuriganaResult: string = "";

        if (!inputText) {
            return {
                success: false,
                error: "请输入参数",
                hiraganaResult,
                okuriganaResult,
                furiganaResult,
            };
        }

        const kuroshiro = new Kuroshiro();
        // const analyzer = new KuromojiAnalyzer();
        const analyzer = new MecabAnalyzer();
        const res = await kuroshiro.init(analyzer);

        hiraganaResult = await kuroshiro.convert(inputText, {to: "hiragana"});
        furiganaResult = await kuroshiro.convert(inputText, {mode: "furigana", to: "hiragana"});
        okuriganaResult = await kuroshiro.convert(inputText, {mode: "okurigana", to: "hiragana"});

        return {
            success: true,
            hiraganaResult,
            okuriganaResult,
            furiganaResult,
        };
    }
}
