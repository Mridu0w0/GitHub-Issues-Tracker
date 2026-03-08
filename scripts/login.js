function handleLogin() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');

    if (user === 'admin' && pass === 'admin123') {
        alert('Login successful!');
        window.location.assign('dashboard.html');
    } else {
        // Fail! Show error
        errorMsg.classList.remove('hidden');
    }
}