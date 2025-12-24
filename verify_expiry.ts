import { formatTimeUntilExpiry } from './src/utils/priority';

// Mock implementation matching src/components/PriorityBadge.tsx logic
function getBadgeText(expiryDateStr: string) {
    const now = new Date();
    const expiry = new Date(expiryDateStr);
    const diffMs = expiry.getTime() - now.getTime();
    const hoursLeft = diffMs / (1000 * 60 * 60);

    console.log(`Input: ${expiryDateStr} | Now: ${now.toISOString()} | HoursLeft: ${hoursLeft.toFixed(2)}`);

    if (hoursLeft <= 0) return 'Expired';
    if (hoursLeft < 1) return `${Math.round(hoursLeft * 60)} min left`; // Changed to match component
    if (hoursLeft < 2) return `${Math.round(hoursLeft * 60)} min left`; // Component actually uses < 2 for min? or was it < 1?
    // Let's check the code I wrote in PriorityBadge.tsx
    if (hoursLeft < 2) return `${Math.round(hoursLeft * 60)} min left`; // Re-reading my previous replace_file_content...
    // Actually, checking Step 1873 output:
    // } else if (hoursLeft < 2) { text = `${Math.round(hoursLeft * 60)} min left` }

    if (hoursLeft < 6) return `${Math.round(hoursLeft)} hrs left`;
    if (hoursLeft < 24) return `${Math.round(hoursLeft)} hrs left`;
    return `${Math.round(hoursLeft / 24)} days left`;
}

// Test cases
const now = new Date();
const tests = [
    { name: "30 mins", offset: 30 * 60 * 1000 },
    { name: "90 mins (1.5 hrs)", offset: 90 * 60 * 1000 },
    { name: "5.5 hours", offset: 5.5 * 60 * 60 * 1000 },
    { name: "23 hours", offset: 23 * 60 * 60 * 1000 },
    { name: "25 hours (1.04 days)", offset: 25 * 60 * 60 * 1000 },
    { name: "36 hours (1.5 days)", offset: 36 * 60 * 60 * 1000 },
    { name: "47 hours (1.95 days)", offset: 47 * 60 * 60 * 1000 },
];

console.log("--- Verifying Expiry Badge Logic ---");
tests.forEach(t => {
    const target = new Date(now.getTime() + t.offset);
    console.log(`Case: ${t.name} -> Result: "${getBadgeText(target.toISOString())}"`);
});
