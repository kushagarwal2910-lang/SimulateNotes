import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

/**
 * Retrieves the pool of OpenRouter API keys from environment variables.
 */
function getOpenRouterKeys(): string[] {
  const keys: string[] = [];
  for (const envVar of ["OPENROUTER_API_KEY_1", "OPENROUTER_API_KEY_2", "OPENROUTER_API_KEY_3", "OPENROUTER_API_KEY"]) {
    const k = process.env[envVar]?.trim();
    if (k && !keys.includes(k)) {
      keys.push(k);
    }
  }
  if (keys.length === 0) {
    // Keys must be provided via environment variables (OPENROUTER_API_KEY_1, etc.)
    console.warn("No OpenRouter API keys found in environment variables");
  }
  return keys;
}

/**
 * Sanitizes text to sound completely natural, friendly, and smooth when spoken by SpeechSynthesis.
 * Strips markdown formatting, raw LaTeX syntax, bullet points, citations, etc.
 */
function cleanForSpeech(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/<<<ACTION:[\s\S]*?>>>/g, "") // Strip action command blocks
    .replace(/\*\*(.*?)\*\*/g, "$1") // Bold
    .replace(/\*(.*?)\*/g, "$1") // Italic
    .replace(/#{1,6}\s+/g, "") // Headings
    .replace(/`([^`]+)`/g, "$1") // Inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Links
    .replace(/\[\d+(?:,\s*\d+)*\]/g, "") // Citation tags like [1], [1, 2]
    .replace(/\$+(.*?)\$+/g, "$1") // LaTeX wrappers
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1 divided by $2")
    .replace(/\\cdot/g, " times ")
    .replace(/\\approx/g, " is approximately ")
    .replace(/\\le|\\leq/g, " is less than or equal to ")
    .replace(/\\ge|\\geq/g, " is greater than or equal to ")
    .replace(/\\Delta/g, "delta ")
    .replace(/\\pi/g, "pi")
    .replace(/[•\-\*]\s+/g, "") // Bullet markers
    .replace(/\s*\n\s*/g, " ") // Collapse newlines into speech pauses
    .replace(/\s{2,}/g, " ") // Collapse multiple spaces
    .trim();
}

/**
 * Searches the notebook's indexed RAG database or provided sources.
 * STRICT ISOLATION: Never falls back to a different notebook's cache file!
 */
function retrieveRAGContext(
  projectRoot: string,
  notebookId?: string,
  query?: string,
  notebookTitle?: string,
  providedSources?: any[]
): { topic: string; snippets: string[] } {
  const ragDir = path.join(projectRoot, "scratch", "rag_cache");
  let cacheData: any = null;

  // 1. Strictly look for THIS specific notebook's cache file on disk
  if (notebookId) {
    const specificPath = path.join(ragDir, `${notebookId}.json`);
    if (fs.existsSync(specificPath)) {
      try {
        cacheData = JSON.parse(fs.readFileSync(specificPath, "utf-8"));
      } catch (e) {
        console.warn("Could not parse notebook cache for", notebookId, e);
      }
    }
  }

  // Determine active topic name
  const topic =
    notebookTitle ||
    cacheData?.topic ||
    "Scientific Exploration";

  // Gather candidate text snippets (from cache chunks OR from provided sources)
  let candidateSnippets: string[] = [];

  if (cacheData?.chunks && Array.isArray(cacheData.chunks) && cacheData.chunks.length > 0) {
    candidateSnippets = cacheData.chunks.map((c: any) => c.text);
  } else if (providedSources && Array.isArray(providedSources) && providedSources.length > 0) {
    candidateSnippets = providedSources.map((s: any) => `${s.title}: ${s.snippet}`);
  } else if (cacheData?.sources && Array.isArray(cacheData.sources) && cacheData.sources.length > 0) {
    candidateSnippets = cacheData.sources.map((s: any) => `${s.title}: ${s.snippet}`);
  }

  if (candidateSnippets.length === 0) {
    return { topic, snippets: [] };
  }

  // If no query, return top 3 background snippets
  if (!query || query.trim().length === 0) {
    return { topic, snippets: candidateSnippets.slice(0, 3) };
  }

  // Tokenize user speech query for relevance scoring
  const queryTokens = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);

  const scored = candidateSnippets.map((text) => {
    const lowerText = text.toLowerCase();
    let score = 0;
    for (const token of queryTokens) {
      if (lowerText.includes(token)) {
        score += 2;
        if (new RegExp(`\\b${token}\\b`).test(lowerText)) score += 1;
      }
    }
    return { text, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const relevant = scored.filter((s) => s.score > 0).slice(0, 4);

  if (relevant.length > 0) {
    return { topic, snippets: relevant.map((r) => r.text) };
  }

  // If no keyword match, return top snippets as background
  return { topic, snippets: candidateSnippets.slice(0, 3) };
}

/**
 * Calls high-capacity LLM via OpenRouter to generate natural spoken answers.
 */
async function callVoiceLLM(systemPrompt: string, userPrompt: string): Promise<string | null> {
  const keys = getOpenRouterKeys();
  const models = [
    "meta-llama/llama-3.3-70b-instruct",
    "mistralai/mistral-small-24b-instruct-2501",
    "openai/gpt-4o-mini",
    "nvidia/nemotron-3-super-120b-a12b:free",
  ];

  for (let k = 0; k < keys.length; k++) {
    const key = keys[k];
    for (const model of models) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/langgraph-simulation-agent",
            "X-Title": "SimulateNotes Voice Assistant",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.45,
            max_tokens: 180,
          }),
          signal: AbortSignal.timeout(6000), // 6-second timeout for responsive voice
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content?.trim();
          if (content && content.length > 10) {
            return content;
          }
        }
      } catch (err) {
        // Continue to next model/key
      }
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      notebookId,
      notebookTitle,
      sources = [],
      userSpeech,
      stage = "ready",
      simulationTitle,
      simulationSlug,
      simulationDescription,
      simulationEquations = [],
      simulationParameters = [],
      simulationControls = [],
    } = body;

    const projectRoot = process.cwd();
    // Retrieve context strictly bound to THIS notebook's literature
    const { topic, snippets: contextSnippets } = retrieveRAGContext(
      projectRoot,
      notebookId,
      userSpeech,
      notebookTitle,
      sources
    );

    const hasUserSpeech = Boolean(userSpeech && userSpeech.trim().length > 2);
    const lowerSpeech = (userSpeech || "").toLowerCase();

    // Check for direct parameter commands (e.g. "increase barrier width", "set temperature to 400")
    let physicalAction: { control: string | number; value: number; delayMs: number } | null = null;
    const isControlCommand =
      lowerSpeech.includes("set") ||
      lowerSpeech.includes("change") ||
      lowerSpeech.includes("increase") ||
      lowerSpeech.includes("decrease") ||
      lowerSpeech.includes("higher") ||
      lowerSpeech.includes("lower") ||
      lowerSpeech.includes("max") ||
      lowerSpeech.includes("min") ||
      lowerSpeech.includes("faster") ||
      lowerSpeech.includes("slower");

    if (isControlCommand && simulationControls.length > 0) {
      let matchedCtrl = simulationControls[0];
      for (const ctrl of simulationControls) {
        const words = ctrl.label.toLowerCase().split(/[^a-z0-9]+/);
        if (words.some((w: string) => w.length > 3 && lowerSpeech.includes(w))) {
          matchedCtrl = ctrl;
          break;
        }
      }

      const min = matchedCtrl.min ?? 0;
      const max = matchedCtrl.max ?? 100;
      const current = matchedCtrl.currentValue ?? (min + max) / 2;
      let targetVal = current;

      const numMatch = lowerSpeech.match(/(\d+(\.\d+)?)/);
      if (numMatch) {
        targetVal = parseFloat(numMatch[1]);
      } else if (lowerSpeech.includes("max") || lowerSpeech.includes("highest")) {
        targetVal = max;
      } else if (lowerSpeech.includes("min") || lowerSpeech.includes("lowest")) {
        targetVal = min;
      } else if (lowerSpeech.includes("increase") || lowerSpeech.includes("higher") || lowerSpeech.includes("faster")) {
        targetVal = Math.min(max, current + (max - min) * 0.25);
      } else if (lowerSpeech.includes("decrease") || lowerSpeech.includes("lower") || lowerSpeech.includes("slower")) {
        targetVal = Math.max(min, current - (max - min) * 0.25);
      }

      physicalAction = {
        control: matchedCtrl.label,
        value: targetVal,
        delayMs: 350,
      };
    }

    // Build controls summary for LLM context
    const controlsSummary = simulationControls.length > 0
      ? simulationControls.map((c: any) => `${c.label} (range ${c.min} to ${c.max}, current ${c.currentValue})`).join("; ")
      : "No interactive sliders active";

    // Build grounding technical context
    let groundingContext = "";
    if (contextSnippets.length > 0) {
      groundingContext = `INDEXED RAG LITERATURE FOR THIS NOTEBOOK:\n${contextSnippets.join("\n\n---\n\n")}`;
    } else if (simulationDescription || simulationEquations.length > 0) {
      groundingContext = `SIMULATION TECHNICAL SPECIFICATIONS:\nDescription: ${simulationDescription || ""}\nGoverning Formulas: ${simulationEquations.join(", ")}\nKey Parameters: ${JSON.stringify(simulationParameters)}`;
    } else {
      groundingContext = `NOTEBOOK TOPIC: ${topic}\n(No literature indexed yet. If the user asks general questions about ${topic}, answer from scientific fundamentals).`;
    }

    // Assemble comprehensive System Prompt for Voice Assistant
    const systemPrompt = `You are the SimulateNotes Voice Tutor, an expert, articulate, and encouraging personal scientific mentor speaking directly through text-to-speech audio.

ACTIVE NOTEBOOK: ${topic}

${groundingContext}

CURRENT STUDIO SIMULATION:
Title: ${simulationTitle || "None"}
Equations: ${simulationEquations.length > 0 ? simulationEquations.join(", ") : "None"}
Available Interactive Controls: ${controlsSummary}

VOICE & SPEECH RULES:
1. STRICT TOPIC GROUNDING: You are currently assisting in the notebook: "${topic}". NEVER talk about unrelated topics (e.g. do not mention stomach acid or digestion unless this specific notebook is about digestion!).
2. NATURAL SPOKEN ENGLISH: Speak conversationally, warmly, and clearly like a friendly university professor or peer researcher sitting right next to the student in a lab.
3. DIRECT ANSWERS: Answer the user's doubt directly using the technical facts above. Explain the mechanism simply and intuitively.
4. STRICT AUDIO CONSTRAINTS:
   - NEVER use markdown formatting (**bold**), bullet characters (•), hashtags (#), or numbered lists.
   - NEVER speak raw math code like \\frac{a}{b} or x_1. Explain math conversationally in words (e.g., say "the energy increases with the square of frequency").
5. CONCISE FOR SPEECH: Keep responses between 2 and 4 spoken sentences (30 to 60 words). Do NOT give a long lecture.
6. GUIDANCE OVER THE LAB: When appropriate, guide the user on what to look for on their screen or which slider to test.
7. SLIDER ACTIONS (Optional): If you want to physically adjust a slider to demonstrate your explanation, append at the end:
<<<ACTION: {"control": "ExactControlLabel", "value": number}>>>`;

    // Formulate User Query Prompt
    let userPrompt = "";
    if (hasUserSpeech) {
      userPrompt = userSpeech.trim();
    } else if (stage === "demonstrate") {
      userPrompt = `Give me a warm 2-sentence welcome to the ${simulationTitle || topic} laboratory, explain the primary concept in plain words, and tell me what control to test.`;
    } else if (stage === "compiling") {
      userPrompt = `Let me know in 1 or 2 sentences that the simulation for ${topic} is being compiled, and invite me to ask any question about the theory while it generates.`;
    } else {
      userPrompt = `Introduce yourself as the voice tutor for ${topic} and ask what concept I'd like to explore.`;
    }

    // Call LLM for grounded, conversational speech
    const llmSpeech = await callVoiceLLM(systemPrompt, userPrompt);

    let finalSpeech = "";
    let actions: Array<{ control: string | number; value: number; delayMs: number }> = [];

    if (llmSpeech) {
      // Check for <<<ACTION: ...>>> in LLM output
      const actionMatch = llmSpeech.match(/<<<ACTION:\s*({.*?})>>>/);
      if (actionMatch) {
        try {
          const parsed = JSON.parse(actionMatch[1]);
          if (parsed.control && typeof parsed.value === "number") {
            actions.push({
              control: parsed.control,
              value: parsed.value,
              delayMs: 1200,
            });
          }
        } catch (e) {}
      }

      finalSpeech = cleanForSpeech(llmSpeech);
    }

    // Grounded fallback if LLM failed
    if (!finalSpeech || finalSpeech.length < 15) {
      if (contextSnippets.length > 0) {
        const firstCleanSnippet = cleanForSpeech(contextSnippets[0]).slice(0, 180);
        finalSpeech = `Based on your research in ${topic}, ${firstCleanSnippet}. Feel free to ask me to explain any mechanism or adjust the simulation controls!`;
      } else if (simulationTitle) {
        finalSpeech = `Welcome to the ${cleanForSpeech(simulationTitle)} laboratory. You can ask me any questions about the theory or tell me to adjust any slider for you.`;
      } else {
        finalSpeech = `I am your voice tutor for ${topic}. What specific doubt or equation would you like to explore?`;
      }
    }

    // If user asked a direct control command, ensure action is dispatched
    if (physicalAction && !actions.some((a) => a.control === physicalAction?.control)) {
      actions.unshift(physicalAction);
    }

    return NextResponse.json({
      status: "success",
      speech: finalSpeech,
      stage: hasUserSpeech ? "answer" : stage,
      actions,
    });
  } catch (err: any) {
    console.error("Error in /api/voice-assistant:", err);
    return NextResponse.json(
      {
        status: "error",
        speech: "I am ready and listening. What would you like to explore in this notebook?",
        stage: "error",
        actions: [],
      },
      { status: 200 }
    );
  }
}
