import sharp from "sharp";
import { mkdir, access, stat } from "node:fs/promises";
import path from "node:path";

const requested = process.argv.slice(2);
const names = ["within", "encounter", "connection", "afterglow", "iris", "touch", "iris-detail", "memory-room", "memory-rain", "memory-sea", "memory-dance"].filter((name) => requested.length === 0 || requested.includes(name));
await mkdir("public/images", { recursive: true });
for (const name of names) {
  const source = path.join("assets/originals", `${name === "connection" ? "connection-enhanced" : name}.png`);
  try { await access(source); } catch { console.log(`Pending original: ${name}`); continue; }
  // Keep every native desktop pixel. Do not label interpolated enlargements as 4K.
  const desktop = sharp(source);
  if (name.startsWith("memory-") || name === "iris-detail") {
    // Each memory moves from an aperture into a full-frame scene using one source.
    // No duplicate thumbnail or interpolated enlargement is needed.
    await Promise.all([
      desktop.clone().webp({ quality: 94, effort: 6, smartSubsample: true }).toFile(`public/images/${name}.webp`),
      desktop.clone().avif({ quality: 78, effort: 6, chromaSubsampling: "4:4:4" }).toFile(`public/images/${name}.avif`),
    ]);
    console.log(`${name}: native master, AVIF + WebP${name === "iris-detail" ? "; mobile shares iris source" : ""}`);
    continue;
  }
  const portrait = path.join("assets/originals", `${name === "iris-detail" ? "iris" : name}-mobile.png`);
  let mobile;
  try { await access(portrait); mobile = sharp(portrait).resize(900, 1600, { fit: "cover", withoutEnlargement: true }); }
  catch {
    if (name === "connection" || name === "encounter" || name === "touch") {
      const photo = await sharp(source).resize(900).toBuffer();
      mobile = sharp({ create: { width: 900, height: 1600, channels: 3, background: "#111110" } }).composite([{ input: photo, top: 562, left: 0 }]);
    } else {
      mobile = sharp(source).resize(900, 1600, { fit: "cover", position: "right" });
    }
  }
  await Promise.all([
    desktop.clone().webp({ quality: 94, effort: 6, smartSubsample: true }).toFile(`public/images/${name}.webp`),
    desktop.clone().avif({ quality: 78, effort: 6, chromaSubsampling: "4:4:4" }).toFile(`public/images/${name}.avif`),
    mobile.clone().webp({ quality: 93, effort: 6, smartSubsample: true }).toFile(`public/images/${name}-mobile.webp`),
    mobile.clone().avif({ quality: 76, effort: 6, chromaSubsampling: "4:4:4" }).toFile(`public/images/${name}-mobile.avif`),
  ]);
  const info = await stat(`public/images/${name}.avif`);
  const meta = await sharp(`public/images/${name}.avif`).metadata();
  console.log(`${name}: ${meta.width}×${meta.height}, ${Math.round(info.size / 1024)} KB AVIF; 900px mobile`);
}
await sharp("assets/originals/touch.png").resize(1200, 630, { fit: "cover" }).jpeg({ quality: 94, chromaSubsampling: "4:4:4" }).toFile("public/images/social.jpg");
