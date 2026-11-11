
#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const TARGET_EXTENSIONS = [".js", ".mjs", ".cjs", ".ts"];

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const issues = [];

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    if (line.includes("TODO")) {
      issues.push({
        line: lineNumber,
        type: "TODO",
        message: "Unfinished task found"
      });
    }

    if (line.includes("FIXME")) {
      issues.push({
        line: lineNumber,
        type: "FIXME",
        message: "Code needs fixing"
      });
    }

    if (line.includes("debugger;")) {
      issues.push({
        line: lineNumber,
        type: "DEBUGGER",
        message: "Remove debugger before production"
      });
    }

    if (line.includes("console.log(")) {
      issues.push({
        line: lineNumber,
        type: "CONSOLE",
        message: "Remove unnecessary console.log"
      });
    }

    if (line.length > 120) {
      issues.push({
        line: lineNumber,
        type: "LONG LINE",
        message: "Line exceeds 120 characters"
      });
    }
  });

  return issues;
}

function scanDirectory(directory) {
  const results = [];

  const ignored = ["node_modules", ".git"];

  for (const item of fs.readdirSync(directory)) {
    if (ignored.includes(item)) continue;

    const fullPath = path.join(directory, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      results.push(...scanDirectory(fullPath));
    } else if (TARGET_EXTENSIONS.includes(path.extname(item))) {
      results.push({
        file: fullPath,
        issues: analyzeFile(fullPath)
      });
    }
  }

  return results;
}

const target = process.argv[2] || ".";

if (!fs.existsSync(target)) {
  console.error("Error: Target path does not exist.");
  process.exit(1);
}

const stats = fs.statSync(target);

const results = stats.isDirectory()
  ? scanDirectory(target)
  : [{
      file: target,
      issues: analyzeFile(target)
    }];

let totalIssues = 0;

console.log("\n=== DevHelper AI Code Analyzer ===\n");

for (const result of results) {
  console.log(`File: ${result.file}`);

  if (result.issues.length === 0) {
    console.log("  No issues found!");
  }

  for (const issue of result.issues) {
    totalIssues++;
    console.log(
      `  [${issue.type}] Line ${issue.line}: ${issue.message}`
    );
  }

  console.log("");
}

console.log("--------------------------------");
console.log(`Files scanned: ${results.length}`);
console.log(`Issues found: ${totalIssues}`);
