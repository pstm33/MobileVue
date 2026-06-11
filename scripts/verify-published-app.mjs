import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = new URL(".", import.meta.url);
const base = "https://app.tagam.app";
const localDistRoot = fileURLToPath(new URL("../dist/pwa", ROOT));
const localManifestPath = new URL("../dist/pwa/manifest.json", ROOT);
const localIndexPath = new URL("../dist/pwa/index.html", ROOT);
const localServiceWorkerPath = new URL("../dist/pwa/service-worker.js", ROOT);
const localInstallSwPath = new URL("../dist/pwa/sw.js", ROOT);

const localManifest = readFileSync(localManifestPath, "utf8");
const localIndex = readFileSync(localIndexPath, "utf8");
const localServiceWorker = readFileSync(localServiceWorkerPath, "utf8");
const localInstallSw = readFileSync(localInstallSwPath, "utf8");

const localManifestHash = sha256(localManifest);
const localIndexHash = sha256(localIndex);
const localServiceWorkerHash = sha256(localServiceWorker);
const localInstallSwHash = sha256(localInstallSw);
const localScript = /<script[^>]+src=\"([^\"]+)\"/i.exec(localIndex)?.[1] ??
  /<script[^>]+src='([^']+)'/i.exec(localIndex)?.[1] ??
  "";
const localStyle = /<link[^>]+href=\"([^\"]+)\"[^>]*rel=\"stylesheet\"/i.exec(localIndex)?.[1] ??
  /<link[^>]+rel=\"stylesheet\"[^>]+href=\"([^\"]+)\"/i.exec(localIndex)?.[1] ??
  /<link[^>]+href='([^']+)'[^>]*rel=['\"]stylesheet['\"]/i.exec(localIndex)?.[1] ??
  /<link[^>]+rel=['\"]stylesheet['\"][^>]+href='([^']+)'/i.exec(localIndex)?.[1] ??
  "";
const localHasManifest = /<link[^>]+rel=\"manifest\"/i.test(localIndex);

const checks = [];
const results = [];

function sha256(input) {
  return createHash("sha256").update(input).digest("hex");
}

function getLocalFileBuffer(relativePath) {
  const normalized = decodeURIComponent(relativePath.replace(/^\//, ""));
  const absolute = resolve(localDistRoot, normalized);
  if (!existsSync(absolute)) {
    return null;
  }
  return readFileSync(absolute);
}

function extractLocalAssetPaths(html) {
  const refs = new Set();
  const tagRegex = /<(?:script|link)[^>]*(?:src|href)=(?:\"([^\"]+)\"|'([^']+)'|([^\\s>]+))[^>]*>/gi;
  let match;
  while ((match = tagRegex.exec(html)) !== null) {
    const raw = match[1] || match[2] || match[3];
    if (!raw) {
      continue;
    }
    const value = raw.replace(/^['"]|['"]$/g, "");
    if (!value || value.startsWith("http") || value.startsWith("data:") || value.startsWith("blob:")) {
      continue;
    }
    if (!value.startsWith("/")) {
      continue;
    }
    const normalized = value.replace(/^\/*/, "");
    refs.add(normalized);
  }
  return Array.from(refs);
}

async function get(path) {
  const response = await fetch(base + path);
  const arrayBuffer = await response.arrayBuffer();
  const bytes = Buffer.from(arrayBuffer);
  const text = bytes.toString("utf8");
  return {
    ok: response.ok,
    status: response.status,
    text,
    bytes,
    hash: sha256(bytes),
    contentType: response.headers.get("content-type") ?? "",
  };
}

function formatAssetCheckDetails(relativePath, localBuffer, remote) {
  return [
    `local=${localBuffer ? localBuffer.length : "missing"}`,
    `remote-status=${remote.status}`,
    `hash-match=${remote.ok && localBuffer && remote.hash === sha256(localBuffer)}`,
  ].join(", ");
}

async function run() {
  const home = await get("/");
  checks.push({
    key: "home-200",
    ok: home.ok,
    details: `status=${home.status}, content-type=${home.contentType}`,
  });

  checks.push({
    key: "home-index-match",
    ok: home.text.trim() === localIndex.trim(),
    details: `local=${localIndexHash}, remote=${home.hash}`,
  });

  const manifest = await get("/manifest.json");
  checks.push({
    key: "manifest-exists",
    ok: manifest.ok && manifest.text?.trim().length > 0,
    details: manifest.ok ? `len=${manifest.text.length}` : `status=${manifest.status}`,
  });
  if (manifest.ok) {
    checks.push({
      key: "manifest-match",
      ok: manifest.text.trim() === localManifest.trim(),
      details: `local=${localManifestHash}, remote=${manifest.hash}`,
    });
  }

  checks.push({
    key: "index-manifest-tag",
    ok: home.ok && localHasManifest && home.text.includes("rel=\"manifest\""),
    details: "home contains manifest link=" + (home.text.includes("rel=\"manifest\"") ? "yes" : "no"),
  });
  checks.push({
    key: "index-main-script",
    ok: localScript ? home.text.includes(localScript) : true,
    details: localScript ? `expected ${localScript}` : "no local script found",
  });
  checks.push({
    key: "index-main-style",
    ok: localStyle ? home.text.includes(localStyle) : true,
    details: localStyle ? `expected ${localStyle}` : "no local style found",
  });

  const remoteSw = await get("/service-worker.js");
  checks.push({
    key: "service-worker",
    ok: remoteSw.ok && remoteSw.text.trim() === localServiceWorker.trim(),
    details: remoteSw.ok
      ? `status=${remoteSw.status}, localHash=${localServiceWorkerHash}, remoteHash=${remoteSw.hash}`
      : `status=${remoteSw.status}`,
  });

  const remoteInstallSw = await get("/sw.js");
  checks.push({
    key: "install-sw",
    ok: remoteInstallSw.ok && remoteInstallSw.text.trim() === localInstallSw.trim(),
    details: remoteInstallSw.ok
      ? `status=${remoteInstallSw.status}, localHash=${localInstallSwHash}, remoteHash=${remoteInstallSw.hash}`
      : `status=${remoteInstallSw.status}`,
  });

  const localRefs = extractLocalAssetPaths(localIndex);
  for (const ref of localRefs) {
    const localBuffer = getLocalFileBuffer(ref);
    const remote = await get(`/${ref}`);
    checks.push({
      key: `asset:${ref}`,
      ok: remote.ok && !!localBuffer && remote.hash === sha256(localBuffer),
      details: formatAssetCheckDetails(ref, localBuffer, remote),
    });
  }

  const failed = checks.filter((check) => !check.ok);
  for (const item of checks) {
    results.push(`${item.ok ? "OK " : "ERR"} ${item.key}: ${item.details}`);
  }

  if (failed.length === 0) {
    results.push("ALL CHECKS OK");
    console.log(results.join("\n"));
    process.exit(0);
  }

  results.push(`FAILED CHECKS (${failed.length}):`);
  failed.forEach((item) => results.push(` - ${item.key}`));
  console.log(results.join("\n"));
  process.exit(1);
}

run().catch((error) => {
  console.error("VERIFY FAILED:", error.message || error);
  process.exit(1);
});
