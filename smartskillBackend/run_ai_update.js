// File: run_ai_update.js (FINAL VERSION with Retry Logic)

const fetch = require('node-fetch'); 

// Utility to pause execution for a given time
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// --- Configuration ---
const API_URL = 'http://localhost:5000/questions/generate-content-ai';
const MAX_CONSECUTIVE_FAILURES = 5;
const RETRY_DELAY_MS = 60000; // 60 seconds delay after a failure
// ---------------------

async function runUpdate() {
    console.log('Starting AI Content Generation Cleanup...');
    let consecutiveFailures = 0;
    let questionsRemaining = true;
    let totalProcessed = 0;

    while (questionsRemaining && consecutiveFailures < MAX_CONSECUTIVE_FAILURES) {
        
        console.log(`\n--- Attempting to process remaining questions (Total done: ${totalProcessed}) ---`);
        
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });

            if (!response.ok) {
                // If the server returns an HTTP error (500)
                console.error(`❌ Request failed with status: ${response.status}`);
                const errorText = await response.text();
                console.error('Server Response:', errorText.substring(0, 200) + '...');
                
                // Check if the error is due to rate limits (Status 429 is often returned by a proxy/load balancer)
                if (response.status === 429 || errorText.includes('Quota exceeded')) {
                    consecutiveFailures++;
                    console.log(`⚠️ Quota hit! Waiting ${RETRY_DELAY_MS / 1000} seconds before next attempt.`);
                    await sleep(RETRY_DELAY_MS);
                    continue; // Skip the rest of the loop and try again
                }
                
                // Handle non-quota server errors gracefully
                consecutiveFailures = MAX_CONSECUTIVE_FAILURES; // Break loop on fatal error
                break;
            }

            const data = await response.json();
            
            totalProcessed += data.count;
            console.log(`✅ Success! Processed ${data.count} new questions. Total done: ${totalProcessed}`);

            if (data.count === 0) {
                // No more questions match the criteria: we are finished!
                questionsRemaining = false;
            } else if (data.count < 50) {
                 // Processed a small batch, maybe running low, take a small breather
                 console.log(`Sleeping for 10 seconds before checking again...`);
                 await sleep(10000);
            }
            
            consecutiveFailures = 0; // Reset failure counter on success

        } catch (error) {
            // Network error (e.g., server went offline)
            consecutiveFailures++;
            console.error(`❌ Network/Fetch Error (${consecutiveFailures}/${MAX_CONSECUTIVE_FAILURES}): ${error.message}`);
            
            if (consecutiveFailures < MAX_CONSECUTIVE_FAILURES) {
                console.log(`Waiting ${RETRY_DELAY_MS / 1000} seconds before retrying...`);
                await sleep(RETRY_DELAY_MS);
            }
        }
    }

    if (!questionsRemaining) {
        console.log(`\n🎉🎉 ALL QUESTIONS PROCESSED! Cleanup complete.`);
    } else {
        console.log(`\n🚨 Failed to complete after ${MAX_CONSECUTIVE_FAILURES} retries. Please check your API key and daily quota.`);
    }
}

runUpdate();