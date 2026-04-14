import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function listFilesRecursive(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFilesRecursive(fullPath));
      continue;
    }
    files.push(fullPath);
  }
  return files;
}

const typesContent = readFile("src/navigation/types.ts");
const routeSet = new Set();

for (const match of typesContent.matchAll(/^\s{2}([A-Za-z0-9_]+):/gm)) {
  routeSet.add(match[1]);
}

for (const match of typesContent.matchAll(/^\s{2}(Home[A-Za-z0-9_]+):/gm)) {
  routeSet.add(match[1]);
}

const srcFiles = listFilesRecursive(path.join(root, "src")).filter((file) => file.endsWith(".ts") || file.endsWith(".tsx"));
const usedRoutes = new Map();

for (const file of srcFiles) {
  const content = fs.readFileSync(file, "utf8");
  for (const match of content.matchAll(/\b(?:navigate|replace)\(\s*["']([A-Za-z0-9_]+)["']/g)) {
    const route = match[1];
    if (!usedRoutes.has(route)) {
      usedRoutes.set(route, []);
    }
    usedRoutes.get(route).push(path.relative(root, file));
  }
}

const unknown = [...usedRoutes.keys()].filter((route) => !routeSet.has(route));

if (unknown.length > 0) {
  console.error("Rotas usadas mas nao declaradas:");
  for (const route of unknown) {
    console.error(`- ${route} -> ${[...new Set(usedRoutes.get(route))].join(", ")}`);
  }
  process.exit(1);
}

console.log(`Auditoria de rotas OK. Rotas declaradas: ${routeSet.size}. Rotas usadas: ${usedRoutes.size}.`);
