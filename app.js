document.getElementById('upload-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const input = document.getElementById('file-input').files[0];
    if (!input) {
        alert("Veuillez sélectionner un fichier.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

        const result = worksheet.filter(row => {
            const maxTime = moment(row['Date/heure prévue de livraison'], 'M/D/YY H:mm');
            const deliveryTime = moment(row['Dates réalisées de livraison'], 'M/D/YY H:mm');
            return deliveryTime.isAfter(maxTime);
        }).map(row => ({
            Client: row['Code client'],
            'Numéro de compte': row['Référence 1'],
            'Numéro d\'ordre': row['Numéro d\'ordre'],
            Prestation: row['Code sous-prestation 1'],
            Tarif: row['Montant HT'],
            'Date/heure prévue de livraison': row['Date/heure prévue de livraison'],
            'Dates réalisées de livraison': row['Dates réalisées de livraison'],
            diffMinutes: calculateTimeDifference(row)
        }));

        displayResult(result);
    };
    reader.readAsArrayBuffer(input);
});

function calculateTimeDifference(row) {
    const maxTime = moment(row['Date/heure prévue de livraison'], 'M/D/YY H:mm');
    const deliveryTime = moment(row['Dates réalisées de livraison'], 'M/D/YY H:mm');
    return deliveryTime.diff(maxTime, 'minutes');
}

function displayResult(data) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = "<h2>Courses en retard :</h2>";
    if (data.length === 0) {
        resultDiv.innerHTML += "<p>Aucune course en retard.</p>";
    } else {
        const table = document.createElement('table');
        table.innerHTML = "<tr><th>Client</th><th>Numéro de compte</th><th>Numéro d'ordre</th><th>Prestation</th><th>Tarif</th><th>Date/heure prévue de livraison</th><th>Dates réalisées de livraison</th><th>Différence de temps (minutes)</th></tr>";
        data.forEach(row => {
            const tr = document.createElement('tr');
            const diffMinutes = row.diffMinutes;
            let classToAdd = '';
            if (diffMinutes < 10) {
                classToAdd = 'green-row';
            } else if (diffMinutes >= 10 && diffMinutes <= 15) {
                classToAdd = 'orange-row';
            } else {
                classToAdd = 'red-row';
            }
            tr.className = classToAdd;
            tr.innerHTML = `<td>${row['Client']}</td><td>${row['Numéro de compte']}</td><td>${row['Numéro d\'ordre']}</td><td>${row['Prestation']}</td><td>${row['Tarif']}</td><td>${row['Date/heure prévue de livraison']}</td><td>${row['Dates réalisées de livraison']}</td><td>${diffMinutes}</td>`;
            table.appendChild(tr);
        });
        resultDiv.appendChild(table);
    }
}
