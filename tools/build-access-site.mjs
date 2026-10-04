import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const out=path.join(root,'dist');
await fs.mkdir(out,{recursive:true});
const folders=['css','fonts','images','js','media','data'];
for(const entry of await fs.readdir(root,{withFileTypes:true})){
 if(folders.includes(entry.name)||entry.isFile()&&/\.(html|png|jpg|ico)$/.test(entry.name))await fs.cp(path.join(root,entry.name),path.join(out,entry.name),{recursive:true});
}
console.log('Prepared Cloudflare website in dist. Server code, credentials and tests are excluded.');
