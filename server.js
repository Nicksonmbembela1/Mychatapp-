const express = require('express');
const app = express();
const path = require('path');

// Hii inasema: soma file zote za ndani ya folder ya "public"
app.use(express.static('public')); 

app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Mychatapp ina-run kwenye port ${PORT}`));
