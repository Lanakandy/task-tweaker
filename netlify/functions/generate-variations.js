// netlify/functions/generate-variations.js
import OpenAI from 'openai';

// Helper function to build the prompt string
function buildPrompt(details) {
    let promptText = "Generate creative, out-of-the-box variations of the `originalTask`. Aim for high student engagement/retention, possibly via novel twists.\n";

    if (details.studentInterests) {
        promptText += `Incorporate \`studentInterests\` (${details.studentInterests}) for relatable, engaging variations.\n`;
    }

    promptText += `Original Task: ${details.originalTask}\n`;
    promptText += `Learning Goal: ${details.learningGoal}\n`;
    promptText += `Student Age: ${details.studentAge}\n`;
    promptText += `Proficiency Level: ${details.proficiencyLevel}\n`;

    if (details.studentInterests) {
        promptText += `Student Interests: ${details.studentInterests}\n`;
    }
    if (details.specificConstraints) {
        promptText += `Specific Constraints: ${details.specificConstraints}\n`;
    } else {
        promptText += `Specific Constraints: None\n`;
    }

    promptText += "**All variations MUST align with `learningGoal`, suit `studentAge`/`proficiencyLevel`, and adhere to `specificConstraints`.**\n";
    promptText += "Vary these parameters—unconventionally, if possible. Combine parameters for innovative tasks, always respecting the above criteria:\n";
    promptText += "1. Change Partner/Interlocutor.\n";
    promptText += "2. Change Time Target (e.g., shorter limits).\n";
    promptText += "3. Change Information/Content Slightly.\n";
    promptText += "4. Change Mode/Format/Medium (e.g., speaking to writing, video, role-play).\n";
    promptText += "5. Change Purpose/Focus (e.g., accuracy, fluency, persuasion, humor, use feedback).\n";
    promptText += "6. Change Audience/Context (e.g., different setting or unusual audience).\n";
    promptText += "7. Change Level of Support (e.g., reduce scaffolding).\n";
    promptText += "8. Add Task for Audience/Listeners (e.g., specific observation task).\n";
    promptText += "9. Space Repetitions (design for review over increasing intervals).\n";
    promptText += "10. Add Gamification (e.g., points, badges, quests, challenges).\n";
    promptText += "11. Change the Teacher's Response (teacher's reaction or feedback).\n";
    // The prompt implicitly asks for an array of 6 strings by its structure.
    // We will reinforce this with a system message and JSON mode.

    return promptText;
}


export async function handler(event) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    try {
        const taskDetails = JSON.parse(event.body);

        const userPrompt = buildPrompt(taskDetails);

        // Note on model: "gpt-4.1-nano" is not a standard OpenAI model name.
        // Using "gpt-4o" as a capable current model.
        // Please verify the model you intend to use from OpenAI's documentation.
        // If "gpt-4.1-nano" is a specific internal or beta model you have access to, use that.
        const modelToUse = "gpt-4o"; // Or "gpt-4-turbo", "gpt-3.5-turbo" for cost-effectiveness

        const completion = await openai.chat.completions.create({
            model: gpt-4.1-nano,
            response_format: { type: "json_object" }, // Request JSON output
            messages: [
                {
                    role: "system",
                    content: "You are an expert in language pedagogy. Your goal is to generate creative, out-of-the-box variations of an original teaching task. Output exactly 6 distinct, actionable task variations. The output should be a JSON object with a single key 'variations' which holds an array of 6 strings. Each string should be a complete task variation description."
                },
                {
                    role: "user",
                    content: userPrompt
                }
            ],
            temperature: 0.7, // Adjust for creativity vs. predictability
            max_tokens: 1500, // Adjust as needed for 6 variations
        });

        const result = completion.choices[0].message.content;
        const parsedResult = JSON.parse(result); // Result should be a JSON string like {"variations": ["...", "..."]}

        if (!parsedResult.variations || !Array.isArray(parsedResult.variations) || parsedResult.variations.length === 0) {
             throw new Error("OpenAI returned an unexpected format or no variations.");
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify({ variations: parsedResult.variations }),
            headers: {
                'Content-Type': 'application/json',
            },
        };

    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to generate task variations.', details: error.message }),
            headers: {
                'Content-Type': 'application/json',
            },
        };
    }
}