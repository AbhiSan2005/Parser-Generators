## 🏗️ File Tree Diagram

```text
src/
├── models/
│   └── ParserPlayground.js       # Mongoose schema for the Playground workspace state
│
├── routes/
│   └── parserRoutes.js           # Unified HTTP endpoints (Compile, Test, Download)
│
├── controllers/
│   └── parserController.js       # Core router: inspects dropdown parser_type and invokes services
│
├── utils/
│   ├── tokenizer.js              # SHARED LEXER: Turns sandbox strings into terminal arrays
│   ├── nullable.js               # SHARED MATH: Identifies variables deriving epsilon (ε)
│   ├── firstSets.js              # SHARED MATH: Computes FIRST terminal arrays
│   └── followSets.js             # SHARED MATH: Computes FOLLOW terminal arrays (includes '$')
│
│   ├── topdown/
│   │   ├── ll1Preprocessor.js    # PREPROCESSOR: Auto-removes Left Recursion & Left Factoring
│   │   ├── ll1TableBuilder.js    # COMPILER: Generates M[A, a] matrix arrays and catches conflicts
│   │   ├── ll1Engine.js          # UI SIMULATOR: Processes JSON tables to return an AST for the canvas
│   │   └── ll1CodeGenerator.js   # DOWNLOAD TEMPLATES: Prints standalone LL(1) files (JS/Py/C++)
│   │
│   └── bottomup/
│       ├── lrAugmenter.js        # PREPROCESSOR: Augments grammar by injecting the S' -> S rule
│       ├── lr0Items.js           # MATH: Tracks item-sets via closures and GOTO transitions
│       ├── lr1Items.js           # MATH: Computes advanced item-sets with lookahead tracking
│       ├── slrTableBuilder.js    # COMPILER: Compiles Action/Goto matrices and logs ambiguities
│       ├── shiftReduceEngine.js  # UI SIMULATOR: Standard Shift-Reduce stack parsing loop for the AST
│       └── lrCodeGenerator.js    # DOWNLOAD TEMPLATES: Prints standalone LR parser files (JS/Py/C++)
│
└── services/
    ├── topDownService.js         # ABHIRAJ: Orchestrates LL(1) compilation pipeline -> Playground Schema
    └── bottomUpService.js        # YOURS: Orchestrates SLR(1)/LR(1) compilation pipeline -> Playground Schema