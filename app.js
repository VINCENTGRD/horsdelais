// Function to check if the user is admin
function checkAdmin() {
    fetch('/is_admin', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.is_admin) {
            document.getElementById('create-user-btn').style.display = 'block';
        } else {
            document.getElementById('create-user-btn').style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    checkAdmin();
});

// Existing code
document.getElementById('analyze-btn').addEventListener('click', function() {
    document.getElementById('choice').style.display = 'none';
    document.getElementById('analyze-section').style.display = 'block';
    document.getElementById('create-user-section').style.display = 'none';
});

document.getElementById('create-user-btn').addEventListener('click', function() {
    document.getElementById('choice').style.display = 'none';
    document.getElementById('analyze-section').style.display = 'none';
    document.getElementById('create-user-section').style.display = 'block';
});

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

    const coursesPlus15min = [];
    const coursesMoins15min = [];

    data.forEach(row => {
        const diffMinutes = row.diffMinutes;
        if (diffMinutes > 15) {
            coursesPlus15min.push(row);
        } else {
            coursesMoins15min.push(row);
        }
    });

    if (coursesPlus15min.length > 0) {
        resultDiv.innerHTML += "<h3>Courses avec plus de 15 minutes de retard :</h3>";
        const plus15minTable = createTable(coursesPlus15min);
        resultDiv.appendChild(plus15minTable);
    }

    if (coursesMoins15min.length > 0) {
        resultDiv.innerHTML += "<h3>Courses avec moins de 15 minutes de retard :</h3>";
        const moins15minTable = createTable(coursesMoins15min);
        resultDiv.appendChild(moins15minTable);
    }

    const downloadBtnExcel = document.createElement('button');
    downloadBtnExcel.textContent = 'Télécharger Excel';
    downloadBtnExcel.addEventListener('click', () => downloadExcel(data));
    resultDiv.appendChild(downloadBtnExcel);
}

function createTable(data) {
    const table = document.createElement('table');
    table.innerHTML = "<tr><th>Client</th><th>Numéro de compte</th><th>Numéro d'ordre</th><th>Prestation</th><th>Tarif</th><th>Date/heure prévue de livraison</th><th>Dates réalisées de livraison</th><th>Différence de temps (minutes)</th></tr>";
    data.forEach(row => {
        const tr = document.createElement('tr');
        const diffMinutes = row.diffMinutes;
        let classToAdd = '';
        if (diffMinutes <= 15) {
            classToAdd = 'green-row';
        } else {
            classToAdd = 'red-row';
        }
        tr.className = classToAdd;

        Object.keys(row).forEach(key => {
            const td = document.createElement('td');
            td.textContent = row[key];
            tr.appendChild(td);
        });

        table.appendChild(tr);
    });
    return table;
}

function workbook2blob(workbook) {
    const wopts = { bookType: 'xlsx', bookSST: false, type: 'array' };
    const wbout = XLSX.write(workbook, wopts);
    return new Blob([wbout], { type: 'application/octet-stream' });
}

function downloadExcel(data) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Courses en retard");
    const excelBlob = workbook2blob(workbook);
    saveAs(excelBlob, 'courses_en_retard.xlsx');
}
