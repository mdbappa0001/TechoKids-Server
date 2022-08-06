const express = require("express")
const app = express();
const port = process.env.PORT || 5000
const cors = require("cors")
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require('mongodb');

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3bzrn0l.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
try{
await client.connect();
const courseCollection = client.db('techokids').collection('courses');
const enrollCollection = client.db('techokids').collection('enrolls')


app.get('/course', async(req, res) => {
    const query = {};
    const cursor = courseCollection.find(query);
    const services = await cursor.toArray();
    res.send(services);
});


app.post('/enroll', async(req, res) => {
    const enroll = req.body;
    const query = {courseName: enroll.courseName, date: enroll.date, student: enroll.student}
    const exists = await enrollCollection.findOne(query);
    if(exists){
        return res.send({success: false, enroll: exists})
    }
    const result = await enrollCollection.insertOne(enroll);
    return res.send({success: true, result});
})


}
finally{

}
}

run().catch(console.dir);



app.get('/', (req, res) =>{
    res.send('Hello From Techokids')
})

app.listen(port, () =>{
    console.log(`Techokids listening on port ${port}`);
})