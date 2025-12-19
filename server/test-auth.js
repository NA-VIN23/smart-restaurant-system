
// Using global fetch (Node 18+)

// If running within a restricted environment, use the global fetch if available (Node 18+)
// Otherwise, we'll try to rely on the environment having it. 
// For this environment, we'll assume Node 18+ or standard fetch availability.

const BASE_URL = 'http://localhost:3000/api/auth';

async function testAuth() {
    const testUser = {
        name: 'Test Manager',
        email: `manager_${Date.now()}@test.com`,
        password: 'password123',
        role: 'Manager',
        contact_info: '123-456-7890'
    };

    console.log('1. Registering User...');
    try {
        const regRes = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });
        const regData = await regRes.json();
        console.log('Register Response:', regData);

        if (regRes.status !== 201) {
            throw new Error('Registration failed');
        }

        console.log('2. Logging in...');
        const loginRes = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testUser.email, password: testUser.password })
        });
        const loginData = await loginRes.json();
        console.log('Login Response:', loginData);

        if (loginData.token) {
            console.log('✅ Auth Flow Success! Token received.');
        } else {
            console.log('❌ Auth Flow Failed. No token.');
        }

    } catch (err) {
        console.error('❌ Test Failed:', err);
    }
}

testAuth();
