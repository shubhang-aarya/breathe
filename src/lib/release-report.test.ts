import { afterEach, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
const temporary: string[]=[];
afterEach(()=>{for(const path of temporary.splice(0))rmSync(path,{recursive:true,force:true})});
// Explicit synthetic tool-contract fixtures. These are not BREATHE audit measurements.
function run(patch: object={}){
 const folder=mkdtempSync(join(tmpdir(),'breathe-lighthouse-test-'));temporary.push(folder);const file=join(folder,'fixture.json');
 writeFileSync(file,JSON.stringify({lighthouseVersion:'fixture',fetchTime:'2026-11-08T12:00:00Z',finalDisplayedUrl:'https://example.test/',configSettings:{formFactor:'desktop'},categories:{performance:{score:.9}},audits:{},...patch}));
 return spawnSync(process.execPath,[resolve('scripts/check-lighthouse.mjs'),file,'https://example.test'],{encoding:'utf8'});
}
it('accepts a matching desktop report that meets the target',()=>{expect(run().status).toBe(0)});
it('rejects mobile reports, wrong origins, audit errors and scores below 85',()=>{
 for(const patch of [{configSettings:{formFactor:'mobile'}},{finalDisplayedUrl:'https://wrong.test/'},{runtimeError:{message:'failed'}},{categories:{performance:{score:.84}}}])expect(run(patch).status).toBe(1);
});
it('does not silently accept a missing performance score',()=>{expect(run({categories:{}}).status).toBe(1)});
