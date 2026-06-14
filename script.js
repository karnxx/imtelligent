const tools = ['math', 'explain', 'essay', 'diagram', 'compound',
    'balancer', 'graph', 'notes', 'audio', 'simplifier', 'quiz', 'syllabus', 'project'];

const histories = {
    math: [], explain: [], essay: [], diagram: [], compound: [],
    balancer: [], graph: [], notes: [], audio: [], simplifier: [],
    quiz: [], syllabus: [], project: []
};

// Common compounds for the compound reactor picker
const COMMON_COMPOUNDS = [
    'H₂O (Water)', 'HCl (Hydrochloric acid)', 'H₂SO₄ (Sulfuric acid)',
    'HNO₃ (Nitric acid)', 'NaOH (Sodium hydroxide)', 'KOH (Potassium hydroxide)',
    'Ca(OH)₂ (Calcium hydroxide)', 'NaCl (Sodium chloride)', 'CaCO₃ (Calcium carbonate)',
    'Na₂CO₃ (Sodium carbonate)', 'NH₃ (Ammonia)', 'CO₂ (Carbon dioxide)',
    'O₂ (Oxygen)', 'H₂ (Hydrogen)', 'N₂ (Nitrogen)', 'CH₄ (Methane)',
    'C₂H₅OH (Ethanol)', 'CH₃COOH (Acetic acid)', 'NaHCO₃ (Sodium bicarbonate)',
    'MgO (Magnesium oxide)', 'Fe₂O₃ (Iron oxide)', 'CuSO₄ (Copper sulfate)',
    'AgNO₃ (Silver nitrate)', 'Zn (Zinc)', 'Fe (Iron)', 'Cu (Copper)',
    'Mg (Magnesium)', 'Al (Aluminium)', 'Na (Sodium)', 'K (Potassium)'
];

var apikey = '';

// ─── MARKDOWN RENDERER ────────────────────────────────────
function renderMarkdown(text) {
    if (typeof marked !== 'undefined') {
        return marked.parse ? marked.parse(text) : marked(text);
    }
    // Fallback — basic formatting without marked.js
    return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/^## (.+)$/gm, '<h5>$1</h5>')
        .replace(/^### (.+)$/gm, '<h6>$1</h6>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
        .replace(/\n/g, '<br>');
}

function switchTo(input) {
    tools.forEach(t => {
        document.getElementById('panel-' + t).style.display = t === input ? 'block' : 'none';
    });
}

function assignapi() {
    apikey = document.getElementById('apikey').value.trim();
    if (!apikey) { alert('Please enter an API key.'); return; }
    console.log('API key set for', document.getElementById('ai-picker').value);
}

// ─── COMPOUND PICKER SETUP ────────────────────────────────
// Called on page load to populate the compound datalists
function setupCompoundPickers() {
    ['compound1-list', 'compound2-list'].forEach(id => {
        const dl = document.getElementById(id);
        if (!dl) return;
        COMMON_COMPOUNDS.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            dl.appendChild(opt);
        });
    });
}

window.onload = setupCompoundPickers;

// ═══════════════════════════════════════════════════════════
// MATH HELPER
// Socratic tutoring — never gives the answer directly.
// Rich formatted output like Microsoft Math Solver.
// ═══════════════════════════════════════════════════════════
async function solvemath() {
    if (!apikey) { document.getElementById('math-output').innerHTML = 'Enter your API key first.'; return; }

    const input = document.getElementById('problemmath').value.trim();
    if (!input) return;

    const output = document.getElementById('math-output');
    output.innerHTML += `<div class="msg-user">💬 <strong>You:</strong> ${input}</div>`;
    output.innerHTML += `<div class="msg-thinking" id="thinking">🤔 <em>Thinking...</em></div>`;
    document.getElementById('problemmath').value = '';
    output.scrollTop = output.scrollHeight;

    try {
        const result = await askAI('math',
            `You are a patient math tutor. Format ALL responses like this:

## 🔍 What I See
(briefly identify the problem type)

## 💡 Hint
(give ONE small nudging hint — never the full solution)

## ❓ Think About This
(ask the student one guiding question to push them forward)

NEVER give the full answer. Be warm and encouraging.
${getDBContext()}`, input);

        document.getElementById('thinking').remove();
        output.innerHTML += `<div class="msg-ai">🤖 <strong>AI Tutor:</strong><div class="ai-content">${renderMarkdown(result)}</div></div>`;
        output.scrollTop = output.scrollHeight;
        saveToDB('Math Helper', input, result);
    } catch (e) {
        document.getElementById('thinking').remove();
        output.innerHTML += `<div class="msg-error">⚠️ Failed. Try again.</div>`;
    }
}

function resetMath() { clearChat('math'); document.getElementById('math-output').innerHTML = ''; }

// ═══════════════════════════════════════════════════════════
// EXPLAIN THIS
// Rich structured explanations with analogies and examples.
// ═══════════════════════════════════════════════════════════
async function solveexplain() {
    if (!apikey) { document.getElementById('explain-output').innerHTML = 'Enter your API key first.'; return; }

    const input = document.getElementById('explain').value.trim();
    if (!input) return;

    const level = document.getElementById('explain-level').value;
    const output = document.getElementById('explain-output');
    output.innerHTML += `<div class="msg-user">💬 <strong>You:</strong> ${input}</div>`;
    output.innerHTML += `<div class="msg-thinking" id="thinking-explain">🤔 <em>Thinking...</em></div>`;
    document.getElementById('explain').value = '';

    try {
        const result = await askAI('explain',
            `You are an expert STEM teacher explaining to a ${level} student.
Always format your response like this:

## 📖 The Simple Explanation
(explain in plain language the student can understand)

## 🌍 Real-World Analogy
(give one creative real-world analogy)

## 🔬 How It Actually Works
(the deeper explanation with more detail)

## ⚡ Key Facts to Remember
- fact 1
- fact 2
- fact 3

If the student asks a follow-up, build on your previous explanation.
${getDBContext()}`, input);

        document.getElementById('thinking-explain').remove();
        output.innerHTML += `<div class="msg-ai">🤖 <strong>AI Teacher:</strong><div class="ai-content">${renderMarkdown(result)}</div></div>`;
        output.scrollTop = output.scrollHeight;
        saveToDB('Explain This', input, result);
    } catch (e) {
        document.getElementById('thinking-explain').remove();
        output.innerHTML += `<div class="msg-error">⚠️ Failed. Try again.</div>`;
    }
}

function resetExplain() { clearChat('explain'); document.getElementById('explain-output').innerHTML = ''; }

// ═══════════════════════════════════════════════════════════
// ESSAY FEEDBACK
// ═══════════════════════════════════════════════════════════
async function solveessay() {
    if (!apikey) { document.getElementById('essay-output').innerHTML = 'Enter your API key first.'; return; }

    const input = document.getElementById('essay').value.trim();
    if (!input) return;

    const subject = document.getElementById('essay-subject').value;
    const output = document.getElementById('essay-output');
    output.innerHTML += `<div class="msg-user">💬 <strong>You:</strong> ${input.substring(0, 100)}...</div>`;
    output.innerHTML += `<div class="msg-thinking" id="thinking-essay">📝 <em>Reading your essay...</em></div>`;
    document.getElementById('essay').value = '';

    try {
        const result = await askAI('essay',
            `You are a ${subject} teacher. Format feedback like this:

## 📊 Overall Score
(give a score out of 10 with one sentence summary)

## ✅ What Works Well
- specific strength 1
- specific strength 2

## ⚠️ What Needs Improvement
- specific weakness 1 with explanation
- specific weakness 2 with explanation

## 🔬 Scientific Accuracy
(check if the science is correct — flag any errors)

## 💡 Top 3 Suggestions
1. most important improvement
2. second improvement  
3. third improvement

Focus on THINKING QUALITY not grammar.
${getDBContext()}`, input);

        document.getElementById('thinking-essay').remove();
        output.innerHTML += `<div class="msg-ai">🤖 <strong>AI Teacher:</strong><div class="ai-content">${renderMarkdown(result)}</div></div>`;
        output.scrollTop = output.scrollHeight;
        saveToDB('Essay Feedback', input, result);
    } catch (e) {
        document.getElementById('thinking-essay').remove();
        output.innerHTML += `<div class="msg-error">⚠️ Failed. Try again.</div>`;
    }
}

function resetEssay() { clearChat('essay'); document.getElementById('essay-output').innerHTML = ''; }

// ═══════════════════════════════════════════════════════════
// DIAGRAM LABELLER
// ═══════════════════════════════════════════════════════════
function drawImageOnCanvas(imageDataUrl) {
    const canvas = document.getElementById('diagram-canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.style.display = 'block';
        ctx.drawImage(img, 0, 0);
    };
    img.src = imageDataUrl;
}

async function solvediagram() {
    const visionKey = document.getElementById('vision-key').value.trim();
    if (!visionKey) { document.getElementById('diagram-output').innerHTML = 'Enter your OpenRouter API key first.'; return; }

    const file = document.getElementById('diagram-file').files[0];
    const question = document.getElementById('diagram-question').value.trim();
    const output = document.getElementById('diagram-output');

    if (!file && !question) return;

    output.innerHTML += `<div class="msg-user">💬 <strong>You:</strong> ${question || '[Uploaded a diagram]'}</div>`;
    output.innerHTML += `<div class="msg-thinking" id="thinking-diagram">👀 <em>Analysing image...</em></div>`;
    document.getElementById('diagram-question').value = '';

    try {
        let base64, mimeType;
        if (file) {
            const reader = new FileReader();
            base64 = await new Promise((res, rej) => {
                reader.onload = e => res(e.target.result.split(',')[1]);
                reader.onerror = rej;
                reader.readAsDataURL(file);
            });
            mimeType = file.type;
            drawImageOnCanvas(`data:${mimeType};base64,${base64}`);
            document.getElementById('diagram-file').value = '';
        }

        const promptText = file
            ? `Look at this diagram carefully. Format your response like this:

## 🔬 Diagram Overview
(one sentence describing what this diagram shows)

## 📋 Labelled Parts
(numbered list — for each part: name, function, why it matters)

## 🔗 How They Connect
(explain how the parts work together)

## ⚡ Key Takeaway
(the most important thing to understand from this diagram)

${question ? `Also address: ${question}` : ''}`
            : question;

        const newMessage = {
            role: 'user',
            content: file ? [
                { type: 'text', text: promptText },
                { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } }
            ] : promptText
        };

        histories['diagram'].push(newMessage);

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${visionKey}` },
            body: JSON.stringify({
                model: 'meta-llama/llama-3.2-11b-vision-instruct',
                messages: histories['diagram']
            })
        });

        const data = await response.json();
        if (!response.ok || !data.choices) throw new Error(data.error?.message || 'Vision request failed.');

        const result = data.choices[0].message.content;
        histories['diagram'].push({ role: 'assistant', content: result });

        document.getElementById('thinking-diagram').remove();
        output.innerHTML += `<div class="msg-ai">🤖 <strong>AI Teacher:</strong><div class="ai-content">${renderMarkdown(result)}</div></div>`;
        output.scrollTop = output.scrollHeight;
        saveToDB('Diagram Labeller', question || '[Diagram upload]', result);
    } catch (e) {
        document.getElementById('thinking-diagram').remove();
        output.innerHTML += `<div class="msg-error">⚠️ ${e.message}</div>`;
    }
}

function resetDiagram() {
    clearChat('diagram');
    document.getElementById('diagram-output').innerHTML = '';
    const canvas = document.getElementById('diagram-canvas');
    canvas.style.display = 'none';
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

// ═══════════════════════════════════════════════════════════
// COMPOUND REACTOR
// Searchable compound picker + visual reaction display.
// ═══════════════════════════════════════════════════════════
async function solvecompound() {
    if (!apikey) { document.getElementById('compound-output').innerHTML = 'Enter your API key first.'; return; }

    const c1 = document.getElementById('compound1').value.trim();
    const c2 = document.getElementById('compound2').value.trim();
    const temp = document.getElementById('compound-temp').value;
    const catalyst = document.getElementById('compound-catalyst').value;
    const output = document.getElementById('compound-output');

    if (!c1 || !c2) { output.innerHTML = '<div class="msg-error">Enter both compounds first.</div>'; return; }

    output.innerHTML += `<div class="msg-user">💬 <strong>You:</strong> ${c1} + ${c2} (${temp}, catalyst: ${catalyst})</div>`;
    output.innerHTML += `<div class="msg-thinking" id="thinking-compound">⚗️ <em>Simulating reaction...</em></div>`;

    try {
        const result = await askAI('compound',
            `You are a chemistry simulator. Format your response like this:

## ⚗️ Reaction Equation
(write the balanced equation clearly)

## 🧪 Products Formed
- product 1: what it is
- product 2: what it is (if applicable)

## 🌡️ Energy Change
(is it exothermic or endothermic? explain why)

## 🔬 What Happens at the Molecular Level
(explain the chemistry in simple terms)

## ⚠️ Safety & Observations
(what would you see/smell/feel? any hazards?)

Be scientifically accurate.`,
            `Compound 1: ${c1}\nCompound 2: ${c2}\nTemperature: ${temp}\nCatalyst: ${catalyst}`
        );

        document.getElementById('thinking-compound').remove();
        output.innerHTML += `<div class="msg-ai">⚗️ <strong>Chemistry AI:</strong><div class="ai-content">${renderMarkdown(result)}</div></div>`;
        output.scrollTop = output.scrollHeight;
        saveToDB('Compound Reactor', `${c1} + ${c2}`, result);
    } catch (e) {
        document.getElementById('thinking-compound').remove();
        output.innerHTML += `<div class="msg-error">⚠️ Failed. Try again.</div>`;
    }
}

function resetCompound() {
    clearChat('compound');
    document.getElementById('compound-output').innerHTML = '';
}

// ═══════════════════════════════════════════════════════════
// EQUATION BALANCER
// ═══════════════════════════════════════════════════════════
async function solvebalancer() {
    if (!apikey) { document.getElementById('balancer-output').innerHTML = 'Enter your API key first.'; return; }

    const input = document.getElementById('equation-input').value.trim();
    if (!input) return;

    const output = document.getElementById('balancer-output');
    output.innerHTML += `<div class="msg-user">💬 <strong>You:</strong> ${input}</div>`;
    output.innerHTML += `<div class="msg-thinking" id="thinking-balancer">⚗️ <em>Balancing...</em></div>`;
    document.getElementById('equation-input').value = '';

    try {
        const result = await askAI('balancer',
            `You are a chemistry teacher. Format your response like this:

## ⚖️ Balanced Equation
(write the final balanced equation clearly and prominently)

## 📝 Step-by-Step Working
Step 1: (what you count first)
Step 2: (what coefficient you add and why)
Step 3: (continue until balanced)

## ✅ Verification
(confirm atom counts on both sides match)

## 💡 The Rule Used
(explain the underlying chemistry principle)`,
            `Balance this equation: ${input}`
        );

        document.getElementById('thinking-balancer').remove();
        output.innerHTML += `<div class="msg-ai">⚗️ <strong>Chemistry AI:</strong><div class="ai-content">${renderMarkdown(result)}</div></div>`;
        output.scrollTop = output.scrollHeight;
        saveToDB('Equation Balancer', input, result);
    } catch (e) {
        document.getElementById('thinking-balancer').remove();
        output.innerHTML += `<div class="msg-error">⚠️ Failed. Try again.</div>`;
    }
}

function resetBalancer() { clearChat('balancer'); document.getElementById('balancer-output').innerHTML = ''; }

// ═══════════════════════════════════════════════════════════
// GRAPH PLOTTER
// ═══════════════════════════════════════════════════════════
async function solvegraph() {
    if (!apikey) { document.getElementById('graph-output').innerHTML = 'Enter your API key first.'; return; }

    const input = document.getElementById('graph-input').value.trim();
    if (!input) return;

    const output = document.getElementById('graph-output');
    output.innerHTML += `<div class="msg-user">💬 <strong>You:</strong> ${input}</div>`;
    output.innerHTML += `<div class="msg-thinking" id="thinking-graph">📈 <em>Plotting...</em></div>`;

    try {
        const result = await askAI('graph',
            `You are a math teacher and graphing assistant. Do TWO things:

1. Output one line: EXPRESSION: followed by a valid JavaScript math expression 
   using x as the variable. Use Math.sin, Math.cos, Math.sqrt, Math.abs, Math.pow.
   Example: EXPRESSION: Math.pow(x, 2) + 3*x - 2

2. Then format your explanation like:

## 📈 About This Graph
(what type of function/graph this is)

## 🔑 Key Features
- **x-intercepts:** (where it crosses x-axis)
- **y-intercept:** (where it crosses y-axis)
- **Domain:** (valid x values)
- **Range:** (valid y values)
- **Special points:** (turning points, asymptotes etc)

## 💡 What This Means
(real-world meaning or mathematical significance)`, input);

        document.getElementById('thinking-graph').remove();

        const exprMatch = result.match(/EXPRESSION:\s*(.+)/);
        if (exprMatch && typeof Plotly !== 'undefined') {
            const expr = exprMatch[1].trim();
            const xValues = [], yValues = [];
            for (let x = -10; x <= 10; x += 0.05) {
                xValues.push(parseFloat(x.toFixed(2)));
                try {
                    const y = eval(expr.replace(/x/g, `(${x})`));
                    yValues.push(isFinite(y) && Math.abs(y) < 1000 ? y : null);
                } catch (e) { yValues.push(null); }
            }
            const plotId = 'plot-' + Date.now();
            output.innerHTML += `<div id="${plotId}" style="width:100%;height:320px;margin:10px 0;border-radius:8px;overflow:hidden;"></div>`;
            Plotly.newPlot(plotId, [{
                x: xValues, y: yValues, type: 'scatter', mode: 'lines',
                line: { color: '#4361ee', width: 2.5 }
            }], {
                margin: { t: 20, b: 40, l: 50, r: 20 },
                xaxis: { title: 'x', zeroline: true, zerolinecolor: '#888', gridcolor: '#eee' },
                yaxis: { title: 'y', zeroline: true, zerolinecolor: '#888', gridcolor: '#eee' },
                paper_bgcolor: 'white', plot_bgcolor: 'white'
            }, { responsive: true });
        }

        const explanation = result.replace(/EXPRESSION:.+\n?/, '').trim();
        output.innerHTML += `<div class="msg-ai">📈 <strong>Math AI:</strong><div class="ai-content">${renderMarkdown(explanation)}</div></div>`;
        output.scrollTop = output.scrollHeight;
        saveToDB('Graph Plotter', input, result);
    } catch (e) {
        document.getElementById('thinking-graph')?.remove();
        output.innerHTML += `<div class="msg-error">⚠️ Failed. Try again.</div>`;
    }
}

function resetGraph() { clearChat('graph'); document.getElementById('graph-output').innerHTML = ''; }

// ═══════════════════════════════════════════════════════════
// NOTE STRUCTURIZER
// ═══════════════════════════════════════════════════════════
async function solvenotes() {
    if (!apikey) { document.getElementById('notes-output').innerHTML = 'Enter your API key first.'; return; }

    const input = document.getElementById('notes-input').value.trim();
    const format = document.getElementById('notes-format').value;
    if (!input) return;

    const output = document.getElementById('notes-output');
    output.innerHTML = `<div class="msg-thinking" id="thinking-notes">📋 <em>Structuring your notes...</em></div>`;

    try {
        const result = await askAI('notes',
            `You are an expert note organizer. Reorganize the student's notes into 
             ${format} format. Use clear headings (##), bold key terms (**term**), 
             bullet points for lists, and numbered lists for sequences or steps. 
             Make it clean, scannable, and easy to study from.
             Group related ideas together. Highlight the most important concepts.`,
            input
        );
        document.getElementById('thinking-notes').remove();
        output.innerHTML = `<div class="ai-content">${renderMarkdown(result)}</div>`;
        saveToDB('Note Structurizer', input.substring(0, 100), result);
    } catch (e) {
        document.getElementById('thinking-notes').remove();
        output.innerHTML = `<div class="msg-error">⚠️ Failed. Try again.</div>`;
    }
}

// ═══════════════════════════════════════════════════════════
// AUDIO TO NOTES
// ═══════════════════════════════════════════════════════════
let recognition = null, isRecording = false, transcript = '';

function toggleRecording() { isRecording ? stopRecording() : startRecording(); }

function startRecording() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Voice input requires Chrome or Edge.'); return; }
    recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (e) => {
        let final = '';
        for (const r of e.results) { if (r.isFinal) final += r[0].transcript + ' '; }
        transcript += final;
        document.getElementById('audio-transcript').value = transcript;
    };
    recognition.onerror = () => stopRecording();
    recognition.start();
    isRecording = true;
    document.getElementById('rec-btn').textContent = '⏹️ Stop Recording';
    document.getElementById('rec-btn').className = 'btn btn-danger';
    document.getElementById('rec-status').textContent = '🔴 Recording...';
}

function stopRecording() {
    if (recognition) recognition.stop();
    isRecording = false;
    document.getElementById('rec-btn').textContent = '🎙️ Start Recording';
    document.getElementById('rec-btn').className = 'btn btn-outline-danger';
    document.getElementById('rec-status').textContent = 'Stopped.';
}

async function solveaudio() {
    if (!apikey) { document.getElementById('audio-output').innerHTML = 'Enter your API key first.'; return; }
    const text = document.getElementById('audio-transcript').value.trim();
    if (!text) { document.getElementById('audio-output').innerHTML = '<div class="msg-error">No transcript yet.</div>'; return; }
    const format = document.getElementById('audio-format').value;
    const output = document.getElementById('audio-output');
    output.innerHTML = `<div class="msg-thinking" id="thinking-audio">📝 <em>Converting to notes...</em></div>`;

    try {
        const result = await askAI('audio',
            `You are an expert note taker. Convert this spoken transcript into 
             ${format} format. Remove filler words, repetitions, and speech artifacts.
             Use clear headings (##), bullet points, and bold key terms.
             Organize logically — group related points together.`,
            text
        );
        document.getElementById('thinking-audio').remove();
        output.innerHTML = `<div class="ai-content">${renderMarkdown(result)}</div>`;
        saveToDB('Audio to Notes', text.substring(0, 100), result);
    } catch (e) {
        document.getElementById('thinking-audio').remove();
        output.innerHTML = `<div class="msg-error">⚠️ Failed. Try again.</div>`;
    }
}

function resetAudio() {
    transcript = '';
    document.getElementById('audio-transcript').value = '';
    document.getElementById('audio-output').innerHTML = '';
    if (isRecording) stopRecording();
}

// ═══════════════════════════════════════════════════════════
// PROBLEM SIMPLIFIER
// ═══════════════════════════════════════════════════════════
async function solvesimplifier() {
    if (!apikey) { document.getElementById('simplifier-output').innerHTML = 'Enter your API key first.'; return; }
    const input = document.getElementById('simplifier-input').value.trim();
    if (!input) return;
    const output = document.getElementById('simplifier-output');
    output.innerHTML = `<div class="msg-thinking" id="thinking-simplifier">🤔 <em>Simplifying...</em></div>`;

    try {
        const result = await askAI('simplifier',
            `You are an expert at making problems easy to understand.
Format your response like this:

## ✏️ Simplified Problem
(rewrite in the simplest possible plain English — as if explaining to a 12 year old)

## 📥 What You're Given
- piece of information 1
- piece of information 2
(list every given value or fact)

## 🎯 What You Need to Find
- what the question is actually asking for

## 💡 Where to Start
(suggest the first step or approach, without solving it)`,
            // NO getDBContext() here — we don't want chemistry polluting this
            input
        );
        document.getElementById('thinking-simplifier').remove();
        output.innerHTML = `<div class="ai-content">${renderMarkdown(result)}</div>`;
        saveToDB('Problem Simplifier', input, result);
    } catch (e) {
        document.getElementById('thinking-simplifier').remove();
        output.innerHTML = `<div class="msg-error">⚠️ Failed. Try again.</div>`;
    }
}

// ═══════════════════════════════════════════════════════════
// QUIZ GENERATOR
// ═══════════════════════════════════════════════════════════
let quizQuestions = [], quizIndex = 0, quizScore = 0;

async function solvequiz() {
    if (!apikey) { document.getElementById('quiz-output').innerHTML = 'Enter your API key first.'; return; }
    const input = document.getElementById('quiz-input').value.trim();
    const type = document.getElementById('quiz-type').value;
    const difficulty = document.getElementById('quiz-difficulty').value;
    const count = document.getElementById('quiz-count').value;
    if (!input) return;
    const output = document.getElementById('quiz-output');
    output.innerHTML = `<div class="msg-thinking">❓ <em>Generating ${count} questions...</em></div>`;

    try {
        const result = await askAI('quiz',
            `You are a quiz generator. Generate exactly ${count} ${type} questions 
             at ${difficulty} difficulty level. 
             Respond with ONLY a valid JSON array, no markdown, no code fences, nothing else:
             For MCQ: [{"q":"question","options":["A","B","C","D"],"answer":"A","explanation":"why"}]
             For True/False: [{"q":"statement","answer":"True","explanation":"why"}]
             For Short answer: [{"q":"question","answer":"answer","explanation":"why"}]`,
            input
        );
        const cleaned = result.replace(/```json|```/g, '').trim();
        quizQuestions = JSON.parse(cleaned);
        quizIndex = 0;
        quizScore = 0;
        output.innerHTML = '';
        showQuizQuestion(output);
        saveToDB('Quiz Generator', input.substring(0, 100), `Generated ${quizQuestions.length} questions`);
    } catch (e) {
        output.innerHTML = `<div class="msg-error">⚠️ Failed to generate quiz. Try again or use a different AI provider.</div>`;
    }
}

function showQuizQuestion(output) {
    if (quizIndex >= quizQuestions.length) {
        const pct = Math.round((quizScore / quizQuestions.length) * 100);
        output.innerHTML = `
            <div class="ai-content">
            <h5>🎉 Quiz Complete!</h5>
            <p><strong>Score: ${quizScore} / ${quizQuestions.length} (${pct}%)</strong></p>
            <p>${pct === 100 ? '🌟 Perfect score!' : pct >= 70 ? '👏 Great job!' : '💪 Keep practising!'}</p>
            </div>`;
        return;
    }
    const q = quizQuestions[quizIndex];
    let html = `<div class="ai-content">
        <p><strong>Question ${quizIndex + 1} of ${quizQuestions.length}:</strong></p>
        <p>${q.q}</p>`;
    if (q.options) {
        html += q.options.map(opt =>
            `<button class="btn btn-outline-secondary btn-sm m-1 quiz-opt" onclick="checkAnswer('${opt.replace(/'/g, "\\'")}')">${opt}</button>`
        ).join('');
    } else {
        html += `<input type="text" class="form-control mb-2" id="quiz-answer" placeholder="Your answer...">
                 <button class="btn btn-primary btn-sm" onclick="checkAnswer(document.getElementById('quiz-answer').value)">Submit</button>`;
    }
    html += '</div>';
    output.innerHTML = html;
}

function checkAnswer(userAnswer) {
    const q = quizQuestions[quizIndex];
    const output = document.getElementById('quiz-output');
    const correct = userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase();
    if (correct) quizScore++;
    output.querySelectorAll('.quiz-opt, button:not([onclick="nextQuestion()"])').forEach(b => b.disabled = true);
    output.innerHTML += `<div class="ai-content mt-2">
        <p>${correct ? '✅ <strong>Correct!</strong>' : `❌ <strong>Wrong.</strong> Answer: <strong>${q.answer}</strong>`}</p>
        <p><em>${q.explanation}</em></p>
        <button class="btn btn-primary btn-sm" onclick="nextQuestion()">Next →</button>
    </div>`;
}

function nextQuestion() { quizIndex++; showQuizQuestion(document.getElementById('quiz-output')); }
function resetQuiz() { quizQuestions = []; quizIndex = 0; quizScore = 0; document.getElementById('quiz-output').innerHTML = ''; }

// ═══════════════════════════════════════════════════════════
// SYLLABUS ANALYZER
// ═══════════════════════════════════════════════════════════
async function solvesyllabus() {
    if (!apikey) { document.getElementById('syllabus-output').innerHTML = 'Enter your API key first.'; return; }
    const input = document.getElementById('syllabus-input').value.trim();
    const examDate = document.getElementById('exam-date').value;
    const hoursPerDay = document.getElementById('study-hours').value;
    if (!input) return;
    const output = document.getElementById('syllabus-output');
    output.innerHTML = `<div class="msg-thinking" id="thinking-syllabus">📚 <em>Building your study plan...</em></div>`;

    try {
        const result = await askAI('syllabus',
            `You are an expert study planner. Format your response like this:

## 📊 Topic Priority Ranking
(rank all topics from most to least important for the exam, with a brief reason)

## 📅 Day-by-Day Study Plan
(create a specific daily plan from today to the exam date)
**Day 1:** Topic X — what to focus on
**Day 2:** Topic Y — what to focus on
(etc. Include revision days in the last few days before exam)

## ⏱️ Time Allocation
- Total days available: X
- Hours per day: Y
- Total study hours: Z

## 💡 Study Tips
(3 specific tips based on this syllabus)
${getDBContext()}`,
            `Syllabus: ${input}
Today: ${new Date().toLocaleDateString()}
Exam date: ${examDate || 'Not specified'}
Hours per day: ${hoursPerDay}`
        );
        document.getElementById('thinking-syllabus').remove();
        output.innerHTML = `<div class="ai-content">${renderMarkdown(result)}</div>`;
        saveToDB('Syllabus Analyzer', input.substring(0, 100), result);
    } catch (e) {
        document.getElementById('thinking-syllabus').remove();
        output.innerHTML = `<div class="msg-error">⚠️ Failed. Try again.</div>`;
    }
}

// ═══════════════════════════════════════════════════════════
// PROJECT FEEDBACK
// ═══════════════════════════════════════════════════════════
async function solveproject() {
    if (!apikey) { document.getElementById('project-output').innerHTML = 'Enter your API key first.'; return; }
    const input = document.getElementById('project-input').value.trim();
    const stage = document.getElementById('project-stage').value;
    const type = document.getElementById('project-type').value;
    if (!input) return;
    const output = document.getElementById('project-output');
    output.innerHTML += `<div class="msg-user">💬 <strong>You:</strong> ${input.substring(0, 120)}...</div>`;
    output.innerHTML += `<div class="msg-thinking" id="thinking-project">🚀 <em>Evaluating project...</em></div>`;
    document.getElementById('project-input').value = '';

    try {
        const result = await askAI('project',
            `You are an expert judge evaluating a student ${type} project (currently ${stage}).
Format your response like this:

## 📊 Scores
| Criterion | Score | Comment |
|---|---|---|
| Feasibility | X/10 | one line |
| Originality | X/10 | one line |
| Impact | X/10 | one line |
| Technical Depth | X/10 | one line |
| **Total** | **X/40** | |

## ✅ What's Great
- specific strength 1
- specific strength 2

## 🔧 What to Improve
1. most important improvement with specific suggestion
2. second improvement
3. third improvement

## 🚀 Next Steps
(3 concrete actionable things to do right now)

Be honest but encouraging.
${getDBContext()}`, input
        );
        document.getElementById('thinking-project').remove();
        output.innerHTML += `<div class="msg-ai">🤖 <strong>Project Judge:</strong><div class="ai-content">${renderMarkdown(result)}</div></div>`;
        output.scrollTop = output.scrollHeight;
        saveToDB('Project Feedback', input, result);
    } catch (e) {
        document.getElementById('thinking-project').remove();
        output.innerHTML += `<div class="msg-error">⚠️ Failed. Try again.</div>`;
    }
}

function resetProject() { clearChat('project'); document.getElementById('project-output').innerHTML = ''; }

// ═══════════════════════════════════════════════════════════
// AI PROVIDERS
// ═══════════════════════════════════════════════════════════
async function askGemini(tool, systemPrompt, userMessage) {
    histories[tool].push({ role: 'user', parts: [{ text: userMessage }] });
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apikey}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ system_instruction: { parts: [{ text: systemPrompt }] }, contents: histories[tool] }) }
    );
    const data = await response.json();
    if (!response.ok || !data.candidates) return data.error?.message || 'Gemini error.';
    const reply = data.candidates[0].content.parts[0].text;
    histories[tool].push({ role: 'model', parts: [{ text: reply }] });
    return reply;
}

async function askOpenAI(tool, systemPrompt, userMessage) {
    histories[tool].push({ role: 'user', content: userMessage });
    const response = await fetch('https://api.openai.com/v1/chat/completions',
        { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apikey}` },
          body: JSON.stringify({ model: 'gpt-4o', messages: [{ role: 'system', content: systemPrompt }, ...histories[tool]] }) }
    );
    const data = await response.json();
    if (!response.ok || !data.choices) return data.error?.message || 'OpenAI error.';
    const reply = data.choices[0].message.content;
    histories[tool].push({ role: 'assistant', content: reply });
    return reply;
}

async function askClaude(tool, systemPrompt, userMessage) {
    histories[tool].push({ role: 'user', content: userMessage });
    const response = await fetch('https://api.anthropic.com/v1/messages',
        { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apikey,
            'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
          body: JSON.stringify({ model: 'claude-opus-4-20250514', max_tokens: 1024, system: systemPrompt, messages: histories[tool] }) }
    );
    const data = await response.json();
    if (!response.ok || !data.content) return data.error?.message || 'Claude error.';
    const reply = data.content[0].text;
    histories[tool].push({ role: 'assistant', content: reply });
    return reply;
}

async function askGroq(tool, systemPrompt, userMessage) {
    histories[tool].push({ role: 'user', content: userMessage });
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions',
        { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apikey}` },
          body: JSON.stringify({ model: 'llama-3.3-70b-versatile', temperature: 0.7,
            messages: [{ role: 'system', content: systemPrompt }, ...histories[tool]] }) }
    );
    const data = await response.json();
    if (!response.ok || !data.choices?.length) return data.error?.message || 'Groq error.';
    const reply = data.choices[0].message.content;
    histories[tool].push({ role: 'assistant', content: reply });
    return reply;
}

async function askAI(tool, systemPrompt, userMessage) {
    const ai = document.getElementById('ai-picker').value;
    if (ai === 'gemini') return await askGemini(tool, systemPrompt, userMessage);
    if (ai === 'openai') return await askOpenAI(tool, systemPrompt, userMessage);
    if (ai === 'claude') return await askClaude(tool, systemPrompt, userMessage);
    if (ai === 'groq') return await askGroq(tool, systemPrompt, userMessage);
}

function clearChat(tool) { if (histories[tool]) histories[tool] = []; }

// ═══════════════════════════════════════════════════════════
// LEARNING DB
// ═══════════════════════════════════════════════════════════
function saveToDB(tool, input, output) {
    const history = JSON.parse(localStorage.getItem('stemHistory') || '[]');
    history.push({ tool, input, output, date: new Date().toLocaleString() });
    localStorage.setItem('stemHistory', JSON.stringify(history));
}

function analyzedb() {
    const history = JSON.parse(localStorage.getItem('stemHistory') || '[]');
    if (!history.length) { document.getElementById('analyze-output').innerHTML = 'No history yet.'; return; }
    let html = '<ul>';
    history.forEach(e => { html += `<li><strong>${e.tool}</strong>: ${e.input} <em>(${e.date})</em></li>`; });
    html += '</ul>';
    document.getElementById('analyze-output').innerHTML = html;
}

async function analyzeweaknesses() {
    if (!apikey) { document.getElementById('analyze-output').innerHTML = 'Enter your API key first.'; return; }
    const history = JSON.parse(localStorage.getItem('stemHistory') || '[]');
    if (!history.length) { document.getElementById('analyze-output').innerHTML = 'No history yet.'; return; }
    document.getElementById('analyze-output').innerHTML = '<em>Analysing... 🔍</em>';
    const summary = history.slice(-20).map(e => `[${e.tool}] ${e.input}`).join('\n');
    const result = await askAI('math',
        `You are an educational analyst. Format your response like this:

## 🧠 Learning Profile
(brief summary of what subjects/topics this student has been working on)

## ⚠️ Main Weak Areas
- weakness 1 with specific explanation
- weakness 2

## ✅ Strengths
- what they seem confident with

## 📈 Recommendations
1. specific action to take this week
2. specific action
3. specific action

Be encouraging and specific.`,
        `Student history:\n${summary}`
    );
    document.getElementById('analyze-output').innerHTML = `<div class="ai-content">${renderMarkdown(result)}</div>`;
}

function cleardb() {
    localStorage.removeItem('stemHistory');
    document.getElementById('analyze-output').innerHTML = 'History cleared.';
}

function getDBContext() {
    const history = JSON.parse(localStorage.getItem('stemHistory') || '[]');
    if (!history.length) return '';
    const summary = history.slice(-10).map(e => `[${e.tool}] ${e.input}`).join('\n');
    return `\n\nStudent's recent learning history (personalise your response based on their level):\n${summary}`;
}