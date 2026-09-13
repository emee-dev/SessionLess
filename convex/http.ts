import { httpRouter } from "convex/server";
import { resolveFieldAttachment, uploadFieldAttachment } from "./form";

const http = httpRouter();

http.route({
  path: "/resolveAttachment",
  method: "GET",
  handler: resolveFieldAttachment,
});

http.route({
  path: "/uploadAttachment",
  method: "POST",
  handler: uploadFieldAttachment,
});

export default http;
