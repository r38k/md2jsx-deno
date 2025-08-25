import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";

const testDir = new URL(".", import.meta.url).pathname;
const binPath = join(testDir, "../../bin/md2jsx");

Deno.test("CLI preserves line breaks in markdown", async () => {
  const inputFile = join(testDir, "test-linebreaks.md");
  const outputFile = join(testDir, "test-linebreaks.html");
  const expectedFile = join(testDir, "expected-linebreaks.html");

  // Run the CLI
  const command = new Deno.Command(binPath, {
    args: ["--out", inputFile],
  });
  
  const { success, stderr } = await command.output();
  
  if (!success) {
    const errorText = new TextDecoder().decode(stderr);
    throw new Error(`CLI failed: ${errorText}`);
  }

  // Read the output and expected files
  const actualContent = await Deno.readTextFile(outputFile);
  const expectedContent = await Deno.readTextFile(expectedFile);

  // Compare the contents
  assertEquals(actualContent, expectedContent, "Generated HTML should match expected output");

  // Clean up the generated file
  await Deno.remove(outputFile);
});

Deno.test("CLI preserves line breaks in paragraphs", async () => {
  const inputFile = join(testDir, "test-linebreaks.md");
  const outputFile = join(testDir, "test-linebreaks.html");

  // Run the CLI
  const command = new Deno.Command(binPath, {
    args: ["--out", inputFile],
  });
  
  await command.output();

  // Read the output file
  const actualContent = await Deno.readTextFile(outputFile);

  // Check that white-space: pre-wrap is present in paragraph styles
  const hasPreWrap = actualContent.includes('white-space:pre-wrap');
  assertEquals(hasPreWrap, true, "Paragraphs should have white-space:pre-wrap style");

  // Check that actual line breaks are preserved in the content
  const hasLineBreaks = actualContent.includes('これは最初の行です。\nこれは二行目です。');
  assertEquals(hasLineBreaks, true, "Line breaks should be preserved in content");

  // Clean up
  await Deno.remove(outputFile);
});
