import { TezX } from "tezx";
import { LocalFS } from "./src/index.js";
import { readFile } from "node:fs/promises";
const app = new TezX();
const storage = new LocalFS({
  basePath: "uploads",
  publicUrl: "/files/",
  allowPublicAccess: true,
  autoRenameOnConflict: true,
  allowedTypes: ["image/*", "application/pdf"]
});

async function run() {
  const buffer = await readFile("package.json");
  const file = new File([new Uint8Array(buffer)], "test.png", {
    type: "image/png", // optional, can be auto-detected
  });
  const saved = await storage.saveFile(file);
  console.log("File saved:", saved);
  // const files = await storage.listFiles("", true);
  // console.log("All files:", files);
}
app.use(storage.serveFileResponse())
run();

Bun.serve({
  port: 3001,
  fetch: app.serve
})

// const app = new TezX({
//   env: loadEnv(),
//   debugMode: true,
//   // Additional options
// });

// const storage = new LocalFS({
//   basePath: "my_uploads",
//   publicUrl: "/static",
//   allowPublicAccess: true,
//   maxFileSize: 10 * 1024 * 1024, // 10 MB
//   allowedTypes: ["image/*", "application/pdf"],
// });

// app.use([logger()]);
// app.use(storage.serveFileResponse());
// app.post("/", async (ctx) => {
//   let f = await ctx.req.formData()
//   let buffer = (await (f?.files as File).arrayBuffer());
//   const savedPath = await storage.saveFile("photos/example.jpg", buffer,);
//   console.log(savedPath)

//   return ctx.json({})
// });



// bunAdapter(app).listen(3000, () => {
//   console.log("🚀 TezX running on http://localhost:3000");
// });