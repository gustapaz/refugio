import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root=resolve('.output/public'),base='/refugio';
const mime={'.html':'text/html;charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.json':'application/json'};
createServer(async(req,res)=>{try{let path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(!path.startsWith(base+'/')){res.writeHead(302,{Location:base+'/'});return res.end();}const rel=path.slice(base.length);let file=resolve(root,'.'+rel);if(!file.startsWith(root+sep)&&file!==root){res.writeHead(403);return res.end();}if((await stat(file)).isDirectory())file=resolve(file,'index.html');res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.end(await readFile(file));}catch{res.writeHead(404);res.end('Not found');}}).listen(5192,'127.0.0.1',()=>console.log('http://127.0.0.1:5192/refugio/'));
