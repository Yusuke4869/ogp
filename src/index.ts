import express from "express";
import type { Application, Request, Response } from "express";
import nodeHtmlToImage from "node-html-to-image";
import fs from "fs";
import { join } from "path";

import ogp from "./ogp";

const app: Application = express();

const htmlPath = join(process.cwd(), "public", "html");
const indexHTML = fs.readFileSync(join(htmlPath, "index.html"), "utf-8");
const ogpHTML = fs.readFileSync(join(htmlPath, "ogp.html"), "utf-8");

app.get("/", (req: Request, res: Response) => {
  res.send(indexHTML);
});

app.get("/img/:title", async function (req: Request, res: Response) {
  const image = await nodeHtmlToImage({
    html: ogp(ogpHTML, req.params.title, req.query.color?.toString(), req.query.img?.toString()),
  });
  res.writeHead(200, { "Content-Type": "image/png" });
  res.end(image, "binary");
});

app.use((req: Request, res: Response) => {
  res.status(404).send(indexHTML);
});

if (process.env.START_TYPE === "dev") {
  app.listen(3000, () => {
    console.log("listening on port 3000");
  });
}

module.exports = app;
