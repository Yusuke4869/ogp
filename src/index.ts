import express from "express";
import type { Application, Request, Response } from "express";
import * as chromium from "playwright-aws-lambda";
import fs from "fs";
import { join } from "path";

import ogp from "./ogp";

const app: Application = express();
const port = process.env.PORT || 3000;

const htmlPath = join(process.cwd(), "public", "html");
const indexHTML = fs.readFileSync(join(htmlPath, "index.html"), "utf-8");
const ogpHTML = fs.readFileSync(join(htmlPath, "ogp.html"), "utf-8");

app.get("/", (req: Request, res: Response) => {
  res.send(indexHTML);
});

app.get("/img/:title", async function (req: Request, res: Response) {
  try {
    const playwrightArguments = {
      development: {
        args: chromium.getChromiumArgs(true),
        headless: true,
      },
      production: {
        args: chromium.getChromiumArgs(true),
      },
      test: {},
    }[(process.env.NODE_ENV as string) || "development"];
    const viewport = { height: 630, width: 1200 };
    const browser = await chromium.launchChromium(playwrightArguments);
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await page.setContent(ogp(ogpHTML, req.params.title, req.query.color?.toString(), req.query.img?.toString()), {
      waitUntil: "networkidle",
    });
    const image = await page.screenshot({ type: "png" });
    await browser.close();

    res.writeHead(200, { "Content-Type": "image/png" });
    res.end(image, "binary");
  } catch (e) {
    console.error(e);
    res.status(500).send("Internal Server Error");
  }
});

app.use((req: Request, res: Response) => {
  res.status(404).send(indexHTML);
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
