"""Curated learning resources for skill gaps, keyed by keyword.

Every entry links to a stable, well-known destination (official docs, a
long-standing GitHub repo, or a major course platform) rather than a specific
video or article that could go stale. For any skill without a curated match,
a YouTube/Udemy *search* link is generated instead of guessing a URL — this
guarantees the link always resolves to something relevant, even if it's less
tailored than a hand-picked one.
"""
from __future__ import annotations

from urllib.parse import quote_plus

from .roadmap_taxonomy import taxonomy_for

CURATED: dict[str, list[dict[str, str]]] = {
    "react": [
        {"title": "Official React docs", "url": "https://react.dev/learn", "kind": "free"},
    ],
    "typescript": [
        {"title": "TypeScript Handbook", "url": "https://www.typescriptlang.org/docs/handbook/intro.html", "kind": "free"},
    ],
    "javascript": [
        {"title": "MDN JavaScript Guide", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", "kind": "free"},
    ],
    "html": [
        {"title": "W3Schools HTML Tutorial", "url": "https://www.w3schools.com/html/", "kind": "free"},
    ],
    "css": [
        {"title": "W3Schools CSS Tutorial", "url": "https://www.w3schools.com/css/", "kind": "free"},
    ],
    "system design": [
        {"title": "System Design Primer (GitHub)", "url": "https://github.com/donnemartin/system-design-primer", "kind": "free"},
        {"title": "Grokking the System Design Interview", "url": "https://www.educative.io/courses/grokking-the-system-design-interview", "kind": "paid"},
    ],
    "distributed system": [
        {"title": "System Design Primer (GitHub)", "url": "https://github.com/donnemartin/system-design-primer", "kind": "free"},
    ],
    "algorithm": [
        {"title": "NeetCode 150", "url": "https://neetcode.io/practice", "kind": "free"},
        {"title": "LeetCode", "url": "https://leetcode.com/", "kind": "free"},
    ],
    "data structure": [
        {"title": "NeetCode 150", "url": "https://neetcode.io/practice", "kind": "free"},
    ],
    "sql": [
        {"title": "W3Schools SQL Tutorial", "url": "https://www.w3schools.com/sql/", "kind": "free"},
        {"title": "Mode SQL Tutorial", "url": "https://mode.com/sql-tutorial/", "kind": "free"},
    ],
    "database": [
        {"title": "W3Schools SQL Tutorial", "url": "https://www.w3schools.com/sql/", "kind": "free"},
    ],
    "postgres": [
        {"title": "PostgreSQL official tutorial", "url": "https://www.postgresql.org/docs/current/tutorial.html", "kind": "free"},
    ],
    "docker": [
        {"title": "Official Docker docs", "url": "https://docs.docker.com/get-started/", "kind": "free"},
    ],
    "kubernetes": [
        {"title": "Kubernetes official docs", "url": "https://kubernetes.io/docs/tutorials/", "kind": "free"},
    ],
    "ci/cd": [
        {"title": "GitHub Actions docs", "url": "https://docs.github.com/en/actions", "kind": "free"},
    ],
    "github actions": [
        {"title": "GitHub Actions docs", "url": "https://docs.github.com/en/actions", "kind": "free"},
    ],
    "testing": [
        {"title": "Jest docs", "url": "https://jestjs.io/docs/getting-started", "kind": "free"},
        {"title": "Test Automation University", "url": "https://testautomationu.applitools.com/", "kind": "free"},
    ],
    "jest": [
        {"title": "Jest docs", "url": "https://jestjs.io/docs/getting-started", "kind": "free"},
    ],
    "python": [
        {"title": "Official Python tutorial", "url": "https://docs.python.org/3/tutorial/", "kind": "free"},
    ],
    "node": [
        {"title": "Node.js official learn docs", "url": "https://nodejs.org/en/learn", "kind": "free"},
    ],
    "api": [
        {"title": "MDN: Introduction to web APIs", "url": "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs", "kind": "free"},
    ],
    "rest": [
        {"title": "MDN: Introduction to web APIs", "url": "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs", "kind": "free"},
    ],
    "machine learning": [
        {"title": "Google Machine Learning Crash Course", "url": "https://developers.google.com/machine-learning/crash-course", "kind": "free"},
        {"title": "Coursera Machine Learning Specialization", "url": "https://www.coursera.org/specializations/machine-learning-introduction", "kind": "paid"},
    ],
    "git": [
        {"title": "Official Git docs", "url": "https://git-scm.com/doc", "kind": "free"},
    ],
}


def resources_for(skill: str, target_role: str | None = None) -> list[dict[str, str]]:
    """Curated matches for this skill, plus always-valid search links.

    target_role (the user's analyzed target role, not the skill name itself)
    is checked against the roadmap.sh taxonomy — individual skill names like
    "Prompt Engineering" don't contain the role name as a substring, so that
    match has to happen against the role, not the skill.
    """
    skill_lower = skill.lower()
    matches: list[dict[str, str]] = []

    if target_role:
        taxonomy = taxonomy_for(target_role)
        if taxonomy:
            matches.append(
                {
                    "title": taxonomy["roadmap_label"],
                    "url": taxonomy["roadmap_url"],
                    "kind": "free",
                }
            )

    for keyword, links in CURATED.items():
        if keyword in skill_lower:
            matches.extend(links)

    encoded = quote_plus(f"{skill} tutorial")
    matches.append(
        {
            "title": f"YouTube: {skill} tutorials",
            "url": f"https://www.youtube.com/results?search_query={encoded}",
            "kind": "free",
        }
    )
    matches.append(
        {
            "title": f"Udemy: {skill} courses",
            "url": f"https://www.udemy.com/courses/search/?q={quote_plus(skill)}",
            "kind": "paid",
        }
    )
    return matches
