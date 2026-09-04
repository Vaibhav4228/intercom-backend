import { PGVectorStore } from "@langchain/pgvector";
import type { DistanceStrategy } from "@langchain/pgvector";
import { OpenAIEmbeddings } from "@langchain/openai";
import type { PoolConfig } from "pg";






let cachedVectorStore: PGVectorStore | null = null;

export async function initPgVector(embeddings: any) {


    // Sample config
    const config = {
        postgresConnectionOptions: {
            type: process.env.PG_VECTOR_DB_TYPE || "postgres",
            host: process.env.PG_VECTOR_DB_HOST || "pg-vector-db",
            port: parseInt(process.env.PG_VECTOR_DB_PORT || "5432", 10),
            user: process.env.PG_VECTOR_DB_USER || "myuser",
            password: process.env.PG_VECTOR_DB_PASSWORD || "ChangeMe",
            database: process.env.PG_VECTOR_DB_NAME || "api",
            // type: "postgres",
            // host: "127.0.0.1",
            // port: 5433,
            // user: "myuser",
            // password: "ChangeMe",
            // database: "api",
        } as PoolConfig,
        tableName: process.env.PG_VECTOR_TABLE_NAME || "testlangchainjs",
        columns: {
            idColumnName: "id",
            vectorColumnName: "vector",
            contentColumnName: "content",
            metadataColumnName: "metadata",
        },
        // supported distance strategies: cosine (default), innerProduct, or euclidean
        distanceStrategy: "cosine" as DistanceStrategy,
    };

    if (cachedVectorStore) {
        return cachedVectorStore;
    }

    cachedVectorStore = await PGVectorStore.initialize(
        embeddings,
        config
    );
    return cachedVectorStore
}