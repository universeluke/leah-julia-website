const fs = require("fs");
const path = require("path");

const srcFolder = "./public/videos/sequence";
const destFolder = "./public/videos/sequence_reduced";
if (!fs.existsSync(destFolder)) fs.mkdirSync(destFolder);

const files = fs
  .readdirSync(srcFolder)
  .filter((f) => f.startsWith("frame_") && f.endsWith(".png"))
  .sort();

const keepCount = 70;
const step = Math.floor(files.length / keepCount);

let idx = 0;
for (let i = 0; i < files.length; i += step) {
  const srcPath = path.join(srcFolder, files[i]);
  const destPath = path.join(
    destFolder,
    `frame_${String(idx).padStart(4, "0")}.png`
  );
  fs.copyFileSync(srcPath, destPath);
  idx++;
}

console.log(`✅ Reduced to ${idx} frames in ${destFolder}`);
