
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({ok:false,message:'Method not allowed'});
  const key = req.headers['x-api-key'] || '';
  if(!process.env.RB_API_KEY || key !== process.env.RB_API_KEY){
    return res.status(401).json({ok:false,message:'Unauthorized'});
  }
  const { leads=[], views={} } = req.body||{};
  try{
    const db = await open({ filename: '/tmp/rb.sqlite', driver: sqlite3.Database });
    await db.exec('CREATE TABLE IF NOT EXISTS leads(id INTEGER PRIMARY KEY, date TEXT, name TEXT, email TEXT, country TEXT, product TEXT, message TEXT)');
    const stmt = await db.prepare('INSERT INTO leads(date,name,email,country,product,message) VALUES (?,?,?,?,?,?)');
    for(const l of leads){
      await stmt.run([l.date||new Date().toISOString(), l.name, l.email, l.country, l.product||'', l.message||'']);
    }
    await stmt.finalize();
    await db.exec('CREATE TABLE IF NOT EXISTS views(name TEXT PRIMARY KEY, count INTEGER)');
    for(const [name,count] of Object.entries(views)){
      await db.run('INSERT INTO views(name,count) VALUES (?,?) ON CONFLICT(name) DO UPDATE SET count=excluded.count', [name, count]);
    }
    await db.close();
    return res.status(200).json({ok:true});
  }catch(e){
    console.error(e);
    return res.status(500).json({ok:false});
  }
}
