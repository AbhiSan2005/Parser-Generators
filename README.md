# Parser Generators

A full-stack toolkit for **Theory of Computation** and **Compiler Design**. It converts, visualizes, and simulates **Regular Automata** and **Context-Free Grammars**, and compiles user-defined grammars into working **LL(1)**, **LR(0)**, and **SLR(1)** parsers with downloadable, standalone parser code.

The system is split into two independent applications:

- **`backend/`** – Node.js/Express API implementing all automata and parsing algorithms, with MongoDB persistence.
- **`frontend/`** – React (Vite) single-page application for building, visualizing, and testing automata and grammars.

---

# Features

## Regular Automata Workspace

- Convert a regular expression to postfix notation (Modified Shunting-Yard algorithm).
- Build an ε-NFA from a regular expression using Thompson's Construction.
- Convert an ε-NFA to a standard NFA (ε-elimination).
- Convert an ε-NFA or NFA to a DFA using Subset (Powerset) Construction.
- Minimize a DFA using Hopcroft's Algorithm.
- Convert a DFA back to a regular expression using the GNFA state-elimination method.
- AI-assisted generation: describe a language in plain English and generate the corresponding regular expression (for regular languages) using an LLM pipeline.
- Multi-tab workspaces where each tab stores an automaton or regular expression, allowing algorithm outputs to be opened in new tabs.

## Context-Free Grammar & Parser Playground

- Nullable variable, FIRST set, and FOLLOW set computation using fixed-point iteration.
- Grammar sanitization through automatic immediate left-recursion elimination and left factoring.
- LL(1) parsing table construction with conflict detection.
- LR(0) item set/automaton construction and SLR(1) parsing table generation with shift-reduce and reduce-reduce conflict detection.
- Step-by-step parser simulation for:
  - LL(1) stack-driven parsing
  - LR(0)/SLR(1) shift-reduce parsing
- Automatic Abstract Syntax Tree (AST) generation.
- Standalone recursive-descent parser code generation for LL(1) grammars with panic-mode error recovery in:
  - JavaScript
  - Python
  - C++
- AI-assisted CFG generation from natural language descriptions using an LLM pipeline.
- CFG utility pipeline including:
  - Alphabet extraction
  - Grammar parsing and formatting
  - CFG simplification (useless symbols, unit productions, ε-productions)
  - Chomsky Normal Form conversion
  - CYK membership testing
- Persistent playgrounds storing grammar source, parsing tables, conflicts, generated parser code, evaluation history, ASTs, and parser results.

## General

- User authentication using a basic username/password system.
- Interactive canvas-based visualization for automata graphs and parse trees using Graphviz-based layouts.

---

# Tech Stack

## Backend

- Node.js
- Express 5
- MongoDB
- Mongoose
- OpenAI SDK (via NVIDIA integration endpoint)

## Frontend

- React 19
- Vite
- React Router
- Redux Toolkit
- Tailwind CSS
- Axios
- GSAP
- @xyflow/react
- Dagre
- Graphviz (`@hpcc-js/wasm`, `@viz-js/viz`)

---

# Project Structure

```text
backend/
  src/
    models/
    routes/
    controllers/
    services/
      automata/
      topDownService.js
      bottomUpService.js
      regexGenerationLLM.js
      cfgGenerationLLM.js
      cfgSimplificationService.js
      cfgToCnfService.js
      cykService.js
    utils/
      tokenizer.js
      nullable.js
      firstSets.js
      followSets.js
      topdown/
      bottomup/
    server.js

frontend/
  src/
    api/
    pages/
    components/
      canvas/
      playground/
    store/
    layouts/
```

---

# API Overview

All routes are mounted at the Express application root.

## Users

- `GET /users`
- `POST /user`

## Workspaces

- `POST /workspaces`
- `GET /workspaces/user/:user_id`
- `GET /workspaces/:workspace_id`
- `PUT /workspaces/:workspace_id`
- `DELETE /workspaces/:workspace_id`
- `POST /workspaces/:workspace_id/tabs`
- `PUT /workspaces/:workspace_id/tabs/:tab_id`
- `PUT /workspaces/:workspace_id/active-tab`
- `DELETE /workspaces/:workspace_id/tabs/:tab_id`

## Automata Algorithms

- `POST /workspaces/:workspace_id/tabs/:tab_id/execute`

Runs one of the supported automata algorithms:

- Regex → ε-NFA
- ε-NFA → NFA
- ε-NFA/NFA → DFA
- DFA Minimization
- DFA → Regular Expression

## AI-Assisted Generation

- `POST /ai/generate-regex`
- `POST /ai/generate-cfg`

## Parser Playgrounds

- `POST /playgrounds`
- `GET /playgrounds/user/:userId`
- `GET /playgrounds/:id`
- `PUT /playgrounds/:id`
- `DELETE /playgrounds/:id`
- `PUT /playgrounds/:id/grammar`
- `POST /playgrounds/:id/compile`
- `POST /playgrounds/:id/evaluate`

---

# Deployment

**Frontend:**  
https://parser-generators-frontend.vercel.app/

---

# Algorithms Implemented

| Area | Algorithm |
|------|-----------|
| Regex Processing | Modified Shunting-Yard (Infix → Postfix) |
| Regex to Automaton | Thompson's Construction (ε-NFA) |
| NFA Processing | ε-Closure Computation, ε-NFA → NFA |
| Determinization | Subset (Powerset) Construction |
| DFA Minimization | Hopcroft's Algorithm |
| Automaton to Regex | GNFA State-Elimination |
| CFG Analysis | Nullable, FIRST, FOLLOW (Fixed-Point Iteration) |
| CFG Sanitization | Immediate Left-Recursion Elimination, Left Factoring |
| CFG Normalization | Useless Symbol Removal, Unit Production Elimination, ε-Production Elimination, Chomsky Normal Form |
| CFG Membership | CYK Algorithm |
| Top-Down Parsing | LL(1) Parsing Table Construction, Stack-Based Simulation, Recursive-Descent Code Generation with Panic-Mode Recovery |
| Bottom-Up Parsing | LR(0)/LR(1) Item Set Construction, SLR(1) ACTION/GOTO Table Construction, Shift-Reduce Parsing |

---

# Authors

## Karan Ahuja

**GitHub:**  
https://github.com/Karan-30506

## Abhiraj Sankpal

**GitHub:**  
https://github.com/AbhiSan2005