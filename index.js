const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app=express();
const port=process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.get("/", async(req,res)=>{
    res.send("JobsPlacer server is running perfectly")
})

app.listen(port,()=>{
    console.log(`JobsPlacer server is running on port: ${port}`);
})

