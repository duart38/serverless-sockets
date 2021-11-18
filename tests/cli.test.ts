import { assertEquals } from "https://deno.land/std@0.106.0/testing/asserts.ts";


async function parseStdout(p: Deno.Process){
    const ret = new Uint8Array(2500);
    await p.stdout?.read(ret);
    p.stdout?.close();
    let childRawOut = new TextDecoder().decode(ret).replaceAll('$_$_$','').trim();

    childRawOut = childRawOut.replaceAll(String.fromCharCode(0), "");
    return JSON.parse(childRawOut);
}

Deno.test("CLI responds to value change from flag", async () => {
    const p = Deno.run({
        cmd: ['deno', 'run', '-A', 'tests/cli_test_file.ts', '--payloadLimit', '10'],
        stdout: 'piped'
    });
    
    const childOut = await parseStdout(p);
    const status = (await p.status()).code;

    assertEquals(status, 0, 'exit code 0 in this test represent a success. any other exit code is an error');
    assertEquals(childOut.payloadLimit, 10);
    p.close();
});