import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import { put } from "@vercel/blob";
import { getRequiredUser } from "@/lib/auth-helpers";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 4 * 1024 * 1024;

function extForMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "bin";
}

export async function POST(req: Request) {
  console.log("Upload API called");
  try {
    console.log("Checking user authentication");
    await getRequiredUser();
    console.log("User authenticated");
    const form = await req.formData();
    const file = form.get("file");
    const fileName = file instanceof File ? file.name : "no file";
    console.log("Form data received, file:", fileName);
    if (!(file instanceof File)) {
      console.log("Error: Missing file field");
      return NextResponse.json({ error: "Missing file field." }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
      console.log("Error: Invalid file type", file.type);
      return NextResponse.json({ error: "Only JPEG, PNG, WebP, or GIF images are allowed." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      console.log("Error: File too large", file.size);
      return NextResponse.json({ error: "Image must be 4MB or smaller." }, { status: 400 });
    }

    const ext = extForMime(file.type);
    const name = `${randomBytes(16).toString("hex")}.${ext}`;
    console.log("Generated filename:", name);

    // In deployment, write to persistent blob storage instead of local filesystem.
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      console.log("Using Vercel Blob for upload");
      const blob = await put(`uploads/${name}`, file, {
        access: "public",
        contentType: file.type,
      });
      console.log("Blob upload successful, url:", blob.url);
      return NextResponse.json({ url: blob.url });
    }

    // Local dev fallback.
    console.log("Using local filesystem for upload");
    const buf = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    console.log("Upload dir:", uploadDir);
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, name), buf);
    const url = `/uploads/${name}`;
    console.log("Local upload successful, url:", url);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    if (error instanceof Error && ["UNAUTHORIZED", "FORBIDDEN"].includes(error.message)) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
