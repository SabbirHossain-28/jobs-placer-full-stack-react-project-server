const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({
  origin:["http://localhost:5173"],
  credentials:true,
}));
const cookieOption={
  httpOnly: true,
  secure: process.env.NODE_ENV==="production"?true:false,
  sameSite: process.env.NODE_ENV==="production"?"none":"strict",
}
app.use(cookieParser());

const verifyToken = async (req, res, next) => {
  const token = req?.cookies?.accessToken;
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7nkbk6a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const jobsCollection = client.db("jobsPlacerDB").collection("jobs");
    const jobApplicationCollection = client
      .db("jobsPlacerDB")
      .collection("applications");

      app.post("/jwt",async(req,res)=>{
        const user=req.body;
        const token=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
          expiresIn:"365d",
        })
        res
        .cookie("accessToken", token,cookieOption )
        .send({token})
      })
      app.post("/logout", async (req, res) => {
        const userInfo = req.body;
        console.log("logginOut action from cliend side", userInfo);
        res.clearCookie("accessToken", { ...cookieOption,maxAge: 0 }).send({ success: true });
      });

    app.post("/jobs", async (req, res) => {
      const jobsData = req.body;
      const result = await jobsCollection.insertOne(jobsData);
      res.send(result);
    });

    app.get("/jobs", async (req, res) => {
      const result = await jobsCollection.find().toArray();
      res.send(result);
    });

    app.get("/job", async (req, res) => {
      let query = {};
      if (req.query?.email) {   
        query = { loggedInUserEmail: req.query.email };
      }
      const result = await jobsCollection.find(query).toArray();
      res.send(result);
    });

    app.put("/jobs/:id",async(req,res)=>{
        const id=req.params.id;
        const jobData=req.body;
        const query={_id:new ObjectId(id)};
        const options={upsert:true};
        const updateData={
            $set:{
                ...jobData
            }
        }
        const result=await jobsCollection.updateOne(query,updateData,options);
        res.send(result);
    })

    app.get("/jobDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    });

    app.delete("/jobs/:id",async(req,res)=>{
        const id=req.params.id;
        const query={_id:new ObjectId(id)};
        const result=await jobsCollection.deleteOne(query);
        res.send(result);
    })

    app.post("/applications", async (req, res) => {
      const applicationsData = req.body;
      console.log(applicationsData);
      const result = await jobApplicationCollection.insertOne(applicationsData);
      res.send(result);
    });

    app.get("/applications",async(req,res)=>{
        const result=await jobApplicationCollection.find().toArray();
        res.send(result);
    })

    app.get("/application",async(req,res)=>{
        let query={};
        console.log(query);
        if(req.query?.email){
            query={userEmail:req.query.email}
        }
        const result=await jobApplicationCollection.find(query).toArray();
        res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("JobsPlacer server is running perfectly");
});

app.listen(port, () => {
  console.log(`JobsPlacer server is running on port: ${port}`);
});
