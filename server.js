const express = require('express')
const { createClient } = require('@supabase/supabase-js')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('public')) 

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

app.get('/api/messages', async (req, res) => {
  const { data, error } = await supabase.from('messages').select('*').order('created_at')
  if(error) return res.status(500).json({error})
  res.json(data)
})

app.post('/api/messages', async (req, res) => {
  const { text } = req.body
  const { error } = await supabase.from('messages').insert([{ text }])
  if(error) return res.status(500).json({error})
  res.json({ success: true })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Mychatapp iko live kwenye ${PORT}`))
