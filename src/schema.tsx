import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

 
const typesFile = path.join(__dirname, "graphql/types.graphql");
const inputsFile = path.join(__dirname, "graphql/inputs.graphql");
const schemaFile = path.join(__dirname, "graphql/schema.graphql");

export async function loadSchema(): Promise<string> {
  const [types, inputs, schema] = await Promise.all([
    readFile(typesFile, "utf8"),
    readFile(inputsFile, "utf8"),
    readFile(schemaFile, "utf8")
  ]);

  return types + inputs + schema;
}
