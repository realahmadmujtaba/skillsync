"""Grounds resume gap-analysis against roadmap.sh's real, community-vetted
role curricula instead of relying purely on the LLM's own judgment.

roadmap.sh has no public API, but its content is open-source at
github.com/kamranahmedse/developer-roadmap (roadmaps/<slug>/content/, one
markdown file per topic). Each role's raw topic list is 40-150+ files — too
many to inject into a prompt as-is — so this is a hand-curated snapshot of
~15-20 core, resume-evidenceable topics per role, verified against that repo.
Static by design: it will drift from roadmap.sh's live content over time,
the same accepted tradeoff as the curated links in resources.py.
"""
from __future__ import annotations

TAXONOMY: dict[str, dict[str, object]] = {
    "machine learning": {
        "roadmap_url": "https://roadmap.sh/machine-learning",
        "roadmap_label": "roadmap.sh: Machine Learning Engineer",
        "topics": [
            "Python", "NumPy", "Pandas", "Scikit-learn", "TensorFlow", "PyTorch",
            "Feature Engineering", "Data Preparation", "Supervised Learning",
            "Unsupervised Learning", "Regression", "Classification",
            "Decision Trees & Random Forest", "Neural Networks",
            "Convolutional Neural Networks", "Recurrent Neural Networks",
            "Transformers & Attention Mechanisms", "Natural Language Processing",
            "Model Evaluation Metrics", "Reinforcement Learning",
        ],
    },
    "ai agent": {  # also matches "agentic" via the substring check below
        "roadmap_url": "https://roadmap.sh/ai-agents",
        "roadmap_label": "roadmap.sh: AI Agents",
        "topics": [
            "Agent Loop", "Tool Invocation / Function Calling",
            "Model Context Protocol (MCP)", "Creating MCP Servers", "LangChain",
            "LangGraph", "CrewAI", "AutoGen", "RAG & Vector Databases",
            "Embeddings and Vector Search", "Prompt Engineering", "Context Windows",
            "Multi-Agent Systems", "Agent Memory (Short/Long-term)",
            "ReAct (Reason & Act)", "Tool Sandboxing & Permissioning",
            "Human-in-the-Loop Evaluation", "Structured Logging & Tracing",
            "Prompt Injection & Jailbreak Safety", "Tokenization",
        ],
    },
    "software engineer": {
        "roadmap_url": "https://roadmap.sh/system-design",
        "roadmap_label": "roadmap.sh: System Design",
        "topics": [
            "REST APIs", "Authentication (JWT/OAuth)", "SQL & NoSQL Databases",
            "Caching", "Load Balancing", "Microservices", "Message Queues",
            "CI/CD", "Unit Testing", "Integration Testing",
            "System Design Fundamentals", "CAP Theorem", "Horizontal Scaling",
            "Database Indexes", "Version Control (Git)", "Web Security (OWASP)",
            "GraphQL", "Monitoring & Observability", "Rate Limiting & Throttling",
        ],
    },
}


def taxonomy_for(text: str) -> dict[str, object] | None:
    """Substring-match against known role categories (same style as
    resources_for in resources.py). "agentic" maps to the "ai agent" entry."""
    text_lower = text.lower()
    if "agentic" in text_lower:
        return TAXONOMY["ai agent"]
    for keyword, entry in TAXONOMY.items():
        if keyword in text_lower:
            return entry
    return None
