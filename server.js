const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;  // Utilisation d'une variable d'environnement pour le port

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Database setup
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
    db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, role TEXT)");
    console.log("Database created and table 'users' initialized");

    // Insert admin user
    const username = 'admin';
    const password = '0410';
    const hashedPassword = bcrypt.hashSync(password, 8);
    db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [username, hashedPassword, 'admin'], function(err) {
        if (err) {
            console.error('Error inserting admin user:', err);
        } else {
            console.log("Admin user created successfully");
        }    
    });
});

// Routes
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Nom d'utilisateur et mot de passe sont requis." });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);

    db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [username, hashedPassword, 'user'], function(err) {
        if (err) {
            console.error('Error inserting user:', err);
            return res.status(500).json({ success: false, message: "Erreur lors de la création de l'utilisateur." });
        }
        console.log("User created successfully:", username);
        res.status(201).json({ success: true, message: "Utilisateur créé avec succès!" });
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Nom d'utilisateur et mot de passe sont requis." });
    }

    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err) {
            console.error('Error selecting user:', err);
            return res.status(500).json({ success: false, message: "Erreur du serveur." });
        }
        if (!user) {
            console.log("User not found:", username);
            return res.status(404).json({ success: false, message: "Utilisateur non trouvé." });
        }

        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
            console.log("Invalid password for user:", username);
            return res.status(401).json({ success: false, message: "Mot de passe incorrect." });
        }

        if (user.role === 'admin') {
            console.log("Admin logged in successfully:", username);
            // Redirection vers analyse.html après connexion réussie de l'admin
            return res.redirect('/analyse.html');
        } else {
            console.log("User logged in successfully:", username);
            return res.redirect('/analysu.html');
        }
    });
});

// Route to get all users
app.get('/users', (req, res) => {
    db.all("SELECT id, username, role FROM users", (err, rows) => {
        if (err) {
            console.error('Erreur lors de la récupération des utilisateurs:', err);
            return res.status(500).json({ success: false, message: "Erreur lors de la récupération des utilisateurs." });
        }
        res.status(200).json({ success: true, users: rows });
    });
});

// Route to delete a user
app.delete('/users/:id', (req, res) => {
    const userId = req.params.id;

    db.run("DELETE FROM users WHERE id = ?", [userId], function(err) {
        if (err) {
            console.error('Erreur lors de la suppression de l\'utilisateur:', err);
            return res.status(500).json({ success: false, message: "Erreur lors de la suppression de l'utilisateur." });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: "Utilisateur non trouvé." });
        }
        console.log("Utilisateur supprimé avec succès:", userId);
        res.status(200).json({ success: true, message: "Utilisateur supprimé avec succès!" });
    });
});

// Serveur en écoute
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});
