import fs from 'node:fs'
import path from 'node:path'
import { gunzipSync } from 'node:zlib'

const root = process.cwd()
const read = (p) => fs.readFileSync(path.join(root,p),'utf8')
const write = (p,content) => {
  const dest = path.join(root,p)
  fs.mkdirSync(path.dirname(dest),{recursive:true})
  fs.writeFileSync(dest,content,'utf8')
}

const staffB64 = read('release_v12/StaffPortal.tsx.gz.b64').trim()
write('components/StaffPortal.tsx', gunzipSync(Buffer.from(staffB64,'base64')).toString('utf8'))

const studentParts = fs.readdirSync(path.join(root,'release_v12'))
  .filter((name)=>/^StudentPortal\.part\d+\.txt$/.test(name))
  .sort()
  .map((name)=>read(`release_v12/${name}`))
write('components/StudentPortal.tsx', studentParts.join(''))
write('components/AuthScreen.tsx', read('release_v12/AuthScreen.tsx'))
write('app/api/admin/users/route.ts', read('release_v12/users-route.ts'))
write('lib/types.ts', read('release_v12/types.ts'))

console.log('Prepared Pathways v1.2.0 restored portal source.')
