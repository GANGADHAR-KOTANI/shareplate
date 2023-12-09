const express = require("express");
const path = require("path");
const firebase = require('firebase-admin');

const app = express();
const port = 3001;

// Initialize Firebase Admin SDK with your credentials
const serviceAccount = require('./path/to/serviceAccountKey.json');
firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: 'https://your-database-url.firebaseio.com'
});

const db = firebase.database();
const foodRef = db.ref('food');

app.use(express.static('public'));
app.use(express.json());

// Endpoint to get food data
app.get('/api/food', (req, res) => {
    foodRef.once('value', snapshot => {
        const data = snapshot.val();
        res.json({ food: data });
    }).catch(error => {
        res.status(500).json({ error: error.message });
    });
});

// Endpoint to post food data
app.post('/api/food', (req, res) => {
    const { foodItem } = req.body;
    const newFoodRef = foodRef.push();
    newFoodRef.set(foodItem)
        .then(() => {
            res.json({ message: 'Food item added successfully.' });
        })
        .catch(error => {
            res.status(500).json({ error: error.message });
        });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
