"use server"
import { OpenAI } from "openai"
import {GoogleGenerativeAI} from "@google/generative-ai"

// WIP
// WILL PROBABLY NEED TO MAKE THIS MULTI TURN CHAT


export const generateCreativePrompt = async (userPrompt: string) => {
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

    const finalPrompt = `
    
    You are a helpful AI assistant that creates outlines for presentations.
    Create a coherent and relevant outline for the following prompt: ${userPrompt}.
    The outline should consist of at least 4 points, with
    each point written as a single sentence with 10 or less words.
    Ensure the outline is well-structured and directly related to the topic.
    Return the output in the following JSON format:
    {
    "outlines":[
        "Point 1",
        "Point 2",
        "Point 3",
        "Point 4"
        ]
    }

    Ensure that the JSON is valid and properly formatted. Do not include any other text or explanations outside the JSON.`

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash"});

        console.log("Sending request to Gemini API...");
        const result = await model.generateContent(finalPrompt);
        const response = result.response;

        if(response){
            try {
                let responseText = response.text();
                // Clean the response text to remove potential markdown
                if (responseText.startsWith("```json")) {
                    responseText = responseText.substring(7, responseText.length - 3).trim();
                } else if (responseText.startsWith("```")) {
                    responseText = responseText.substring(3, responseText.length - 3).trim();
                }
                const jsonResponse = JSON.parse(responseText);
                return {status: 200, data: jsonResponse}
            } catch (error) {
                console.error(error)
                console.log(response.text())
                return {status: 500, message: "Invalid JSON response"}
            }
        }
        return {status: 400, message: "No response from Gemini API"}
    } catch (error) {
        console.error(error)
        return {status: 500, message: "Outer error when generating outline"}
    }
}