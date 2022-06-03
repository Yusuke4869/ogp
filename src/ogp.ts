import { JSDOM } from "jsdom";

const ogp = (html: string, title: string, textColor?: string, imagePath?: string) => {
  const { window } = new JSDOM(html);
  const { document } = window;

  if (/[a-fA-F\d]{3,6}/g.test(textColor ?? "")) textColor = `#${textColor}`;

  const mainElement = document.getElementById("main");
  const titleElement = document.getElementById("title");

  if (imagePath) mainElement ? (mainElement.style.backgroundImage = `url(${imagePath})`) : null;

  titleElement ? (titleElement.textContent = title) : null;
  if (textColor) titleElement ? (titleElement.style.color = textColor) : null;

  return document.documentElement.outerHTML;
};

export default ogp;
