const res = await fetch('http://localhost:3001/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'micaello', password: 'micaellodev' }),
});
const data = await res.json();
console.log('Status:', res.status);
console.log('Body:', JSON.stringify(data, null, 2));
//# sourceMappingURL=test-login.js.map