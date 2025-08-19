from voicevox import Client
import asyncio

async def main():
    async with Client() as client:
        version = await client.fetch_core_versions()
        audio_query = await client.create_audio_query("こんにちは", 1)
        with open("./voice.wav", "wb") as f:
            f.write(await audio_query.synthesis(speaker=1))


if __name__ == "__main__":
    asyncio.run(main())