import { NextRequest } from "next/server";

export interface StoredFile {
  id: string;
  data: Buffer;
  contentType: string;
  size: number;
  fileName?: string;
}

const files = new Map<string, StoredFile>();

const fileStorage = {
  set(file: StoredFile): void {
    files.set(file.id, file);
  },

  get(id: string): StoredFile | undefined {
    return files.get(id);
  },

  delete(id: string): boolean {
    return files.delete(id);
  },

  has(id: string): boolean {
    return files.has(id);
  },
  list() {
    return files.keys().toArray();
  },
};

export const POST = async (req: NextRequest): Promise<Response> => {
  try {
    const formData: FormData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer: ArrayBuffer = await file.arrayBuffer();
    const data: Buffer = Buffer.from(arrayBuffer);

    const storageId: string = crypto.randomUUID();

    fileStorage.set({
      id: storageId,
      data,
      contentType: file.type || "application/octet-stream",
      size: data.byteLength,
      fileName: file.name,
    });

    return Response.json({ storageId }, { status: 201 });
  } catch (error: unknown) {
    console.error("File upload failed:", error);

    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
};

export const GET = async (props: NextRequest): Promise<Response> => {
  const storageId = props.nextUrl.searchParams.get("storageId");

  if (!storageId)
    return Response.json({ error: "File not found" }, { status: 404 });

  const file = fileStorage.get(storageId);

  if (!file) {
    return Response.json({ error: "File not found" }, { status: 404 });
  }

  return new Response(file.data as any, {
    status: 200,
    headers: {
      fileName: file.fileName ?? "",
      "Content-Type": file.contentType,
      "Content-Length": String(file.size),
      ...(file.fileName
        ? {
            "Content-Disposition": `inline; filename="${file.fileName}"`,
          }
        : {}),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};

export const PUT = () => {
  return Response.json(fileStorage.list());
};
