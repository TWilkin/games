export async function sleep(ms: number) {
    await new Promise(resolve => setTimeout(resolve, ms));
}

export async function retry<T>(name: string, func: () => Promise<T>, attempts: number=10, wait: number=2, backoff: number=1.2): Promise<T | null>
{
    let sleepTime = 0;

    for(let retry = 0; retry < attempts; retry++) {
        if(retry != 0) {
            sleepTime += Math.round(wait * Math.pow(backoff, retry - 1) * 100) / 100;
            console.log(`${name}: Retrying in ${sleepTime}s`);
            await sleep(sleepTime * 1000);
        }

        try {
            return await func();
        } catch(error) {
            console.error(`${name}: Attempt ${retry + 1} of ${attempts} failed: ${error}`);
        }
    }

    return null;
}
