from typing import Dict, List, Tuple, Any
import numpy as np

try:
    from sklearn.metrics.pairwise import cosine_similarity
except ImportError:
    # Fallback if scikit-learn is still completing installation
    def cosine_similarity(v1, v2):
        v1 = np.array(v1)
        v2 = np.array(v2)
        dot = np.dot(v1, v2.T)
        norm1 = np.linalg.norm(v1, axis=1, keepdims=True)
        norm2 = np.linalg.norm(v2, axis=1, keepdims=True)
        denominator = np.dot(norm1, norm2.T)
        denominator[denominator == 0] = 1e-9
        return dot / denominator


ROLE_REQUIREMENTS: Dict[str, Dict[str, int]] = {
    "Data Analyst": {
        "Python": 3,
        "SQL": 4,
        "Statistics": 3,
        "Data Visualization": 4,
        "Excel": 4,
        "Machine Learning": 2,
    },
    "Full Stack Developer": {
        "React": 4,
        "JavaScript": 4,
        "Node.js": 3,
        "SQL": 3,
        "Git": 3,
        "HTML/CSS": 4,
        "REST APIs": 3,
    },
    "Machine Learning Engineer": {
        "Python": 4,
        "Machine Learning": 4,
        "Deep Learning": 3,
        "Data Structures": 3,
        "SQL": 3,
        "Mathematics": 3,
    },
    "ML Engineer": {
        "Python": 4,
        "Machine Learning": 4,
        "Deep Learning": 3,
        "Data Structures": 3,
        "SQL": 3,
        "Mathematics": 3,
    },
    "Cloud Engineer": {
        "Cloud Computing": 4,
        "Docker": 3,
        "Kubernetes": 3,
        "Linux": 3,
        "Python": 3,
        "Networking": 3,
    },
    "Cybersecurity Analyst": {
        "Network Security": 4,
        "Cryptography": 3,
        "Linux": 3,
        "Python": 3,
        "Ethical Hacking": 3,
        "Incident Response": 3,
    },
    "UI/UX Designer": {
        "Figma": 4,
        "Wireframing": 4,
        "User Research": 3,
        "Prototyping": 4,
        "Design Systems": 3,
        "Communication": 3,
    },
    "Business Analyst": {
        "SQL": 3,
        "Business Intelligence": 4,
        "Excel": 4,
        "Communication": 4,
        "Agile/Scrum": 3,
        "Problem Solving": 4,
    },
}


def build_skill_vocabulary(all_skills: List[str]) -> List[str]:
    """Create a unique, lowercased vocabulary list while keeping original casing map."""
    unique_skills = []
    seen = set()
    for s in all_skills:
        clean = s.strip()
        if clean and clean.lower() not in seen:
            seen.add(clean.lower())
            unique_skills.append(clean)
    return sorted(unique_skills, key=lambda x: x.lower())


def compute_match_score(
    student_skills: Dict[str, int],
    required_skills: List[str],
    vocabulary: List[str]
) -> Tuple[float, List[str], List[str]]:
    """
    Compute matching percentage, matching skills, and missing skills.
    Student skills vector: level / 5.0 (0.0 to 1.0)
    Opportunity vector: 1.0 for required skills, 0.0 otherwise.
    """
    if not required_skills:
        return 100.0, [], []

    # Map student skills for case-insensitive lookup
    student_map = {k.strip().lower(): v for k, v in student_skills.items()}
    req_set = {s.strip().lower(): s.strip() for s in required_skills}

    matching_skills = []
    missing_skills = []

    for req_lower, req_orig in req_set.items():
        if req_lower in student_map and student_map[req_lower] > 0:
            matching_skills.append(req_orig)
        else:
            missing_skills.append(req_orig)

    # Ensure vocabulary contains all needed skills
    vocab_lower = [v.lower() for v in vocabulary]
    for req_lower in req_set:
        if req_lower not in vocab_lower:
            vocab_lower.append(req_lower)

    # Build vectors
    v_student = np.zeros(len(vocab_lower), dtype=np.float32)
    v_opp = np.zeros(len(vocab_lower), dtype=np.float32)

    for i, term in enumerate(vocab_lower):
        if term in student_map:
            level = student_map[term]
            v_student[i] = min(max(level, 0), 5) / 5.0
        if term in req_set:
            v_opp[i] = 1.0

    if np.all(v_student == 0) or np.all(v_opp == 0):
        # Fallback ratio match if zero vector
        if len(req_set) > 0:
            ratio = (len(matching_skills) / len(req_set)) * 100.0
            return round(ratio, 1), matching_skills, missing_skills
        return 0.0, matching_skills, missing_skills

    sim_matrix = cosine_similarity(v_student.reshape(1, -1), v_opp.reshape(1, -1))
    cos_sim = float(sim_matrix[0][0])
    match_percent = round(min(max(cos_sim * 100.0, 0.0), 100.0), 1)

    return match_percent, matching_skills, missing_skills


def analyze_skill_gap(
    student_skills: Dict[str, int],
    target_role: str,
    available_programs: List[Any]
) -> Dict[str, Any]:
    """
    Evaluate student readiness for a target role, compute gap, and recommend programs.
    """
    # Find matching role key
    normalized_target = target_role.strip().lower()
    selected_role_key = None
    for role_name in ROLE_REQUIREMENTS.keys():
        if role_name.lower() == normalized_target:
            selected_role_key = role_name
            break

    if not selected_role_key:
        # Default fallback to closest or Data Analyst
        selected_role_key = "Data Analyst"

    role_spec = ROLE_REQUIREMENTS[selected_role_key]
    student_map = {k.strip().lower(): v for k, v in student_skills.items()}

    matched_skills = []
    missing_skills = []
    total_points = 0.0
    max_points = 0.0

    for req_skill, min_level in role_spec.items():
        curr_level = student_map.get(req_skill.lower(), 0)
        max_points += min_level
        total_points += min(curr_level, min_level)

        status_obj = {
            "skill": req_skill,
            "required_level": min_level,
            "current_level": curr_level,
            "met": curr_level >= min_level
        }

        if curr_level >= min_level:
            matched_skills.append(status_obj)
        else:
            missing_skills.append(status_obj)

    readiness = round((total_points / max_points * 100.0), 1) if max_points > 0 else 0.0

    # Recommend learning programs that cover any missing skills
    missing_skill_names = {s["skill"].lower() for s in missing_skills}
    recommended_programs = []

    for prog in available_programs:
        skills_covered = prog.skills_covered if isinstance(prog.skills_covered, list) else []
        covered_lowers = [s.strip().lower() for s in skills_covered]
        overlap = [s for s in covered_lowers if s in missing_skill_names]
        if overlap:
            recommended_programs.append({
                "id": prog.id,
                "title": prog.title,
                "provider": prog.provider,
                "skills_covered": prog.skills_covered,
                "type": prog.type,
                "url": prog.url,
                "duration": prog.duration,
                "matching_needed_skills": [s for s in skills_covered if s.strip().lower() in missing_skill_names]
            })

    return {
        "target_role": selected_role_key,
        "readiness_percentage": readiness,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "recommended_programs": recommended_programs[:6]  # top relevant
    }
