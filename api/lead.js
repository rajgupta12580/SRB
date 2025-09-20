
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({ok:false,message:'Method not allowed'});
  const key = req.headers['x-api-key'] || '';
  if(!process.env.RB_API_KEY || key !== process.env.RB_API_KEY){
    return res.status(401).json({ok:false,message:'Unauthorized'});
  }
  const { name,email,country,product,message,date } = req.body||{};
  try{
    const db = await open({ filename: '/tmp/rb.sqlite', driver: sqlite3.Database });
    await db.exec('CREATE TABLE IF NOT EXISTS leads(id INTEGER PRIMARY KEY, date TEXT, name TEXT, email TEXT, country TEXT, product TEXT, message TEXT)');
    await db.run('INSERT INTO leads(date,name,email,country,product,message) VALUES (?,?,?,?,?,?)', [date||new Date().toISOString(), name, email, country, product||'', message||'']);
    await db.close();
    return res.status(200).json({ok:true});
  }catch(e){
    console.error(e);
    return res.status(500).json({ok:false});
  }
}
