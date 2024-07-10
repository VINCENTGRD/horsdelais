function createUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;


    // Exemple de requête POST avec fetch
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (response.ok) {
            alert('Utilisateur créé avec succès!');
            // Rafraîchir la page ou faire d'autres actions nécessaires
        } else {
            alert('Erreur lors de la création de l\'utilisateur.');
        }
    })
    .catch(error => {
        console.error('Erreur lors de la création de l\'utilisateur:', error);
    });
}


