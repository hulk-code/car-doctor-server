const express = require('express')
const cors=require('cors')
const jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT|| 3000
app.use(cors({
  origin:['http://localhost:5173'],
  credentials:true,
}))
app.use(express.json())
app.use(cookieParser())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bw2yndc.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const servicesCollection=client.db('carCallection').collection('cardData')
    const bookingCollection=client.db('carCallection').collection('booking')

// token relted api using jwt and cookie
app.post('/jwt' , async(req ,res) =>{
  const user=req.body
  const token=jwt.sign(user ,process.env.ACCESS_TOKEN , { expiresIn: '1h' })
  
 
  console.log(user);
  res
  .cookie('token' ,token,{
    httpOnly:true,
    secure:false
   
  })
  .send({success:true})
})


//   get all data from database

    app.get('/services' , async(req ,res)=>{
        const cursor=servicesCollection.find();
        const result=await cursor.toArray();
        res.send(result);
    })



    // get specific id data from database
    app.get('/services/:id' , async(req ,res) =>{
        const id=req.params.id;
        const query={
            _id:new ObjectId(id)
        }
        const options={
            
                peojection :{title :1 , price:1 , service_id:1},
            }
        const result=await servicesCollection.findOne(query ,options);
        res.send(result)
    })


    // send data to the database for boking
    app.post('/bookings' , async(req , res) =>{
      const booking=req.body;
      console.log(booking)
      const result=await bookingCollection.insertOne(booking)
      res.send(result)
      
    })

    // get booking data by specific email
    // app.get('/bookings' , async(req ,res) =>{
    //   // let query={};
    //   const email=req.query.email

    //   // if(req.query?.email){
    //   //   query={
    //   //     email: req.query.email
    //   //   }
    //   // }
      
    //   const result=await bookingCollection .find(email).toArray();
    //   res.send(result)
    // })
    // booking data
    app.get('/bookings',async(req, res)=>{
      const email = req.query.email;
      console.log('tok tok token', req.cookies.token)
      console.log(email);
      const query = { email : email}
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    })

    //  delete data from booking
    app.delete('/bookings/:id' , async(req ,res) =>{
      const id=req.params.id
      const query={
        _id:new ObjectId(id)
      }
      const result=await bookingCollection.deleteOne(query)
      res.send(result)
    })

    // for update add cart
    app.patch('/bookings/:id' ,async(req ,res) =>{
      const id=req.params.id
      const filter={
        _id:new ObjectId(id)
      }
      const updateBooking=req.body;;
      console.log(updateBooking)
   

      const updateDoc={
        $set:{
          status:updateBooking.status
        },
      }
      const result=await bookingCollection.updateOne(filter,updateDoc)
      res.send(result)

    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})