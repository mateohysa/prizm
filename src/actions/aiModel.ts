"use server"
import { OpenAI } from "openai"
import {Content, GoogleGenerativeAI} from "@google/generative-ai"
import { Theme, ContentType, Slide, ContentItem } from "@/lib/types"
import { currentUser } from "@clerk/nextjs/server"
import { client } from "@/lib/prisma"
import { v4 as uuidv4 } from 'uuid';
import { Images } from "lucide-react"

// WIP
// WILL PROBABLY NEED TO MAKE THIS MULTI TURN CHAT

/**
 * Generate AI outlines
 * 1. Initialize GoogleGenerativeAI with API key
 * 2. Build prompt instructing outline creation
 * 3. Send request to Gemini model
 * 4. Clean markdown and parse JSON response
 * 5. Return outline data or error
 */
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
                console.error("❌ ERROR:", error)
                console.log(response.text())
                return {status: 500, message: "Invalid JSON response"}
            }
        }
        return {status: 400, message: "No response from Gemini API"}
    } catch (error) {
        console.error("❌ ERROR:", error)
        return {status: 500, message: "Outer error when generating outline"}
    }
}

const existingLayouts = [
    {
      id: uuidv4(),
      slideName: "Blank card",
      type: "blank-card",
      className: "p-8 mx-auto flex justify-center items-center min-h-[200px]",
      content: {
        id: uuidv4(),
        type: "column" as ContentType,
        name: "Column",
        content: [
          {
            id: uuidv4(),
            type: "title" as ContentType,
            name: "Title",
            content: "",
            placeholder: "Untitled Card",
          },
        ],
      },
    },
  
    {
      id: uuidv4(),
      slideName: "Accent left",
      type: "accentLeft",
      className: "min-h-[300px]",
      content: {
        id: uuidv4(),
        type: "column" as ContentType,
        name: "Column",
        restrictDropTo: true,
        content: [
          {
            id: uuidv4(),
            type: "resizable-column" as ContentType,
            name: "Resizable column",
            restrictToDrop: true,
            content: [
              {
                id: uuidv4(),
                type: "image" as ContentType,
                name: "Image",
                content:
                  "https://plus.unsplash.com/premium_photo-1729004379397-ece899804701?q=80&w=2767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                alt: "Title",
              },
              {
                id: uuidv4(),
                type: "column" as ContentType,
                name: "Column",
                content: [
                  {
                    id: uuidv4(),
                    type: "heading1" as ContentType,
                    name: "Heading1",
                    content: "",
                    placeholder: "Heading1",
                  },
                  {
                    id: uuidv4(),
                    type: "paragraph" as ContentType,
                    name: "Paragraph",
                    content: "",
                    placeholder: "start typing here",
                  },
                ],
                className: "w-full h-full p-8 flex justify-center items-center",
                placeholder: "Heading1",
              },
            ],
          },
        ],
      },
    },
  
    {
      id: uuidv4(),
      slideName: "Accent Right",
      type: "accentRight",
      className: "min-h-[300px]",
      content: {
        id: uuidv4(),
        type: "column" as ContentType,
        name: "Column",
        content: [
          {
            id: uuidv4(),
            type: "resizable-column" as ContentType,
            name: "Resizable column",
            restrictToDrop: true,
            content: [
              {
                id: uuidv4(),
                type: "column" as ContentType,
                name: "Column",
                content: [
                  {
                    id: uuidv4(),
                    type: "heading1" as ContentType,
                    name: "Heading1",
                    content: "",
                    placeholder: "Heading1",
                  },
                  {
                    id: uuidv4(),
                    type: "paragraph" as ContentType,
                    name: "Paragraph",
                    content: "",
                    placeholder: "start typing here",
                  },
                ],
                className: "w-full h-full p-8 flex justify-center items-center",
                placeholder: "Heading1",
              },
              {
                id: uuidv4(),
                type: "image" as ContentType,
                name: "Image",
                restrictToDrop: true,
                content:
                  "https://plus.unsplash.com/premium_photo-1729004379397-ece899804701?q=80&w=2767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                alt: "Title",
              },
            ],
          },
        ],
      },
    },
  
    {
      id: uuidv4(),
      slideName: "Image and text",
      type: "imageAndText",
      className: "min-h-[200px] p-8 mx-auto flex justify-center items-center",
      content: {
        id: uuidv4(),
        type: "column" as ContentType,
        name: "Column",
        content: [
          {
            id: uuidv4(),
            type: "resizable-column" as ContentType,
            name: "Image and text",
            className: "border",
            content: [
              {
                id: uuidv4(),
                type: "column" as ContentType,
                name: "Column",
                content: [
                  {
                    id: uuidv4(),
                    type: "image" as ContentType,
                    name: "Image",
                    className: "p-3",
                    content:
                      "https://plus.unsplash.com/premium_photo-1729004379397-ece899804701?q=80&w=2767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    alt: "Title",
                  },
                ],
              },
              {
                id: uuidv4(),
                type: "column" as ContentType,
                name: "Column",
                content: [
                  {
                    id: uuidv4(),
                    type: "heading1" as ContentType,
                    name: "Heading1",
                    content: "",
                    placeholder: "Heading1",
                  },
                  {
                    id: uuidv4(),
                    type: "paragraph" as ContentType,
                    name: "Paragraph",
                    content: "",
                    placeholder: "start typing here",
                  },
                ],
                className: "w-full h-full p-8 flex justify-center items-center",
                placeholder: "Heading1",
              },
            ],
          },
        ],
      },
    },
  
    {
      id: uuidv4(),
      slideName: "Text and image",
      type: "textAndImage",
      className: "min-h-[200px] p-8 mx-auto flex justify-center items-center",
      content: {
        id: uuidv4(),
        type: "column" as ContentType,
        name: "Column",
        content: [
          {
            id: uuidv4(),
            type: "resizable-column" as ContentType,
            name: "Text and image",
            className: "border",
            content: [
              {
                id: uuidv4(),
                type: "column" as ContentType,
                name: "",
                content: [
                  {
                    id: uuidv4(),
                    type: "heading1" as ContentType,
                    name: "Heading1",
                    content: "",
                    placeholder: "Heading1",
                  },
                  {
                    id: uuidv4(),
                    type: "paragraph" as ContentType,
                    name: "Paragraph",
                    content: "",
                    placeholder: "start typing here",
                  },
                ],
                className: "w-full h-full p-8 flex justify-center items-center",
                placeholder: "Heading1",
              },
              {
                id: uuidv4(),
                type: "column" as ContentType,
                name: "Column",
                content: [
                  {
                    id: uuidv4(),
                    type: "image" as ContentType,
                    name: "Image",
                    className: "p-3",
                    content:
                      "https://plus.unsplash.com/premium_photo-1729004379397-ece899804701?q=80&w=2767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    alt: "Title",
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  
    {
      id: uuidv4(),
      slideName: "Two columns",
      type: "twoColumns",
      className: "p-4 mx-auto flex justify-center items-center",
      content: {
        id: uuidv4(),
        type: "column" as ContentType,
        name: "Column",
        content: [
          {
            id: uuidv4(),
            type: "title" as ContentType,
            name: "Title",
            content: "",
            placeholder: "Untitled Card",
          },
          {
            id: uuidv4(),
            type: "resizable-column" as ContentType,
            name: "Text and image",
            className: "border",
            content: [
              {
                id: uuidv4(),
                type: "paragraph" as ContentType,
                name: "Paragraph",
                content: "",
                placeholder: "Start typing...",
              },
              {
                id: uuidv4(),
                type: "paragraph" as ContentType,
                name: "Paragraph",
                content: "",
                placeholder: "Start typing...",
              },
            ],
          },
        ],
      },
    },
  
    {
      id: uuidv4(),
      slideName: "Two columns with headings",
      type: "twoColumnsWithHeadings",
      className: "p-4 mx-auto flex justify-center items-center",
      content: {
        id: uuidv4(),
        type: "column" as ContentType,
        name: "Column",
        content: [
          {
            id: uuidv4(),
            type: "title" as ContentType,
            name: "Title",
            content: "",
            placeholder: "Untitled Card",
          },
          {
            id: uuidv4(),
            type: "resizable-column" as ContentType,
            name: "Text and image",
            className: "border",
            content: [
              {
                id: uuidv4(),
                type: "column" as ContentType,
                name: "Column",
                content: [
                  {
                    id: uuidv4(),
                    type: "heading3" as ContentType,
                    name: "Heading3",
                    content: "",
                    placeholder: "Heading 3",
                  },
                  {
                    id: uuidv4(),
                    type: "paragraph" as ContentType,
                    name: "Paragraph",
                    content: "",
                    placeholder: "Start typing...",
                  },
                ],
              },
              {
                id: uuidv4(),
                type: "column" as ContentType,
                name: "Column",
                content: [
                  {
                    id: uuidv4(),
                    type: "heading3" as ContentType,
                    name: "Heading3",
                    content: "",
                    placeholder: "Heading 3",
                  },
                  {
                    id: uuidv4(),
                    type: "paragraph" as ContentType,
                    name: "Paragraph",
                    content: "",
                    placeholder: "Start typing...",
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  
    {
      id: uuidv4(),
      slideName: "Three column",
      type: "threeColumns",
      className: "p-4 mx-auto flex justify-center items-center",
      content: {
        id: uuidv4(),
        type: "column" as ContentType,
        name: "Column",
        content: [
          {
            id: uuidv4(),
            type: "title" as ContentType,
            name: "Title",
            content: "",
            placeholder: "Untitled Card",
          },
          {
            id: uuidv4(),
            type: "resizable-column" as ContentType,
            name: "Text and image",
            className: "border",
            content: [
              {
                id: uuidv4(),
                type: "paragraph" as ContentType,
                name: "",
                content: "",
                placeholder: "Start typing...",
              },
              {
                id: uuidv4(),
                type: "paragraph" as ContentType,
                name: "",
                content: "",
                placeholder: "Start typing...",
              },
              {
                id: uuidv4(),
                type: "paragraph" as ContentType,
                name: "",
                content: "",
                placeholder: "Start typing...",
              },
            ],
          },
        ],
      },
    },
  ];

const generateImageUrl = async (prompt: string): Promise<string> => {
  try {
    const improvedPrompt = `    
    Create a highly realistic, professional image based on the following description. The image should look as if captured in real life, with attention to detail, lighting, and texture.
    Description: ${prompt}
    Important Notes:
    - The image must be in a photorealistic style and visually compelling.
    - Ensure all text, signs, or visible writing in the image are in English.
    - Pay special attention to lighting, shadows, and textures to make the image as lifelike as possible.
    - Avoid elements that appear abstract, cartoonish, or overly artistic. The image should be suitable for professional
    presentations.
    - Focus on accurately depicting the concept described, including specific objects, environment, mood, and context. Maintain
    relevance to the description provided.
      Example Use Cases : Business presentations, educational slides, professional designs.
    `;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          instances: [{ prompt: improvedPrompt }],
          parameters: { sampleCount: 1 },
        }),
      }
    );
    const json = await response.json();
    const predictions = (json as any).predictions;
    if (Array.isArray(predictions) && predictions.length > 0 && predictions[0].bytesBase64Encoded) {
      return `data:image/png;base64,${predictions[0].bytesBase64Encoded}`;
    }
    console.error("No predictions returned for image generation", json);
    return 'https"//via.placeholder.com/1024';
  } catch (error) {
    console.error("Error generating image URL:", error);
    return 'https"//via.placeholder.com/1024';
  }
};

/**
 * Collect image components
 * 1. Initialize empty images array
 * 2. If node is image type, add it
 * 3. Recurse into array children to find nested images
 * 4. Return collected image components
 */
const findImageComponents = (layout: ContentItem): ContentItem[] => {
    const images = []
    if(layout.type === "image"){
      images.push(layout)
    }
    if(Array.isArray(layout.content)){
      layout.content.forEach((child) => {
        images.push(...findImageComponents(child as ContentItem))
      })
    }else if(layout.content && typeof layout.content === "object"){

    }
    return images
  }
/**
 * Replace image placeholders
 * 1. Find all image components in slide layout
 * 2. Log discovered components
 * 3. For each component:
 *    1. Log processing alt text
 *    2. Generate image URL via AI
 *    3. Assign URL to component content
 * 4. End loop
 */
const replaceImagePlaceholders = async (layout: Slide) => {
    const imageComponents = findImageComponents(layout.content)
    console.log("Found image components:", imageComponents)

    for (const component of imageComponents){
      console.log("Processing image component:", component.alt)
      component.content = await generateImageUrl(component.alt || "Placeholder Image")
    }
    
  }

/**
 * Generate slide layouts
 * 1. Initialize GoogleGenerativeAI with API key
 * 2. Construct prompt with examples and outline array
 * 3. Send generation request to Gemini model
 * 4. Strip markdown fences and parse JSON
 * 5. Return layouts data or throw error
 */
export const getGenerateLayoutsJSON = async (outlineArray: string[]) => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

    const prompt = `
    
    You are a highly creative AI that generates JSON-based layouts for presentations. 
    I will provide you with an array of outlines, and for each outline, you must generate a 
    unique and creative layout. Use the existing layouts as examples for structure and design, 
    and generate unique designs based on the provided outline.


    ### Guidelines:
    1. Write layouts based on the specific outline provided.
    2. Use diverse and engaging designs, ensuring each layout is unique.
    3. Adhere to the structure of existing layouts but add new styles or components if needed.
    4. Fill placeholder data into content fields where required.
    5. Generate unique image placeholders for the 'content' property of image components 
    and also alt text according to the outline.
    6. Ensure proper formatting and schema alignment for the output JSON.



    ### Example Layouts:
    ${JSON.stringify(existingLayouts, null, 2)}
    ### Outline Array: 
    ${JSON.stringify(outlineArray)}
    For each entry in the outline array, generate: - A unique JSON layout with creative designs. - Properly filled content, including
    placeholders for image components.
    Clear and well-structured JSON data.
    
    For Images:
    -The alt text should describe the image clearly and concisely.
    -Focus on the main subject(s) of the image and any relevant details such as colors, shapes,
    people, or objects.
    -Ensure the alt text aligns with the context of the presentation slide it will be used on (e.g., professional, educational, business-related). 
    -Avoid using terms like "image of" or "picture of," and instead focus directly on the content and meaning.
    
    Output the layouts in JSON format. Ensure there are no duplicate layouts across the array.
    `
    try{
        console.log("Sending request to Gemini API to generate layouts...")
        //ai goes here
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash"});

        console.log("Sending request to Gemini API...");
        const result = await model.generateContent(prompt);
        const response = result.response;

        const responseText = response?.text();
        if (!responseText) {
            return { status: 400, error: "No content generated" };
        }
        // Strip potential markdown fences
        const cleaned = responseText.replace(/```json|```/g, "").trim();
        let jsonResponse;
        try {
            jsonResponse = JSON.parse(cleaned);
        } catch (parseError) {
            console.error("❌ ERROR:", parseError);
            throw new Error("Invalid JSON format received from AI");
        }
        return { status: 200, data: jsonResponse };


    }catch(error){
        console.error("❌ ERROR:", error);
        throw error;
    }
}

/**
 * Create project layouts
 * 1. Validate projectId and authenticate user
 * 2. Verify subscription and project existence
 * 3. Call layout-generation helper with outlines
 * 4. Update project record with new slides and theme
 * 5. Return generated layouts or error
 */
export const generateLayouts = async (projectId: string, theme: string) => {
    try{
        if(!projectId){
            return {status: 400, error: "Project ID is required"}
        }
        const user = await currentUser()
        if(!user){
            return {status: 403, error: "User not authenticated."}
        }
        const userExist = await client.user.findUnique({
            where: {
                clerkId: user.id,
            }
        })
        if(!userExist || !userExist.subscription){
            return {status: 403, error: !userExist?.subscription ? "User not subscribed." : "User not found."}
        }
        const project = await client.project.findUnique({
            where: {
                id: projectId,
                isDeleted: false,
            }
        })
        if(!project){
            return {status: 404, error: "Project not found."}
        }


        const layouts = await getGenerateLayoutsJSON(project.outlines)
        if(layouts.status !== 200){
            return {status: 500, error: "Error generating layouts.", data: layouts}
        }
        await client.project.update({
            where: {
                id: projectId
            },
            data: {
                slides: layouts.data, themeName: theme
            }
        })
        return {status: 200, data: layouts.data}
    }catch(error){
        console.error("❌ ERROR:", error)
        return {status: 500, error: "OUTER Error generating layouts.", data: []}
    }
}