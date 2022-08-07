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
const enrollCollection = client.db('techokids').collection('enrolls');
const teacherCollection = client.db('techokids').collection('teachers');


app.get('/course', async(req, res) => {
    const query = {};
    const cursor = courseCollection.find(query);
    const services = await cursor.toArray();
    res.send(services);
});

app.get('/enroll', async(req, res) => {
    const enrolls = await enrollCollection.find().toArray();
    res.send(enrolls);
})

app.get('/enroll', async(req, res) => {
    const student = req.query.student;
    const query = {student: student};
    const enrolls = await enrollCollection.find(query).toArray();
    res.send(enrolls);
})


app.post('/enroll', async(req, res) => {
    const enroll = req.body;
    const query = {courseName: enroll.courseName, date: enroll.date, student: enroll.student}
    const exists = await enrollCollection.findOne(query);
    if(exists){
        return res.send({success: false, enroll: exists})
    }
    const result = await enrollCollection.insertOne(enroll);
    return res.send({success: true, result});
});


app.post('/teacher', async(req, res) => {
  const teacher = req.body;
  const result = await teacherCollection.insertOne(teacher);
  res.send(result);
});


app.get('/available', async(req, res) => {
    const date = req.query.date ;
    const courses = await courseCollection.find().toArray();
    const query = {date: date};
    const enrolls = await enrollCollection.find(query).toArray();
    courses.forEach(course => {
        const courseEnrolls = enrolls.filter( book => book.courseName === course.name);
        const enrolledslots = courseEnrolls.map(book => book.slot);
        const available = course.slots.filter(slot => !enrolledslots.includes(slot));
        course.slots = available;
    })
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