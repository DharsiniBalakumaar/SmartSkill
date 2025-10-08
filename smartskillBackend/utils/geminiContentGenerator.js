// File: smartskillBackend/utils/geminiContentGenerator.js

const generateKeywords = require('./keywordGenerator'); 

/**
 * Generates official justification and extracts keywords using the Gemini API.
 * @param {object} question - The question object from MongoDB.
 * @param {object} ai - The initialized GoogleGenAI client (passed from index.js).
 * @returns {object} { justification: String, keywords: String[] }
 */
async function generateOfficialContent(question, ai) {
    // Determine the Correct Option Text dynamically
    const correctOptionKey = question.Correct_Option; 
    const correctOptionText = question[correctOptionKey];

    // Construct the Prompt for Gemini
    const prompt = `
        You are an expert quiz content generator. Your task is to provide a brief, accurate justification for the following multiple-choice question.
        
        Question: ${question.Question}
        Correct Answer: ${correctOptionText}

        The justification should be a concise paragraph (2-3 sentences) explaining WHY the correct option is right.
        
        The final output MUST be a single JSON object with two keys:
        1. "justification": The full explanation text.
        2. "keywords_string": A comma-separated string of the 5 to 10 most important technical and subject-specific terms from the justification.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: 'object',
                    properties: {
                        justification: { type: 'string' },
                        keywords_string: { type: 'string' },
                    },
                    required: ['justification', 'keywords_string'],
                },
            },
        });

        const jsonResponse = JSON.parse(response.text);
        
        const keywordsArray = generateKeywords(jsonResponse.keywords_string);

        return {
            justification: jsonResponse.justification,
            keywords: keywordsArray,
        };

    } catch (error) {
        console.error(`Gemini Content Generation Error for QID ${question._id}:`, error.message);
        return { justification: null, keywords: [] };
    }
}

module.exports = generateOfficialContent;