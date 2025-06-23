document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const tbody = document.querySelector('#registrationTable tbody');

    fetch('http://localhost:5000/api/admin/registrations', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => {
        if (res.status === 401) {
            logout();
            throw new Error('Unauthorized');
        }
        if (!res.ok) {
            throw new Error('Failed to fetch registrations');
        }
        return res.json();
    })
    .then(data => {
        tbody.innerHTML = ''; // Clear existing rows
        if (data.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="4" style="text-align:center;">No registrations found.</td>`;
            tbody.appendChild(row);
            return;
        }

        data.forEach(reg => {
            const row = document.createElement('tr');
            row.dataset.id = reg._id;
            row.innerHTML = `
                <td>${reg.name}</td>
                <td>${reg.phone}</td>
                <td>${reg.email}</td>
                <td class="actions-cell">
                    <button class="view-btn" onclick="viewReg('${reg._id}')"><i class="fas fa-eye"></i> View</button>
                    <button class="delete-btn" onclick="deleteReg('${reg._id}')"><i class="fas fa-trash-alt"></i> Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    })
    .catch(err => {
        console.error('Error:', err.message);
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="4" style="text-align:center;">Error loading data. Please try again later.</td>`;
        tbody.appendChild(row);
    });
});

function viewReg(id) {
    console.log(`View registration ${id}`);
    // Future implementation: redirect to a details page or show a modal
    // window.location.href = `registration-details.html?id=${id}`;
}

function deleteReg(id) {
    if (!confirm('Are you sure you want to delete this registration?')) {
        return;
    }
    const token = localStorage.getItem('token');
    fetch(`/api/admin/registrations/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => {
        if (!res.ok) {
            throw new Error('Failed to delete registration');
        }
        return res.json();
    })
    .then(data => {
        console.log(data.message);
        // Remove the row from the table
        const row = document.querySelector(`tr[data-id='${id}']`);
        if (row) {
            row.remove();
        }
    })
    .catch(err => {
        console.error('Error:', err.message);
        // Optionally show an error message to the user
    });
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}