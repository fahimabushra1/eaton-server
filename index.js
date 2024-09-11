const express = require("express");
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT|| 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors());
app.use(express.json());


const uri = process.env.DB_URL;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
  
    await client.connect();
    const foodCollection = client.db("foodDB").collection("foodCollection");
    const userCollection = client.db("userDB").collection("userCollection");


    app.post('/dashboard/food', async (req,res)=>{
      const foodData = req.body;
      const result = await foodCollection.insertOne(foodData);
      res.send(result)
  })

  app.get('/dashboard/food', async (req,res)=>{
    const foodData = foodCollection.find();
    const result = await foodData.toArray();
    res.send(result);
  })

  app.get('/dashboard/food/:id', async (req,res)=>{
    const id = req.params.id;
    const foodData =  await foodCollection.findOne({_id:new ObjectId(id)});
    res.send(foodData);
  })

  app.patch('/dashboard/food/:id', async (req,res)=>{
    const id = req.params.id;
    const updatedData = req.body;
    const result = await foodCollection.updateOne({_id:new ObjectId(id)},
    {$set: updatedData}
  );
    res.send(result);
  })

  app.delete('/dashboard/food/:id',async (req,res)=>{
    const id = req.params.id;
    const result = foodCollection.deleteOne({_id:new ObjectId(id)});
    res.send(result);
  })

 app.post('/user', async(req,res)=>{
  const user = req.body;
  const token = createToken(user);
  console.log(token)
  const isUserExist = await userCollection.findOne({email: user?.email})
  console.log(isUserExist)
  if(isUserExist?._id){
    return res.send({
      status:"success",
      message:"login success",
      token
    })
  }
  await userCollection.insertOne(user);
  res.send(token)
 })


 app.get('/user', async (req,res)=>{
  const userData = userCollection.find();
  const result = await userData.toArray();
  res.send(result);
})


 app.get('/user/get/:id', async (req,res)=>{
  const id = req.params.id;
  const result = await userCollection.findOne({_id:new ObjectId(id)});
  res.send(result);
 })

 app.get('/user/:email', async (req,res)=>{
  const email = req.params.email;
  const result = await userCollection.findOne({email});
  res.send(result);
 })

 app.patch('/user/:email', async (req,res)=>{
  const email = req.params.email;
  const userData = req.body;
  const result = await userCollection.updateOne({email},{$set: userData},{upsert:true});
  res.send(result);
 })
   
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req,res)=> {
    res.send('eaton server is running')
})

app.listen(port,() =>{
    console.log(`eaton server is running on port: ${port}`)
})