// File: smartskillBackend/utils/geminiContentGenerator.js (FIXED FOR OPENROUTER/OPENAI)

// NOTE: No change needed to require('./keywordGenerator') as it's a local utility.
const generateKeywords = require('./keywordGenerator'); 

/**
 * Generates official justification and extracts keywords using the OpenRouter/OpenAI API.
 * @param {object} question - The question object from MongoDB.
 * @param {object} ai - The initialized OpenAI client (which connects to OpenRouter).
 * @returns {object} { success: Boolean, justification: String, keywords: String[] }
 */
async function generateOfficialContent(question, ai) {
    
    // 1. Prepare Inputs
    const correctOptionKey = question.Correct_Option; 
    // Safely retrieve the correct option text
    const correctOptionText = question[correctOptionKey] || 'N/A'; 

    const systemPrompt = `
        You are an expert quiz content generator. Your task is to provide a brief, accurate justification and extract relevant keywords for the question.
        The justification must be a concise paragraph (2-3 sentences) explaining WHY the correct answer is right.
        
        The final output MUST be a single JSON object with two keys:
        1. "justification": The full explanation text.
        2. "keywords_string": A comma-separated string of 5 to 10 subject-specific terms from the justification.
        Do not include any text outside the JSON block.
    `;
    
    const userPrompt = `
        Question: ${question.Question}
        Correct Answer: ${correctOptionText}
    `;

    try {
        // 📢 CRITICAL FIX: Changed from ai.chat.completions.create to ai.completions.create 
        // to resolve "Cannot read properties of undefined (reading 'completions')"

        const completion = await ai.completions.create({
            // Note: We use an instruction model, which works better with the completions endpoint
            model: 'google/gemini-2.5-flash', 
            // We combine the system and user messages into a single prompt for the completions endpoint
            prompt: systemPrompt + "\n\n" + userPrompt + "\n\nFINAL JSON OUTPUT:", 
            max_tokens: 500, // Increase max tokens slightly for output JSON
            temperature: 0.1,
            // The OpenAI 'completions' endpoint does not officially support response_format: 'json_object', 
            // so we rely heavily on the prompt and the model's ability to output JSON.
            // NOTE: If this fails, switch to a model that has an instruction/completion variant.
        });
        
        // Extract content from the completions response
        const rawJsonText = completion.choices[0].text.trim(); 
        
        // Attempt to parse the JSON
        const jsonResponse = JSON.parse(rawJsonText);
        
        // 2. Process Keywords
        const keywordsArray = generateKeywords(jsonResponse.keywords_string);

        // 3. Return Successful Response
        return {
            success: true,
            justification: jsonResponse.justification,
            keywords: keywordsArray,
        };

    } catch (error) {
        // Ensure you log the full error for debugging API failures
        console.error(`❌ CRITICAL AI GENERATION ERROR (OpenRouter/Gemini):`, error.message, error.stack);
        
        // 4. Return robust failure object
        return { 
            success: false, 
            justification: 'Server failed to generate detailed justification. Check console for API error.', 
            keywords: ['Concept'] 
        };
    }
}

module.exports = generateOfficialContent;