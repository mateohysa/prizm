"use server"
import { OpenAI } from "openai"
import {Content, GoogleGenerativeAI} from "@google/generative-ai"
import Groq from 'groq-sdk'
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
export const generateCreativePrompt = async (userPrompt: string, slideCount: number = 10) => {
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

    const finalPrompt = `
    
    You are a helpful AI assistant that creates outlines for presentations.
    Create a coherent and relevant outline for the following prompt: ${userPrompt}.
    The outline should consist of exactly ${slideCount} points, with
    each point written as a single sentence with 10 or less words.
    Ensure the outline is well-structured and directly related to the topic.
    Make sure you provide exactly ${slideCount} outline points, no more, no less.
    Return the output in the following JSON format:
    {
    "outlines":[
        "Point 1",
        "Point 2",
        "Point 3",
        ...continue until you have exactly ${slideCount} points
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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: improvedPrompt }
            ]
          }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"]
          }
        }),
      }
    );
    
    const json = await response.json();
    
    // Check if response is successful
    if (!response.ok) {
      console.error("Image generation API error:", json);
      return 'https://plus.unsplash.com/premium_photo-1729004379397-ece899804701?q=80&w=2767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
    }
    
    // Parse the new Gemini 2.0 Flash response format
    const candidates = json.candidates;
    if (candidates && candidates.length > 0) {
      const content = candidates[0].content;
      if (content && content.parts) {
        for (const part of content.parts) {
          if (part.inlineData && part.inlineData.data) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      }
    }
    
    console.error("No image data found in response", json);
    return 'https://plus.unsplash.com/premium_photo-1729004379397-ece899804701?q=80&w=2767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
  } catch (error) {
    console.error("Error generating image URL:", error);
    return 'https://plus.unsplash.com/premium_photo-1729004379397-ece899804701?q=80&w=2767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
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
    console.log("🔍 Searching for images in:", layout.type, "with content type:", typeof layout.content)
    
    if(layout.type === "image"){
      console.log("✅ Found image component:", layout.alt || "No alt text")
      images.push(layout)
    }
    if(Array.isArray(layout.content)){
      console.log("🔄 Recursing into array content with", layout.content.length, "items")
      layout.content.forEach((child) => {
        images.push(...findImageComponents(child as ContentItem))
      })
    }else if(layout.content && typeof layout.content === "object"){
      console.log("🔄 Recursing into object content")
      images.push(...findImageComponents(layout.content as ContentItem))
    }
    
    console.log("🎯 Found", images.length, "images in this component")
    return images
  }
/**
 * Fix invalid twoColumns structure
 * Detects slides with content2 property and converts to proper resizable-column structure
 * 1. Check if slide is twoColumns type with content2 property
 * 2. Extract left and right column content
 * 3. Create proper resizable-column structure with two column children
 * 4. Remove centering classes and replace with top alignment
 * 5. Return fixed slide without content2 property
 */
const fixTwoColumnsStructure = (slide: Slide): Slide => {
    // Type assertion to check for content2 property
    const slideWithContent2 = slide as Slide & { content2?: ContentItem };
    
    // Only process two-column slide types that have the invalid content2 property
    const isTwoColumnSlide = slide.type === "twoColumns" || slide.type === "twoColumnsWithHeadings";
    if (!isTwoColumnSlide || !slideWithContent2.content2) {
        return slide;
    }

    const leftColumn = slideWithContent2.content;
    const rightColumn = slideWithContent2.content2;

    console.log(`🔧 Fixing invalid ${slide.type} structure for slide: ${slide.slideName}`);

    // Create the proper structure with resizable-column
    const fixedContent: ContentItem = {
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
                    // Left column content (convert to proper column structure)
                    {
                        id: uuidv4(),
                        type: "column" as ContentType,
                        name: "Left Column",
                        content: Array.isArray(leftColumn.content) ? leftColumn.content : [leftColumn],
                        className: leftColumn.className?.replace(/justify-center items-center/g, 'items-start') || undefined
                    },
                    // Right column content (convert to proper column structure)  
                    {
                        id: uuidv4(),
                        type: "column" as ContentType,
                        name: "Right Column",
                        content: Array.isArray(rightColumn.content) ? rightColumn.content : [rightColumn],
                        className: rightColumn.className?.replace(/justify-center items-center/g, 'items-start') || undefined
                    }
                ],
            },
        ],
    };

    // Return the fixed slide without the invalid content2 property
    const { content2, ...cleanSlide } = slideWithContent2;
    return {
        ...cleanSlide,
        content: fixedContent
    };
};

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
    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY
    });

    const prompt = `You are a highly creative AI that generates JSON-based layouts for presentations. 
    I will provide you with a pattern and a format to follow and for each outline, you must generate unique layouts and contents and give me the output in the JSON format expected.

    CRITICAL LAYOUT STRUCTURE REQUIREMENTS:
    
    For "textAndImage" slides, you MUST ALWAYS use this EXACT structure - DO NOT create flat structures:
    {
      type: "textAndImage",
      content: {
        type: "column",
        content: [{
          type: "resizable-column",
          content: [
            {
              type: "column",
              content: [heading, paragraph] // Text side
            },
            {
              type: "column", 
              content: [image] // Image side with NO padding classes
            }
          ]
        }]
      }
    }

    The available LAYOUTS TYPES are: "accentLeft", "accentRight", "imageAndText", "textAndImage", "twoColumns", "twoColumnsWithHeadings"
    The available CONTENT TYPES are: "heading1", "heading2", "heading3", "heading4", "title", "paragraph", "table", "resizable-column", "image", "blockquote", "numberedList", "bulletList", "calloutBox", "codeBlock", "tableOfContents", "divider", "column"

    Use these outlines: ${JSON.stringify(outlineArray)}

    RULES:
    1. Write layouts based on the specific outline provided
    2. Each layout must be unique
    3. STRICTLY follow the structure examples provided
    4. Fill placeholder data into content fields
    5. Generate unique image placeholders and alt text
    6. For images in textAndImage slides: DO NOT add "p-3" or padding classes - images should fill their entire half

    Example textAndImage structure (FOLLOW EXACTLY):
    ${JSON.stringify({
        id: uuidv4(),
        slideName: "Text and image",
        type: "textAndImage",
        className: "min-h-[200px] p-8 mx-auto flex justify-center items-center",
        content: {
          id: uuidv4(),
          type: "column",
          name: "Column",
          content: [
            {
              id: uuidv4(),
              type: "resizable-column",
              name: "Text and image",
              className: "border",
              content: [
                {
                  id: uuidv4(),
                  type: "column",
                  name: "",
                  content: [
                    {
                      id: uuidv4(),
                      type: "heading1",
                      name: "Heading1",
                      content: "",
                      placeholder: "Heading1",
                    },
                    {
                      id: uuidv4(),
                      type: "paragraph",
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
                  type: "column",
                  name: "Column",
                  content: [
                    {
                      id: uuidv4(),
                      type: "image",
                      name: "Image",
                      content: "https://plus.unsplash.com/premium_photo-1729004379397-ece899804701?q=80&w=2767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                      alt: "Title",
                    },
                  ],
                },
              ],
            },
          ],
        },
    })}

    For Images:
    - Alt text should describe the image clearly and concisely
    - Focus on main subjects, colors, shapes, people, or objects
    - Align with presentation context (professional, educational, business)
    - Avoid "image of" or "picture of"
    
    Output ONLY a valid JSON array of slide layouts. No markdown fences or explanations.`;

    try{
        console.log("Sending request to Groq API to generate layouts...")
        
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
            max_tokens: 8000
        });

        const responseText = completion.choices[0]?.message?.content;
        if (!responseText) {
            return { status: 400, error: "No content generated" };
        }

        let jsonResponse;
        try {
            const parsed = JSON.parse(responseText);
            // Handle if response is wrapped in an object
            jsonResponse = Array.isArray(parsed) ? parsed : (parsed.slides || parsed.layouts || [parsed]);
        } catch (parseError) {
            console.error("❌ JSON Parse Error:", parseError);
            console.error("❌ Response text:", responseText);
            throw new Error("Invalid JSON format received from AI");
        }

        console.log("✅ Groq generated", jsonResponse.length, "layouts successfully");
        return { status: 200, data: jsonResponse };

    }catch(error){
        console.error("❌ Groq API Error:", error);
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

        // 🔍 DEBUG: Check what we got from layout generation
        console.log("📊 Layouts generated successfully!")
        console.log("📊 Number of slides:", layouts.data?.length || 0)
        console.log("📊 First slide structure:", layouts.data?.[0] ? JSON.stringify(layouts.data[0], null, 2).substring(0, 500) + "..." : "No slides")

        // 🔥 NEW: Process each slide to fix structure and replace image placeholders
        console.log("🔄 Starting slide processing for", layouts.data.length, "slides...")
        const slidesWithImages = await Promise.allSettled(
            layouts.data.map(async (slide: Slide, index: number) => {
                try {
                    console.log(`🔄 Processing slide ${index + 1}/${layouts.data.length}: ${slide.slideName}`)
                    
                    // Fix invalid twoColumns structure first
                    const fixedSlide = fixTwoColumnsStructure(slide);
                    
                    // Then process images
                    await replaceImagePlaceholders(fixedSlide)
                    console.log(`✅ Completed slide ${index + 1}`)
                    return fixedSlide
                } catch (error) {
                    console.error(`❌ Error processing slide ${index + 1}:`, error)
                    return slide // Return slide as-is if processing fails
                }
            })
        )

        // Extract successful results
        const processedSlides = slidesWithImages.map((result: PromiseSettledResult<Slide>) => 
            result.status === 'fulfilled' ? result.value : null
        ).filter(Boolean) as any

        console.log("🎉 Slide processing complete!")

        await client.project.update({
            where: {
                id: projectId
            },
            data: {
                slides: processedSlides, themeName: theme
            }
        })
        return {status: 200, data: processedSlides}
    }catch(error){
        console.error("❌ ERROR:", error)
        return {status: 500, error: "OUTER Error generating layouts.", data: []}
    }
}