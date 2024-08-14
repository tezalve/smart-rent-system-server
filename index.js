const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.vvdmedc.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect();

        const users = client.db('smart-rent-system').collection('users');
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        app.get('/users', async (req, res) => {
            const cursor = users.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/individual/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const user = await users.findOne(query);
            res.send(user);
        })
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.log);

app.get('/', (req, res) => {
    res.send('SRS is running');
})

app.listen(port, () => {
    console.log(`AA is running on port ${port}`);
})