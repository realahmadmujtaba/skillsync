"""Illustrative example resumes shown to students who don't have a resume
yet, so they can see what a strong resume for their target role looks like.

Every entry here is 100% fictional — invented name, invented employer,
invented numbers — generated once as static content (same pattern as
resources.py and roadmap_taxonomy.py), not a live AI call. None of it is
derived from or traceable to any real person's document.
"""
from __future__ import annotations

EXAMPLE_RESUMES: list[dict[str, object]] = [
    {
        "target_role": "Machine Learning Engineer",
        "roadmap_label": "roadmap.sh: Machine Learning Engineer",
        "resume": {
            "name": "Ananya Rao",
            "email": "ananya.rao.ml@example.com",
            "phone": "+1 (555) 019-2847",
            "summary": (
                "Machine Learning Engineer with 1.5 years of experience "
                "building computer-vision and predictive-maintenance models "
                "that ship to production, from data collection through "
                "deployment and monitoring."
            ),
            "education": [
                {
                    "school": "Riverbend State University",
                    "degree": "B.S. in Computer Science",
                    "start": "2019",
                    "end": "2023",
                }
            ],
            "experience": [
                {
                    "company": "Solstice Robotics",
                    "role": "Machine Learning Engineer",
                    "start": "Jul 2023",
                    "end": "Present",
                    "bullets": [
                        "Built a computer-vision model to detect structural and thermal defects from drone-captured RGB and infrared imagery, cutting manual inspection time by 92%.",
                        "Trained an anomaly-detection model on equipment sensor data to flag HVAC faults early, reaching 84% precision and enabling predictive maintenance scheduling.",
                        "Shipped a regression model forecasting weekly energy usage from weather and occupancy data, achieving 93% accuracy and replacing a manual spreadsheet process.",
                        "Set up experiment tracking and model versioning with MLflow so the team could compare 40+ model runs without losing reproducibility.",
                    ],
                },
                {
                    "company": "Solstice Robotics",
                    "role": "Machine Learning Intern",
                    "start": "May 2022",
                    "end": "Aug 2022",
                    "bullets": [
                        "Labeled and cleaned a 15,000-image dataset for a defect-classification pilot, improving downstream model accuracy by 11 points.",
                        "Built a data pipeline in Python and Pandas to merge sensor logs from three internal systems into one training-ready dataset.",
                    ],
                },
            ],
            "projects": [
                {
                    "name": "Crop Health Classifier",
                    "tech": "PyTorch, FastAPI, Docker",
                    "bullets": [
                        "Trained a CNN to classify plant disease from leaf photos with 89% test accuracy on a public dataset.",
                        "Deployed the model behind a FastAPI endpoint and containerized it with Docker for one-command local demos.",
                    ],
                }
            ],
            "skills": [
                "Python", "PyTorch", "TensorFlow", "Scikit-learn", "Pandas",
                "MLflow", "Docker", "SQL", "AWS (S3, EC2)",
            ],
        },
    },
    {
        "target_role": "AI Agent Developer",
        "roadmap_label": "roadmap.sh: AI Agents",
        "resume": {
            "name": "Marcus Chen",
            "email": "marcus.chen.dev@example.com",
            "phone": "+1 (555) 044-7731",
            "summary": (
                "AI Agent Developer with 2 years building production LLM "
                "agents — tool-calling, retrieval-augmented generation, and "
                "streaming interfaces that ship to real users, not just demos."
            ),
            "education": [
                {
                    "school": "Fairmont Institute of Technology",
                    "degree": "B.S. in Computer Science",
                    "start": "2019",
                    "end": "2023",
                }
            ],
            "experience": [
                {
                    "company": "Northlight AI",
                    "role": "AI Agent Developer",
                    "start": "Jun 2023",
                    "end": "Present",
                    "bullets": [
                        "Built autonomous agents with tool-calling, intent recognition, and multi-turn context using LangChain and LangGraph, cutting manual ticket-triage time by 35%.",
                        "Designed a RAG pipeline — chunking, embeddings, re-ranking, citation grounding — over internal docs, reducing hallucinated answers by 60% in evaluation.",
                        "Exposed the agent runtime through a FastAPI service with SSE streaming, lowering perceived response latency by 40%.",
                        "Built an automated evaluation suite with golden datasets to catch prompt regressions before release, covering 25+ core agent behaviors.",
                    ],
                },
                {
                    "company": "Northlight AI",
                    "role": "Software Engineering Intern",
                    "start": "May 2022",
                    "end": "Aug 2022",
                    "bullets": [
                        "Built a React dashboard to visualize agent conversation traces for the internal QA team.",
                        "Wrote integration tests for the prompt-templating library, catching 3 regressions before they reached production.",
                    ],
                },
            ],
            "projects": [
                {
                    "name": "DocuAgent",
                    "tech": "Python, LangChain, Pinecone, Next.js",
                    "bullets": [
                        "Built a side-project agent that answers questions over a user's own PDFs using RAG and cites its sources.",
                        "Added tool use so the agent can search the web when local documents don't have the answer.",
                    ],
                }
            ],
            "skills": [
                "Python", "LangChain", "LangGraph", "RAG",
                "Vector Databases (Pinecone, pgvector)", "FastAPI",
                "TypeScript", "React", "Prompt Engineering", "Docker",
            ],
        },
    },
    {
        "target_role": "Software Engineer",
        "roadmap_label": "roadmap.sh: System Design",
        "resume": {
            "name": "Sofia Martins",
            "email": "sofia.martins.dev@example.com",
            "phone": "+1 (555) 062-3390",
            "summary": (
                "Software Engineer with 1.5 years of experience building "
                "backend services and APIs, from an internship at a "
                "fast-growing startup through a full-time distributed-"
                "systems role."
            ),
            "education": [
                {
                    "school": "Cedar Valley University",
                    "degree": "B.S. in Computer Science",
                    "start": "2019",
                    "end": "2023",
                }
            ],
            "experience": [
                {
                    "company": "Meridian Systems",
                    "role": "Software Engineer",
                    "start": "Jul 2023",
                    "end": "Present",
                    "bullets": [
                        "Designed and shipped REST APIs powering the core checkout flow, serving over 200,000 requests per day.",
                        "Introduced a Redis caching layer in front of the product catalog service, cutting p95 latency by 45%.",
                        "Migrated a monolithic order-processing job to a Kafka-based architecture, reducing failed-order retries by 70%.",
                        "Wrote unit and integration tests that raised backend test coverage from 54% to 82%, and set up the CI pipeline that runs them on every pull request.",
                    ],
                },
                {
                    "company": "Meridian Systems",
                    "role": "Software Engineering Intern",
                    "start": "May 2022",
                    "end": "Aug 2022",
                    "bullets": [
                        "Built an internal tool that mapped dependencies between microservices, cutting the time to trace a production incident from hours to minutes.",
                        "Fixed 15+ bugs across the customer-support portal during the internship, each verified with a new regression test.",
                    ],
                },
            ],
            "projects": [
                {
                    "name": "Splitwise Clone",
                    "tech": "Node.js, PostgreSQL, React",
                    "bullets": [
                        "Built a full-stack expense-splitting app supporting group balances and settlement suggestions.",
                        "Deployed with Docker Compose and wrote a CI workflow that runs the test suite on every push.",
                    ],
                }
            ],
            "skills": [
                "JavaScript/TypeScript", "Node.js", "Python", "PostgreSQL",
                "Redis", "Kafka", "Docker", "REST APIs", "CI/CD", "Git",
            ],
        },
    },
]
