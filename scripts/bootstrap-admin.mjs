import { createClient } from '@supabase/supabase-js'

const url=process.env.NEXT_PUBLIC_SUPABASE_URL
const key=process.env.SUPABASE_SERVICE_ROLE_KEY
const email=process.env.PATHWAYS_ADMIN_EMAIL
const password=process.env.PATHWAYS_ADMIN_PASSWORD
const fullName=process.env.PATHWAYS_ADMIN_NAME || 'Pathways Administrator'
if(!url||!key||!email||!password){console.error('Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PATHWAYS_ADMIN_EMAIL and PATHWAYS_ADMIN_PASSWORD.');process.exit(1)}
if(password.length<12){console.error('PATHWAYS_ADMIN_PASSWORD must be at least 12 characters.');process.exit(1)}
const supabase=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})
let userId
const {data:created,error:createError}=await supabase.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{full_name:fullName}})
if(createError){
  const {data:list,error:listError}=await supabase.auth.admin.listUsers({page:1,perPage:1000})
  if(listError) throw listError
  const existing=list.users.find(u=>u.email?.toLowerCase()===email.toLowerCase())
  if(!existing) throw createError
  userId=existing.id
}else userId=created.user.id
const {error}=await supabase.from('profiles').update({full_name:fullName,role:'admin',active:true,force_password_change:false}).eq('id',userId)
if(error) throw error
console.log(`Pathways admin ready: ${email}`)
