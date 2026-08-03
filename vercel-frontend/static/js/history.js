document.addEventListener("DOMContentLoaded", async () => {
    const response = await fetch(API_BASE + '/api/history');
    const data = await response.json();
    const tbody = document.getElementById('history-body');
    tbody.innerHTML = '';
    
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No history found in database.</td></tr>';
        return;
    }

    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(item.timestamp).toLocaleString()}</td>
            <td>${item.location}</td>
            <td>${item.area}</td>
            <td>${item.bhk}</td>
            <td>₹${item.predicted_price} Lakh</td>
            <td>
                <a href="${API_BASE}/download-report?id=${item.id}" class="btn-small btn-pdf">PDF</a>
                <button class="btn-small btn-del" onclick="deleteHistory(${item.id})">Del</button>
            </td>
        `;
        tbody.appendChild(row);
    });
});

async function deleteHistory(id) {
    if(confirm("Delete this record from the database?")) {
        await fetch(`${API_BASE}/history/${id}`, { method: 'DELETE' });
        window.location.reload();
    }
}
