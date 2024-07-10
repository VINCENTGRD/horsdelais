document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyze-btn');
    const createUserBtn = document.getElementById('create-user-btn');
    const analyzeSection = document.getElementById('analyze-section');
    const createUserSection = document.getElementById('create-user-section');
    const uploadForm = document.getElementById('upload-form');
    const registerForm = document.getElementById('register-form');


    analyzeBtn.addEventListener('click', () => {
        analyzeSection.style.display = 'block';
        createUserSection.style.display = 'none';
    });


    createUserBtn.addEventListener('click', () => {
        createUserSection.style.display = 'block';
        analyzeSection.style.display = 'none';
    });


    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const fileInput = document.getElementById('file-input');
        const file = fileInput.files[0];
        if (!file) {
            alert('Veuillez sélectionner un fichier.');
            return;
        }


        const formData = new FormData();
        formData.append('file', file);


        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });


            if (response.ok) {
                const result = await response.json();
                console.log('Analyse réussie:', result);
                // Ici, vous pouvez traiter ou afficher le résultat de l'analyse si nécessaire
            } else {
                console.error('Erreur lors de l\'analyse du fichier.');
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi de la requête d\'analyse:', error);
        }
    });


    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = document.getElementById('reg-username').value;
        const password = document.getElementById('reg-password').value;


        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });


            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    document.getElementById('register-success').style.display = 'block';
                    document.getElementById('register-error').style.display = 'none';
                } else {
                    document.getElementById('register-error').style.display = 'block';
                    document.getElementById('register-success').style.display = 'none';
                }
            } else {
                console.error('Erreur lors de la création de l\'utilisateur.');
                document.getElementById('register-error').style.display = 'block';
                document.getElementById('register-success').style.display = 'none';
            }
        } catch (error) {
            console.error('Erreur lors de la requête de création de l\'utilisateur:', error);
            document.getElementById('register-error').style.display = 'block';
            document.getElementById('register-success').style.display = 'none';
        }
    });
});
