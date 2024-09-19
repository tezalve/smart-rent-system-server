const express = require('express');
const app = express();
const cors = require('cors');
const body_parser = require('body-parser')
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// app.use(cors());
app.use(cors({
    credentials: true, 
    origin: ('http://localhost:5173','https://smart-rent-system.web.app')
}));
// app.use(cors({credentials: true, origin: 'https://smart-rent-system.web.app'}));
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.vvdmedc.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.use('/api', require('./routes/routes'))

app.get('/hello', (req, res) => {
    res.send('hello');
})

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const users = client.db('smart-rent-system').collection('users');
        const properties = client.db('smart-rent-system').collection('properties');
        const bookedproperties = client.db('smart-rent-system').collection('bookedproperties');

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");

        app.get('/users', async (req, res) => {
            const cursor = users.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/properties', async (req, res) => {
            const cursor = properties.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/individual/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const user = await users.findOne(query);
            if (user){
                res.send(user);
            }
        })

        app.get('/inproperties/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const cursor = properties.find(query);
            if ((await properties.countDocuments(query)) === 0) {
                console.log("No documents found!");
            }
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post('/addproperty', async (req, res) => {
            const doc = req.body;
            console.log(doc);
            const result = await properties.insertOne(doc);
            res.send(result);
        })

        app.post('/adduser', async (req, res) => {
            const doc = req.body;
            const query = { email: doc.email }
            const user = await users.findOne(query);
            if (user == null) {
                const result = await users.insertOne(doc);
                res.send(result);
                console.log("New user");
            } else {
                console.log("Old user");
            }
        })

        app.patch('/updateuser/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const options = { upsert: false };
            const updateDoc = {
                $set: {
                    role: req.body.role
                },
            };
            const result = await users.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        app.patch('/updatepropertystatus/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: false };
            const updateDoc = {
                $set: {
                    status: req.body.status
                },
            };
            const result = await properties.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        app.put('/updateproperty', async (req, res) => {
            const doc = req.body;
            const filter = { _id: new ObjectId(doc._id) };
            const options = { upsert: false };
            const updateDoc = {
                $set: {
                    image: doc.image,
                    building_name: doc.building_name,
                    flat_name: doc.flat_name,
                    location: doc.location,
                    rent: doc.rent,
                    size: doc.size,
                    availability: doc.availability,
                },
            };
            console.log('updated class: ', updateDoc);
            const result = await properties.updateOne(filter, updateDoc, options);
            res.send(result);
            console.log(
                `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
            );
        })

        app.get('/property/:id', async (req, res) => {
            const id = new ObjectId(req.params.id);
            const result = await properties.findOne({ _id: id });
            res.send(result);
        })

        app.get('/approvedproperties', async (req, res) => {
            const query = { status: 'approved' };
            const cursor = properties.find(query);
            if ((await properties.countDocuments(query)) === 0) {
                console.log("No documents found!");
            }
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post('/bookproperty', async (req, res) => {
            const doc = req.body;
            const result = await bookedproperties.insertOne(doc);
            res.send(result);
        })

        app.get('/bookedproperties/:email', async (req, res) => {
            const email = req.params.email;
            console.log(email);
            const query = { user_email: email, deleted: false};
            const cursor = bookedproperties.find(query);
            if ((await bookedproperties.countDocuments(query)) === 0) {
                console.log("No documents found!");
            }
            const result = await cursor.toArray();
            res.send(result);
        })

        app.put('/deletebookedproperty', async (req, res) => {
            const doc = req.body;
            const filter = { _id: new ObjectId(doc._id) };
            const options = { upsert: false };
            const updateDoc = {
                $set: {
                    deleted: doc.deleted,
                },
            };
            console.log('updated class: ', updateDoc);
            const result = await bookedproperties.updateOne(filter, updateDoc, options);
            res.send(result);
            console.log(
                `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
            );
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
    console.log(`SRS is running on port ${port}`);
})