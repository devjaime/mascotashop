import fs from "node:fs/promises";
import path from "node:path";

const source = "/Users/devjaime/Downloads/Mascotasshop";
const destination = new URL("../public/products/", import.meta.url);

const slugify = (value) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "");

await fs.mkdir(destination, { recursive: true });
for (const entry of await fs.readdir(source, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const files = (await fs.readdir(path.join(source, entry.name)))
    .filter((file) => /\.(jpe?g|png|webp)$/i.test(file))
    .sort();
  const productDir = new URL(`${slugify(entry.name)}/`, destination);
  await fs.mkdir(productDir, { recursive: true });
  await Promise.all(files.map((file, index) =>
    fs.copyFile(path.join(source, entry.name, file), new URL(`${index + 1}.jpg`, productDir))
  ));
}
