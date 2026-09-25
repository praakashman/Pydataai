import { db } from "@/db";
import { users, projects, datasets, mlModels, documents, documentChunks, aiAgents } from "@/db/schema";
import { profileDataset } from "./data-engine";
import { chunkDocumentText } from "./rag-engine";

export async function seedInitialDataIfEmpty() {
  const existingUsers = await db.select().from(users).limit(1);
  if (existingUsers.length > 0) {
    return; // Already seeded
  }

  // 1. Seed Users
  const [adminUser] = await db.insert(users).values({
    email: "admin@pydataai.org",
    name: "Dr. Elena Rostova",
    role: "ADMIN",
    department: "AI & ML Systems Research",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
  }).returning();

  const [devUser] = await db.insert(users).values({
    email: "alex.data@pydataai.org",
    name: "Alex Vance",
    role: "USER",
    department: "Data Engineering",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
  }).returning();

  // 2. Seed Projects
  const [project1] = await db.insert(projects).values({
    userId: adminUser.id,
    name: "Customer Churn & Retention Analytics",
    description: "Predict customer churn likelihood using behavioral metrics, contract duration, and monthly billing data with Scikit-learn Random Forest.",
    tags: ["Customer Success", "Scikit-Learn", "PostgreSQL", "FastAPI"],
  }).returning();

  const [project2] = await db.insert(projects).values({
    userId: adminUser.id,
    name: "Enterprise Enterprise Policy & RAG QA",
    description: "RAG system on PostgreSQL + pgvector storing internal operating policies and machine learning pipeline governance.",
    tags: ["RAG", "GenAI", "LangChain/Agent", "PostgreSQL"],
  }).returning();

  // 3. Seed Datasets
  const churnRows = [
    { customer_id: 1001, age: 34, tenure_months: 18, monthly_charges: 65.5, contract_type: "Month-to-month", paperless_billing: true, churn: "No" },
    { customer_id: 1002, age: 52, tenure_months: 4, monthly_charges: 89.2, contract_type: "Month-to-month", paperless_billing: true, churn: "Yes" },
    { customer_id: 1003, age: 28, tenure_months: 36, monthly_charges: 45.0, contract_type: "One year", paperless_billing: false, churn: "No" },
    { customer_id: 1004, age: 61, tenure_months: 2, monthly_charges: 99.8, contract_type: "Month-to-month", paperless_billing: true, churn: "Yes" },
    { customer_id: 1005, age: 41, tenure_months: 60, monthly_charges: 110.2, contract_type: "Two year", paperless_billing: false, churn: "No" },
    { customer_id: 1006, age: 24, tenure_months: 8, monthly_charges: 75.3, contract_type: "Month-to-month", paperless_billing: true, churn: "Yes" },
    { customer_id: 1007, age: 48, tenure_months: 48, monthly_charges: 55.4, contract_type: "Two year", paperless_billing: false, churn: "No" },
    { customer_id: 1008, age: 37, tenure_months: 14, monthly_charges: 80.5, contract_type: "Month-to-month", paperless_billing: true, churn: "No" },
    { customer_id: 1009, age: 58, tenure_months: 6, monthly_charges: 92.1, contract_type: "Month-to-month", paperless_billing: true, churn: "Yes" },
    { customer_id: 1010, age: 31, tenure_months: 24, monthly_charges: 48.9, contract_type: "One year", paperless_billing: false, churn: "No" },
    { customer_id: 1011, age: 45, tenure_months: 12, monthly_charges: 85.0, contract_type: "Month-to-month", paperless_billing: true, churn: "Yes" },
    { customer_id: 1012, age: 29, tenure_months: 42, monthly_charges: 62.0, contract_type: "Two year", paperless_billing: false, churn: "No" },
  ];

  const headers = ["customer_id", "age", "tenure_months", "monthly_charges", "contract_type", "paperless_billing", "churn"];
  const profiling = profileDataset(churnRows, headers);

  const [churnDataset] = await db.insert(datasets).values({
    projectId: project1.id,
    userId: adminUser.id,
    name: "customers_churn_v1.csv",
    filename: "customers.csv",
    fileSize: "14.2 KB",
    rowCount: churnRows.length,
    colCount: headers.length,
    dataJson: churnRows,
    columnsMeta: profiling.columns,
    summaryStats: profiling.stats,
  }).returning();

  // 4. Seed ML Model
  await db.insert(mlModels).values({
    projectId: project1.id,
    userId: adminUser.id,
    datasetId: churnDataset.id,
    name: "Customer Churn Random Forest v1.0",
    taskType: "classification",
    algorithm: "RandomForestClassifier",
    targetColumn: "churn",
    featureColumns: ["age", "tenure_months", "monthly_charges", "contract_type"],
    hyperparameters: { n_estimators: 100, max_depth: 6, min_samples_split: 4 },
    metrics: {
      accuracy: 0.91,
      precision: 0.89,
      recall: 0.87,
      f1: 0.88,
      rocAuc: 0.93,
      confusionMatrix: {
        labels: ["No", "Yes"],
        matrix: [
          [7, 1],
          [0, 4],
        ],
      },
      featureImportance: [
        { feature: "tenure_months", importance: 0.42 },
        { feature: "monthly_charges", importance: 0.31 },
        { feature: "contract_type", importance: 0.16 },
        { feature: "age", importance: 0.11 },
      ],
    },
    status: "trained",
    version: "1.0",
    artifactPath: "models/churn_randomforest_v1.0.joblib",
  });

  // Deep learning PyTorch model
  await db.insert(mlModels).values({
    projectId: project1.id,
    userId: adminUser.id,
    datasetId: churnDataset.id,
    name: "PyTorch Deep ANN - Customer Behavior",
    taskType: "deep_learning",
    algorithm: "PyTorch Deep ANN (Linear + ReLU + Dropout)",
    targetColumn: "churn",
    featureColumns: ["age", "tenure_months", "monthly_charges"],
    hyperparameters: { layers: [64, 32, 16], lr: 0.001, epochs: 15, optimizer: "AdamW" },
    metrics: {
      accuracy: 0.935,
      precision: 0.92,
      recall: 0.91,
      f1: 0.915,
      epochsLog: [
        { epoch: 1, loss: 0.69, valLoss: 0.67, accuracy: 0.62 },
        { epoch: 3, loss: 0.54, valLoss: 0.51, accuracy: 0.76 },
        { epoch: 6, loss: 0.38, valLoss: 0.35, accuracy: 0.86 },
        { epoch: 10, loss: 0.24, valLoss: 0.22, accuracy: 0.91 },
        { epoch: 15, loss: 0.16, valLoss: 0.15, accuracy: 0.935 },
      ],
      featureImportance: [
        { feature: "tenure_months", importance: 0.45 },
        { feature: "monthly_charges", importance: 0.38 },
        { feature: "age", importance: 0.17 },
      ],
    },
    status: "trained",
    version: "2.1",
    artifactPath: "models/pytorch_ann_churn.pth",
  });

  // 5. Seed Documents & Chunks for RAG
  const sampleDocText = `PyDataAI Operating Guidelines & Enterprise Architecture Policy

Section 1: General Leave and Employee Well-being
All full-time research scientists, data engineers, and AI platform developers are entitled to 25 days of paid annual leave (PTO) per calendar year. Paid leave accrues on a monthly pro-rata basis. Additionally, all employees are eligible for up to 10 days of certified medical leave with full salary continuation. Parental leave provides 16 weeks of fully paid leave for primary caregivers. Flexible working hours and hybrid arrangements are supported across all global data clusters.

Section 2: Machine Learning Governance and Production Deployment
All machine learning and deep learning models intended for FastAPI production deployment must pass through the Django Model Registry review. Models must demonstrate a minimum validation accuracy of 85% or an F1 score above 0.80 on out-of-time test partitions. Models trained on customer PII must use pseudonymized feature stores. All inference endpoints deployed under /api/v1/ml/predict must maintain a p95 latency under 150ms.

Section 3: PostgreSQL and pgvector Architecture
Application persistent state is managed through PostgreSQL 16. Embeddings generated via sentence-transformers are stored in the document_chunks table with cosine similarity indexing (HNSW). Backup snapshots are executed daily at 02:00 UTC with automated point-in-time recovery.

Section 4: AI Agents Tool Permissions and Guardrails
AI Agents operating under the FastAPI Agent API (such as the Data Analyst Agent and AutoML Agent) have sandboxed access to execute read-only queries against authorized dataset views, invoke Pandas profiling operations, and trigger Scikit-learn pipeline runs. Direct raw SQL DROP, TRUNCATE, or schema alterations are strictly prohibited by role-based access control.`;

  const docChunks = chunkDocumentText(sampleDocText, 120, 25);

  const [doc] = await db.insert(documents).values({
    projectId: project2.id,
    userId: adminUser.id,
    title: "PyDataAI Enterprise Operating Policy & ML Governance",
    filename: "company_policy.pdf",
    fileType: "pdf",
    fileSize: "48.5 KB",
    chunkCount: docChunks.length,
    content: sampleDocText,
  }).returning();

  for (const chunk of docChunks) {
    await db.insert(documentChunks).values({
      documentId: doc.id,
      chunkIndex: chunk.chunkIndex,
      chunkText: chunk.chunkText,
      tokenCount: chunk.tokenCount,
      embedding: [0.05, 0.12, -0.08, 0.24, 0.19], // simulated vector
      metadata: { section: chunk.chunkIndex + 1, source: "company_policy.pdf" },
    });
  }

  // 6. Seed AI Agents
  await db.insert(aiAgents).values({
    name: "Data Analyst Agent",
    role: "Automated EDA & Statistical Insights",
    description: "Inspects CSV files, detects missing values and outliers, calculates statistical distributions, generates correlation matrices, and summarizes key trends.",
    systemPrompt: "You are the PyDataAI Autonomous Data Analyst Agent. You inspect datasets, generate pandas profiling metrics, and explain key patterns clearly.",
    tools: ["pandas_engine", "statsmodels_tester", "outlier_detector", "correlation_analyzer"],
    isActive: true,
  });

  await db.insert(aiAgents).values({
    name: "AutoML & Predictive Agent",
    role: "Model Architecture & Pipeline Selection",
    description: "Evaluates classification and regression problems, selects optimal Scikit-learn/PyTorch algorithms, performs feature importance analysis, and exports deployment artifacts.",
    systemPrompt: "You are the PyDataAI AutoML Agent. You select algorithms, evaluate metrics, and construct high-performance machine learning pipelines.",
    tools: ["scikit_train", "pytorch_trainer", "metric_evaluator", "model_registry"],
    isActive: true,
  });

  await db.insert(aiAgents).values({
    name: "Document Intelligence RAG Agent",
    role: "Vector Search & Retrieval Specialist",
    description: "Extracts text from PDFs, manages pgvector embeddings, performs semantic similarity matching, and provides cited answers to complex queries.",
    systemPrompt: "You are the PyDataAI Document Intelligence Agent. You query vector stores and deliver accurate citations from internal documents.",
    tools: ["pgvector_retriever", "chunk_synthesizer", "semantic_ranker"],
    isActive: true,
  });
}
