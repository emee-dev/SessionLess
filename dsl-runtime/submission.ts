import type { Values } from "./types";
import { UploadProvider } from "./upload";

export async function resolveSubmissionValues(
  values: Values,
  uploadFile: UploadProvider,
): Promise<Values> {
  const result = { ...values };

  for (const [fieldId, value] of Object.entries(values)) {
    if (!(value instanceof File)) continue;

    const uploaded = await uploadFile({
      fieldId,
      file: value,
    });

    result[fieldId] = uploaded.url;
  }

  return result;
}
