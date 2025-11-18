import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured' },
        { status: 500 }
      );
    }

    // Initialize the model with system instruction
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: `You are an expert system architect and software engineer. Provide comprehensive, well-structured advice on system architecture, design patterns, and best practices.

When providing diagrams, use Mermaid syntax with ONLY these supported diagram types:
- graph/flowchart (graph TD, graph LR, flowchart TD, etc.)
- sequenceDiagram
- classDiagram
- stateDiagram-v2
- erDiagram
- gantt
- pie

DO NOT use: C4Context, C4Container, or any C4 diagram types as they are not supported.

IMPORTANT Mermaid syntax rules:
- Always use quotes around node labels that contain special characters like parentheses, slashes, or colons
- Example: A["User Interface (View/Controller)"] instead of A[User Interface (View/Controller)]
- For edge labels, use quotes if they contain special characters: -->|"Sends Data"| B
- Keep node IDs simple (alphanumeric only): UI, GameCore, Player, etc.

Format your responses using Markdown with proper headings, code blocks, tables, and lists for clarity.`,
    });

    // Convert messages to Gemini format and build conversation history
    const history = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const lastMessage = messages[messages.length - 1].content;

    // Start a chat session with history
    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 8192, // Increased token limit for longer responses
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      },
    });

    // Send the message
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ message: text });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return NextResponse.json(
      { error: 'Failed to get response from AI' },
      { status: 500 }
    );
  }
}
