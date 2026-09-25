import { pgTable, serial, text, timestamp, integer, jsonb, boolean, doublePrecision } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").default("USER").notNull(), // 'ADMIN' | 'USER'
  department: text("department").default("Data Science"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").default("active").notNull(), // 'active', 'archived'
  tags: jsonb("tags").default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const datasets = pgTable("datasets", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  filename: text("filename").notNull(),
  fileSize: text("file_size").notNull(),
  rowCount: integer("row_count").notNull(),
  colCount: integer("col_count").notNull(),
  dataJson: jsonb("data_json").notNull(), // array of row objects
  columnsMeta: jsonb("columns_meta").notNull(), // [{ name, type, nullCount, uniqueCount, sampleValues }]
  cleanedDataJson: jsonb("cleaned_data_json"),
  summaryStats: jsonb("summary_stats"), // descriptive statistics
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mlModels = pgTable("ml_models", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  datasetId: integer("dataset_id").references(() => datasets.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  taskType: text("task_type").notNull(), // 'classification' | 'regression' | 'clustering' | 'deep_learning'
  algorithm: text("algorithm").notNull(), // 'RandomForestClassifier', 'LogisticRegression', 'MLPRegressor', 'PyTorch Transformer/ANN', etc.
  targetColumn: text("target_column"),
  featureColumns: jsonb("feature_columns").notNull(),
  hyperparameters: jsonb("hyperparameters").default({}),
  metrics: jsonb("metrics").notNull(), // { accuracy, precision, recall, f1, roc_auc, confusion_matrix, r2, mae, rmse, epochs_log }
  status: text("status").default("trained").notNull(), // 'training', 'trained', 'failed'
  version: text("version").default("v1.0").notNull(),
  artifactPath: text("artifact_path").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  modelId: integer("model_id").references(() => mlModels.id, { onDelete: "cascade" }).notNull(),
  inputFeatures: jsonb("input_features").notNull(),
  predictionResult: text("prediction_result").notNull(),
  confidence: doublePrecision("confidence"),
  latencyMs: integer("latency_ms").default(12),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  filename: text("filename").notNull(),
  fileType: text("file_type").notNull(), // 'pdf', 'txt', 'md', 'csv'
  fileSize: text("file_size").notNull(),
  chunkCount: integer("chunk_count").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documentChunks = pgTable("document_chunks", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documents.id, { onDelete: "cascade" }).notNull(),
  chunkIndex: integer("chunk_index").notNull(),
  chunkText: text("chunk_text").notNull(),
  tokenCount: integer("token_count").notNull(),
  embedding: jsonb("embedding"), // mock or computed vector representation
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  mode: text("mode").default("rag").notNull(), // 'rag' | 'agent' | 'llm'
  activeDocumentId: integer("active_document_id").references(() => documents.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id, { onDelete: "cascade" }).notNull(),
  sender: text("sender").notNull(), // 'user' | 'assistant' | 'system' | 'agent'
  content: text("content").notNull(),
  retrievedChunks: jsonb("retrieved_chunks"), // RAG cited passages
  agentThoughtTrace: jsonb("agent_thought_trace"), // Agent step-by-step tool actions
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiAgents = pgTable("ai_agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(), // 'Data Analyst Agent' | 'AutoML & Predictive Agent' | 'Document Intelligence Agent'
  description: text("description").notNull(),
  systemPrompt: text("system_prompt").notNull(),
  tools: jsonb("tools").notNull(), // ['pandas_engine', 'scikit_eval', 'postgres_query', 'rag_retriever', 'stats_tester']
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  service: text("service").notNull(), // 'Django Admin' | 'FastAPI ML Engine' | 'FastAPI RAG' | 'PyTorch DL Engine'
  action: text("action").notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  details: jsonb("details"),
  statusCode: integer("status_code").default(200),
  latencyMs: integer("latency_ms").default(25),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
