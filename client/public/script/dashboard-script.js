document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const adminNameSpan = document.getElementById('adminName');
    const totalRegistrationsP = document.getElementById('totalRegistrations');
    const newRegistrationsP = document.getElementById('newRegistrations');
    const growthPercentageP = document.getElementById('growthPercentage');

    // Fetch admin name
    fetch('/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
        if (!res.ok) throw new Error('Failed to fetch admin data');
        return res.json();
    })
    .then(data => {
        // Assuming the user part of the message is what we want
        const name = data.message.split(', ')[1] || 'Admin';
        adminNameSpan.textContent = name;
    })
    .catch(err => {
        console.error('Error fetching admin data:', err);
        logout();
    });

    // Initial stats load
    refreshStats();

    // Refresh stats every 30 seconds
    setInterval(refreshStats, 30000);
});

function refreshStats() {
    const token = localStorage.getItem('token');
    const totalRegistrationsP = document.getElementById('totalRegistrations');
    const newRegistrationsP = document.getElementById('newRegistrations');
    const growthPercentageP = document.getElementById('growthPercentage');

    fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
        if (!res.ok) throw new Error('Failed to fetch stats');
        return res.json();
    })
    .then(data => {
        totalRegistrationsP.textContent = data.totalRegistrations || 0;
        newRegistrationsP.textContent = data.newRegistrations || 0;
        if (data.growth !== undefined) {
            const growth = parseFloat(data.growth);
            growthPercentageP.textContent = `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
        } else {
            growthPercentageP.textContent = 'N/A';
        }
    })
    .catch(err => {
        console.error('Error fetching stats:', err);
        totalRegistrationsP.textContent = 'N/A';
        newRegistrationsP.textContent = 'N/A';
        growthPercentageP.textContent = 'N/A';
    });
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}