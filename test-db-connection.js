const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Zero-dependency .env parser
function loadEnv() {
    try {
        const envFiles = ['.env.local', '.env'];
        for (const file of envFiles) {
            const envPath = path.resolve(process.cwd(), file);
            if (fs.existsSync(envPath)) {
                console.log(`Loading env from: ${file}`);
                const content = fs.readFileSync(envPath, 'utf8');
                const env = {};
                content.split('\n').forEach(line => {
                    const match = line.match(/^([^=]+)=(.*)$/);
                    if (match) {
                        const key = match[1].trim();
                        let value = match[2].trim();
                        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                            value = value.slice(1, -1);
                        }
                        env[key] = value;
                    }
                });
                return env;
            }
        }
        console.error('❌ No .env or .env.local file found!');
        return {};
    } catch (e) {
        console.error('Error parsing .env.local:', e);
        return {};
    }
}

async function testConnection() {
    console.log('--- DIAGNOSTIC START ---');

    const env = loadEnv();
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        console.error('❌ Missing ENV variables in .env.local');
        console.log('Found keys:', Object.keys(env));
        return;
    }

    console.log('URL:', supabaseUrl);

    // 1. Test with Service Role (Should BYPASS RLS)
    console.log('\nTesting SERVICE ROLE (Admin Bypass)...');
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false }
    });

    // Check Pickups
    const { data: pickupsAdmin, error: pickupError } = await supabaseAdmin.from('pickups').select('id, status');
    if (pickupError) {
        console.error('❌ Service Role Pickups Error:', pickupError);
    } else {
        console.log(`✅ Service Role Pickups Found: ${pickupsAdmin.length}`);
        if (pickupsAdmin.length > 0) {
            const counts = {};
            pickupsAdmin.forEach(p => counts[p.status] = (counts[p.status] || 0) + 1);
            console.log('   Status Breakdown:', counts);
        }
    }

    // Check Requests
    const { data: requestsAdmin, error: reqError } = await supabaseAdmin.from('verification_requests').select('id, status');
    if (reqError) {
        console.error('❌ Service Role Requests Error:', reqError);
    } else {
        console.log(`✅ Service Role Requests Found: ${requestsAdmin.length}`);
    }


    // 2. Test with Anon Key (Should likely be BLOCKED/EMPTY due to RLS)
    console.log('\nTesting ANON KEY (Public Client)...');
    const supabaseAnon = createClient(supabaseUrl, anonKey);
    const { count: anonCount, error: anonError } = await supabaseAnon.from('pickups').select('*', { count: 'exact', head: true });

    if (anonError) console.log('ℹ️ Anon Key Error:', anonError.message);
    else console.log(`ℹ️ Anon Key Pickups Visible: ${anonCount}`);

    console.log('--- DIAGNOSTIC END ---');
}

testConnection();
