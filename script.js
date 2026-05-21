console.log("StudySyncs AI - Production Mode Connected");

// ⚠️ PASTE YOUR WORKING API KEY HERE BETWEEN THE QUOTES
const GEMINI_API_KEY = "AIzaSyAIRs1Am2G0JGrGdo2WRAAc4klieiRDY6E"; 

document.addEventListener("DOMContentLoaded", () => {
    // Core workspace elements
    const summarizeBtn = document.getElementById("summarizeBtn");
    const noteInput = document.getElementById("noteInput");
    const resultBox = document.getElementById("resultBox");
    const aiOutputText = document.getElementById("aiOutputText");
    const resultHeading = document.getElementById("resultHeading");
    const currentModeText = document.getElementById("currentModeText");

    // Clickable feature card elements
    const cardNotes = document.getElementById("cardNotes");
    const cardFlashcards = document.getElementById("cardFlashcards");
    const cardTimer = document.getElementById("cardTimer");

    // Default global app state tracker
    let currentMode = "notes"; 

    // Helper function to manage app feature swapping seamlessly
    function switchMode(modeType, displayName, placeholderText, buttonText) {
        currentMode = modeType;
        currentModeText.innerText = displayName;
        noteInput.placeholder = placeholderText;
        summarizeBtn.innerText = buttonText;
        resultBox.style.display = "none"; 
        noteInput.value = ""; 
        
        noteInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // 1. Feature Selector Event Listeners
    if (cardNotes) {
        cardNotes.addEventListener("click", () => {
            switchMode("notes", "✨ AI Notes & Summary", "Paste your study notes or textbook paragraphs here...", "Generate AI Summary");
        });
    }

    if (cardFlashcards) {
        cardFlashcards.addEventListener("click", () => {
            switchMode("flashcards", "🗂️ Exam Flashcard Maker", "Paste concepts or text here to generate custom review sets...", "Convert to Flashcards");
        });
    }

    if (cardTimer) {
        cardTimer.addEventListener("click", () => {
            switchMode("timer", "⏱️ Pomodoro Assistant", "Type what task you want to focus on (e.g., 'Studying Organic Chemistry formulas')...", "Start AI-Guided Study Block");
        });
    }

    // Advanced Robust UI Parser
    function formatAIResponse(text) {
        if (currentMode === "flashcards") {
            // Cleans up any bold marks or headers the AI outputs automatically
            let cleanText = text.replace(/\*\*\s*FRONT:\s*\*\*/gi, "FRONT:")
                                .replace(/\*\*\s*BACK:\s*\*\*/gi, "BACK:")
                                .replace(/FRONT:/gi, "FRONT:")
                                .replace(/BACK:/gi, "BACK:");
            
            const rawCards = cleanText.split(/FRONT:/i);
            let cardsHTML = '<div class="flashcards-grid">';

            rawCards.forEach(card => {
                if (!card.trim()) return;

                const parts = card.split(/BACK:/i);
                if (parts.length === 2) {
                    const frontText = parts[0].replace(/\*\*/g, '').trim();
                    const backText = parts[1].replace(/\*\*/g, '').trim();

                    cardsHTML += `
                        <div class="ui-flashcard">
                            <div class="flashcard-front">
                                <span class="badge-side q-badge">Q</span>
                                <p>${frontText}</p>
                            </div>
                            <div class="flashcard-divider"></div>
                            <div class="flashcard-back">
                                <span class="badge-side a-badge">A</span>
                                <p>${backText}</p>
                            </div>
                        </div>
                    `;
                }
            });

            cardsHTML += '</div>';
            return cardsHTML;
        }

        // Standard markdown parser fallback path for text summaries
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/^\s*\*\s(.*)$/gm, '<li>$1</li>');
    }

    // 2. Submit Button Logic Execution
    if (summarizeBtn) {
        summarizeBtn.addEventListener("click", async () => {
            const userInput = noteInput.value.trim();

            if (!userInput) {
                alert("Please type or paste some text first!");
                return;
            }

            // Quick Execution path for the Pomodoro Study Block Mode
            if (currentMode === "timer") {
                resultHeading.innerText = "⏱️ Pomodoro Focus Block Engaged";
                aiOutputText.innerHTML = `StudySyncs AI has started a focused session for: <strong>"${userInput}"</strong>.<br><br>🏁 <strong>Stay on task for the next 25 minutes!</strong> Keep your browser tab open; it will alert you when it's time to take a break.`;
                resultBox.style.display = "block";
                resultBox.scrollIntoView({ behavior: 'smooth' });

                setTimeout(() => {
                    alert("Focus block completed! Take a 5-minute study break.");
                }, 25 * 60 * 1000);
                return;
            }

            // Tailor the AI prompts based on mode
            let systemPrompt = "";
            if (currentMode === "notes") {
                systemPrompt = `You are an elite academic study assistant named StudySyncs AI. Break down, simplify, and summarize the following material into logical structures using bold headings and bullet points:\n\n${userInput}`;
                resultHeading.innerText = "✨ StudySyncs AI Summary";
            } else if (currentMode === "flashcards") {
                systemPrompt = `You are StudySyncs AI. Read the following textbook inputs and convert them into a clean review deck of high-yield flashcards. Format them exactly like this structure: FRONT: (Question) BACK: (Short answer). Do not include extra commentary, introductions, or wrappers. Here is the material:\n${userInput}`;
                resultHeading.innerText = "🗂️ Generated Revision Flashcards";
            }

            // Visual loading feedback state
            summarizeBtn.innerText = "Processing Workspace Data...";
            summarizeBtn.disabled = true;

            try {
                // Using the absolute universally supported core endpoint format pathing
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;
                
                const response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: systemPrompt }] }]
                    })
                });

                const data = await response.json();

                if (data.error) {
                    alert(`Google API Error: ${data.error.message}`);
                    return;
                }

                if (data.candidates && data.candidates[0].content.parts[0].text) {
                    const rawText = data.candidates[0].content.parts[0].text;
                    
                    // Run response text through formatting parser
                    aiOutputText.innerHTML = formatAIResponse(rawText);
                    resultBox.style.display = "block";
                    resultBox.scrollIntoView({ behavior: 'smooth' });
                }

            } catch (error) {
                console.error(error);
                alert("Network communication failed to query AI backend.");
            } finally {
                // Reset button based on the context state
                if (currentMode === "notes") {
                    summarizeBtn.innerText = "Generate AI Summary";
                } else if (currentMode === "flashcards") {
                    summarizeBtn.innerText = "Convert to Flashcards";
                } else {
                    summarizeBtn.innerText = "Start AI-Guided Study Block";
                }
                summarizeBtn.disabled = false;
            }
        });
    }
});