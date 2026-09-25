export const ARCHITECTURE_LAYERS = [
  {
    layer: "Frontend & API Client",
    description: "Next.js 16 full-stack interactive control cockpit with real-time analytics, model evaluation metrics, and chat consoles.",
    tech: ["Next.js", "React 19", "Tailwind CSS", "Lucide Icons"],
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  {
    layer: "Django Management Layer",
    description: "Main application server handling user authentication, role-based access control, project organization, dataset catalogs, and admin telemetry.",
    tech: ["Django 5", "Django ORM", "Django REST Framework", "Audit Logging"],
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  {
    layer: "FastAPI AI/ML Processing Gateway",
    description: "Asynchronous high-throughput engine serving model inference, real-time dataset profiling, RAG query vector retrieval, and autonomous Agent loops.",
    tech: ["FastAPI", "Pydantic v2", "Uvicorn", "AsyncIO"],
    badgeColor: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  },
  {
    layer: "PostgreSQL + pgvector Core",
    description: "Unified relational and high-dimensional vector store housing users, metadata, tabular datasets, model weights checkpoints, and document embeddings.",
    tech: ["PostgreSQL 16", "pgvector", "Drizzle ORM", "HNSW Indexing"],
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  },
  {
    layer: "Data & Statistics Layer",
    description: "Mathematical computation, statistical inference (T-test, IQR, variance), missing-value imputation, outlier detection, and data wrangling.",
    tech: ["NumPy", "Pandas", "SciPy", "Statsmodels"],
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  {
    layer: "Machine Learning Layer",
    description: "Predictive modeling, automated feature importance attribution, hyperparameter tuning, confusion matrix evaluation, and model serialization.",
    tech: ["Scikit-learn", "Joblib", "XGBoost"],
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  {
    layer: "Deep Learning Layer",
    description: "Neural network architectures (ANNs, CNNs, Transformers, LSTM) with GPU tensor operations, loss curve tracking, and epoch checkpoints.",
    tech: ["PyTorch", "TorchVision", "Transformers"],
    badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  },
  {
    layer: "GenAI, RAG & Agents Layer",
    description: "Document chunking pipelines, semantic similarity search, cited Q&A retrieval, and autonomous multi-step reasoning agents with tool calling.",
    tech: ["LangChain", "Sentence-Transformers", "Autonomous Agents", "Tool Calling"],
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  },
  {
    layer: "Async Workers & Containerization",
    description: "Background task queuing for long-running training routines and production container orchestration across distributed nodes.",
    tech: ["Docker", "Docker Compose", "Redis", "Celery"],
    badgeColor: "bg-slate-500/10 text-slate-300 border-slate-500/20",
  },
];

export const SAMPLE_DATASETS = [
  {
    name: "Customer Churn & Retention",
    filename: "customer_churn.csv",
    csvText: `customer_id,age,tenure_months,monthly_charges,contract_type,paperless_billing,churn
101,32,14,65.20,Month-to-month,true,No
102,45,3,89.50,Month-to-month,true,Yes
103,29,38,42.00,One year,false,No
104,61,2,105.10,Month-to-month,true,Yes
105,42,54,115.00,Two year,false,No
106,23,7,70.50,Month-to-month,true,Yes
107,51,46,59.30,Two year,false,No
108,38,19,84.10,Month-to-month,true,No
109,56,5,98.20,Month-to-month,true,Yes
110,34,28,52.40,One year,false,No
111,48,11,88.70,Month-to-month,true,Yes
112,27,45,61.00,Two year,false,No
113,36,8,78.90,Month-to-month,true,Yes
114,63,62,112.50,Two year,false,No
115,31,16,69.00,Month-to-month,true,No`,
  },
  {
    name: "Housing Price Regression",
    filename: "housing_market.csv",
    csvText: `house_id,sqft_living,bedrooms,bathrooms,lot_size,year_built,price_thousands
201,1800,3,2,4500,2005,385.0
202,2400,4,3,6200,2012,520.0
203,1200,2,1,3100,1995,245.0
204,3100,5,3.5,8500,2018,740.0
205,2150,3,2.5,5400,2008,460.0
206,1650,3,2,4000,2001,340.0
207,2850,4,3,7100,2015,630.0
208,1400,2,1.5,3600,1998,280.0
209,3600,5,4,9800,2021,895.0
210,1950,3,2,4900,2010,415.0`,
  },
];
