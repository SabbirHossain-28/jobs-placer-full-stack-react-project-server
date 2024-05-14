const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

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
