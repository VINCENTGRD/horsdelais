document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (response.ok) {
            console.log('Login successful');
            window.location.href = 'analyse.html';
        } else {
            console.log('Login failed');
            document.getElementById('login-error').style.display = 'block';
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        document.getElementById('login-error').style.display = 'block';
    });
});

document.getElementById('register-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Register response:', data); // Log the response data
        if (data.message === "Utilisateur créé avec succès!") {
            document.getElementById('register-success').style.display = 'block';
            document.getElementById('register-error').style.display = 'none';
        } else {
            document.getElementById('register-error').style.display = 'block';
            document.getElementById('register-success').style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Register error:', error);
        document.getElementById('register-error').style.display = 'block';
        document.getElementById('register-success').style.display = 'none';
    });
});
