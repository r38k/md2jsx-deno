import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";

export const markdownToAst = (markdown: string) => {
  const ast = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .parse(markdown);
  return ast;
};