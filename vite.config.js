import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
import {mkdir,writeFile} from 'node:fs/promises';
const exportDirectory=fileURLToPath(new URL('./proof/',import.meta.url));
export default defineConfig({
  base:process.env.PAGES_BASE || "/",
  plugins:[{name:'local-study-export',configureServer(server){server.middlewares.use('/__export-study',async(req,res,next)=>{
    if(req.method!=='POST'){next();return;}
    try{
      let body='';for await(const chunk of req){body+=chunk;if(body.length>8000000)throw new Error('Export too large');}
      const {treatment,png}=JSON.parse(body);
      if(!['white','moss','reveal'].includes(treatment)||!png.startsWith('data:image/png;base64,'))throw new Error('Invalid export');
      await mkdir(exportDirectory,{recursive:true});
      const name='INTAKE-monogram-'+treatment+'.png';
      await writeFile(exportDirectory+'/'+name,Buffer.from(png.split(',')[1],'base64'));
      res.setHeader('Content-Type','application/json');res.end(JSON.stringify({saved:'proof/'+name}));
    }catch(error){res.statusCode=400;res.end(JSON.stringify({error:error.message}));}
  });}}],
  build:{rolldownOptions:{input:{homepage:fileURLToPath(new URL('./index.html',import.meta.url)),mobile:fileURLToPath(new URL('./mobile.html',import.meta.url)),study:fileURLToPath(new URL('./study.html',import.meta.url))}}}
});
