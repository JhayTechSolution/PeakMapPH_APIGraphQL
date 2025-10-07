import PouchDB from "pouchdb";

declare module "pouchdb" {
  namespace Find {
    export interface IndexDefinition {
      index: {
        fields: string[];
      };
      ddoc?: string;
      name?: string;
      type?: "json";
    }

    export interface CreateIndexResponse {
      id: string;
      name: string;
      result: "created" | "exists";
    }

    export interface FindRequest<Content = any> {
      selector: { [key: string]: any };
      fields?: Array<keyof Content>;
      sort?: Array<string | { [key in keyof Content]?: "asc" | "desc" }>;
      limit?: number;
      skip?: number;
      use_index?: string | [string, string];
    }

    export interface FindResponse<Content = any> {
      docs: Content[];
      warning?: string;
      execution_stats?: any;
    }
  }

  interface Database<Content = {}> {
    createIndex(index: Find.IndexDefinition): Promise<Find.CreateIndexResponse>;
    find(query: Find.FindRequest<Content>): Promise<Find.FindResponse<Content>>;
    getIndexes(): Promise<{ indexes: Array<{ ddoc: string; name: string }> }>;
    deleteIndex(index: { ddoc: string; name: string }): Promise<{ ok: boolean }>;
  }
}
