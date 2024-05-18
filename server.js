const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Database setup
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
    db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)");
    console.log("Database created and table 'users' initialized");
});

// Routes
app.post('/register', (req, res) => {
    console.log('Received register request:', req.body); // Log received data
    const { username, password } = req.body;

    if (!username || !password) {
        console.log("Missing username or password"); // Log missing fields
        return res.status(400).send("Nom d'utilisateur et mot de passe sont requis.");
    }

    const hashedPassword = bcrypt.hashSync(password, 8);

    db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], function(err) {
        if (err) {
            console.error('Error inserting user:', err); // Log the error
            return res.status(500).send("Erreur lors de la création de l'utilisateur.");
        }
        console.log("User created successfully"); // Log success
        res.status(201).send({ message: "Utilisateur créé avec succès!" });
    });
});

app.post('/login', (req, res) => {
    console.log('Received login request:', req.body); // Log received data
    const { username, password } = req.body;

    if (!username || !password) {
        console.log("Missing username or password"); // Log missing fields
        return res.status(400).send("Nom d'utilisateur et mot de passe sont requis.");
    }

    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err) {
            console.error('Error selecting user:', err); // Log the error
            return res.status(500).send("Erreur du serveur.");
        }
        if (!user) {
            console.log("User not found"); // Log user not found
            return res.status(404).send("Utilisateur non trouvé.");
        }

        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
            console.log("Invalid password"); // Log invalid password
            return res.status(401).send("Mot de passe incorrect.");
        }

        console.log("User logged in successfully"); // Log successful login
        res.status(200).send("Connexion réussie!");
    });
});

app.get('/analyse.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'analyse.html'));
});

app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});
