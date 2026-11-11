const fs = require("fs");
const path = require("path");

const EXTENSIONS = [".js", ".mjs", ".cjs", ".ts"];

const ISSUES = [
  { pattern: /TODO/g, type: "TODO", message: "Unfinished task" },
  { pattern: /FIXME/g, type: "FIXME", message: "Needs fixing" },
  { pattern: /debugger;/g, type: "DEBUGGER", message: "Remove debugger statement" },
  { pattern: /console\.log\(/g, type: "CONSOLE", message: "Remove console.log" }
];

let totalFiles = 0;
let totalIssues = 0;

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);

  totalFiles++;

  lines.forEach((line, index) => {
    ISSUES.forEach(issue => {
      if (issue.pattern.test(line)) {
        totalIssues++;
        console.log(
          `[${issue.type}] ${filePath}:${index + 1} - ${issue.message}`
        );
      }

      issue.pattern.lastIndex = 0;
    });

    if (line.length > 120) {
      totalIssues++;
      console.log(
        `[LONG LINE] ${filePath}:${index + 1} - Line exceeds 120 characters`
      );
    }
  });
}

function scanDirectory(directory) {
  const files = fs.readdirSync(directory, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(directory, file.name);

    if (file.isDirectory()) {
      if (file.name !== "node_modules" && file.name !== ".git") {
        scanDirectory(fullPath);
      }
    } else if (EXTENSIONS.includes(path.extname(file.name))) {
      analyzeFile(fullPath);
    }
  }
}

const target = path.resolve(process.argv[2] || ".");

console.log("\n🚀 DevHelper-AI Code Analyzer Started\n");

if (!fs.existsSync(target)) {
  console.error("Error: Target path does not exist.");
  process.exit(1);
}

if (fs.statSync(target).isDirectory()) {
  scanDirectory(target);
} else {
  analyzeFile(target);
}

console.log("\n========== ANALYSIS REPORT ==========");
console.log("Files analyzed:", totalFiles);
console.log("Issues found:", totalIssues);
console.log("=====================================");
console.log("\n✅ Analysis completed!");
