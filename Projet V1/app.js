console.log("app.js is loaded");
console.log(XLSX); // Vérifiez que XLSX est défini

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
        
        console.log("Worksheet data:", worksheet);

        const result = worksheet.filter(row => {
            const maxTime = moment(row['Date/heure prévue de livraison'], 'M/D/YY H:mm').toDate();
            const deliveryTime = moment(row['Dates réalisées de livraison'], 'M/D/YY H:mm').toDate();
            
            // Debug: Log each row's dates
            console.log(`Max Time: ${maxTime}, Delivery Time: ${deliveryTime}`);
            
            return deliveryTime > maxTime;
        });

        displayResult(result);
    };
    reader.readAsArrayBuffer(input);
});

function displayResult(data) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = "<h2>Courses en retard :</h2>";
    if (data.length === 0) {
        resultDiv.innerHTML += "<p>Aucune course en retard.</p>";
    } else {
        const table = document.createElement('table');
        table.innerHTML = "<tr><th>Client</th><th>Date/heure prévue de livraison</th><th>Dates réalisées de livraison</th></tr>";
        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${row['Client']}</td><td>${row['Date/heure prévue de livraison']}</td><td>${row['Dates réalisées de livraison']}</td>`;
            table.appendChild(tr);
        });
        resultDiv.appendChild(table);
    }
}
