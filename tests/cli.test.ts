import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.106.0/testing/asserts.ts";
import { CONFIG, configuration } from "../src/config.js";
import { readLines } from "https://deno.land/std@0.115.1/io/mod.ts";


async function parseStdout(p: Deno.Process): Promise<configuration>{
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

Deno.test("CLI retains shape after some value change", async () => {
    const p = Deno.run({
        cmd: [
            'deno', 'run', '-A', 'tests/cli_test_file.ts',
            '--payloadLimit', '10',
             '--INSECURE.port', '6969'
        ],
        stdout: 'piped'
    });
    
    const childOut = await parseStdout(p);
    const status = (await p.status()).code;

    assertEquals(status, 0, 'exit code 0 in this test represent a success. any other exit code is an error');
    assertEquals(Object.keys(childOut).length, Object.keys(CONFIG).length);
    p.close();
});

Deno.test("CLI allows for nested data manipulation", async () => {
    const p = Deno.run({
        cmd: [
            'deno', 'run', '-A', 'tests/cli_test_file.ts',
             '--INSECURE.port', '6969'
        ],
        stdout: 'piped'
    });
    
    const childOut = await parseStdout(p);
    const status = (await p.status()).code;

    assertEquals(status, 0, 'exit code 0 in this test represent a success. any other exit code is an error');
    assertEquals(childOut.INSECURE.port, 6969);
    p.close();
});

Deno.test("CLI prints documentation correctly", async () => {
    const p = Deno.run({
        cmd: [
            'deno', 'run', '-A', 'tests/cli_test_doc_file.ts',
             '-h'
        ],
        stdout: 'piped',
    });
    let childRawOut = "";
    for await (const line of readLines(p.stdout)) childRawOut+=line+'\n';
    
    const status = (await p.status()).code;

    assertEquals(status, 0, `finished with exit code ${status}`);
    Object.keys(CONFIG).forEach((key)=>{
        console.log(`\t\ttesting if ${key} is printed in the help`)
        assertStringIncludes(childRawOut, key);
    });

    p.stdout?.close();
    p.close();
});