import sys
import os

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

from fastapi.testclient import TestClient

# Ensure backend directory is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import app
from seed import seed_database

client = TestClient(app)


def run_tests():
    print("\n=======================================================")
    print("🚀 RUNNING SKILLNEXUS BACKEND END-TO-END VERIFICATION")
    print("=======================================================\n")

    # 1. Reset and re-seed database
    print("1️⃣ Seeding clean database for tests...")
    seed_database()
    print("   ✅ Database seeded successfully.\n")

    # 2. Root and Healthcheck
    print("2️⃣ Testing Public Root & Healthcheck...")
    res = client.get("/")
    assert res.status_code == 200, f"Root failed: {res.text}"
    assert res.json()["project"] == "SKILLNEXUS"

    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    assert res.json()["status"] == "healthy"
    print("   ✅ Root & Healthcheck OK.")

    # 3. Auth Endpoints
    print("\n3️⃣ Testing Authentication & RBAC...")
    # Login Student
    res = client.post("/api/auth/login", json={"email": "student@demo.com", "password": "demo123"})
    assert res.status_code == 200, f"Student login failed: {res.text}"
    student_token = res.json()["access_token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}
    print("   ✅ Student Login OK.")

    # Login Professional
    res = client.post("/api/auth/login", json={"email": "professional@demo.com", "password": "demo123"})
    assert res.status_code == 200, f"Professional login failed: {res.text}"
    prof_token = res.json()["access_token"]
    prof_headers = {"Authorization": f"Bearer {prof_token}"}
    print("   ✅ Professional Login OK.")

    # Login Academician
    res = client.post("/api/auth/login", json={"email": "academic@demo.com", "password": "demo123"})
    assert res.status_code == 200, f"Academician login failed: {res.text}"
    acad_token = res.json()["access_token"]
    acad_headers = {"Authorization": f"Bearer {acad_token}"}
    print("   ✅ Academician Login OK.")

    # Check /me
    res = client.get("/api/auth/me", headers=student_headers)
    assert res.status_code == 200
    assert res.json()["role"] == "student"
    print("   ✅ /api/auth/me OK.")

    # Register New User
    reg_payload = {
        "name": "Kunal Sen",
        "email": "kunal.sen@test.com",
        "password": "password123",
        "role": "student",
        "organization": "IIT Kharagpur",
        "degree": "B.Tech",
        "branch": "Electrical",
        "year": "3rd Year"
    }
    res = client.post("/api/auth/register", json=reg_payload)
    assert res.status_code == 201, f"Registration failed: {res.text}"
    print("   ✅ Registration OK.")

    # 4. Assessment Workflow
    print("\n4️⃣ Testing Student Assessment Workflow...")
    res = client.get("/api/assessment/questions", headers=student_headers)
    assert res.status_code == 200
    questions = res.json()
    assert len(questions) >= 50, f"Expected 50+ questions, got {len(questions)}"
    print(f"   ✅ Fetched {len(questions)} assessment questions.")

    # Submit answers for first 10 questions
    sample_answers = {q["id"]: 1 for q in questions[:10]}
    res = client.post("/api/assessment/submit", json={"answers": sample_answers}, headers=student_headers)
    assert res.status_code == 200, f"Assessment submit failed: {res.text}"
    result = res.json()
    assert "skills_scored" in result
    print(f"   ✅ Assessment submitted. Skills scored: {list(result['skills_scored'].keys())}")

    # 5. AI Skill Gap & Opportunity Recommendations
    print("\n5️⃣ Testing AI Matching & Skill-Gap Analysis...")
    # Skill gap
    res = client.get("/api/student/skill-gap?target_role=Full Stack Developer", headers=student_headers)
    assert res.status_code == 200, f"Skill gap failed: {res.text}"
    gap = res.json()
    assert gap["target_role"] == "Full Stack Developer"
    assert "readiness_percentage" in gap
    assert "matched_skills" in gap
    assert "missing_skills" in gap
    print(f"   ✅ Full Stack Developer readiness: {gap['readiness_percentage']}%. Recommended courses: {len(gap['recommended_programs'])}")

    # Recommendations
    res = client.get("/api/student/recommendations", headers=student_headers)
    assert res.status_code == 200, f"Recommendations failed: {res.text}"
    recs = res.json()
    assert len(recs) > 0
    print(f"   ✅ Fetched {len(recs)} ranked recommendations. Top match: {recs[0]['opportunity']['title']} ({recs[0]['match_percent']}%)")

    # 6. Opportunities and Applications
    print("\n6️⃣ Testing Opportunities & Applications Workflow...")
    # List opportunities
    res = client.get("/api/opportunities?type=internship")
    assert res.status_code == 200
    opps = res.json()
    assert len(opps) > 0
    sample_opp = opps[0]
    print(f"   ✅ Listed {len(opps)} internships.")

    # Apply to an opportunity
    opp_to_apply = opps[-1]["id"]
    res = client.post("/api/applications", json={"opportunity_id": opp_to_apply}, headers=student_headers)
    assert res.status_code in (201, 400), f"Application failed: {res.text}"

    # Get my applications
    res = client.get("/api/applications/mine", headers=student_headers)
    assert res.status_code == 200
    my_apps = res.json()
    assert len(my_apps) > 0
    print(f"   ✅ Student has {len(my_apps)} applications on file.")

    # 7. Mentorship & Portfolio & Skill Exchange
    print("\n7️⃣ Testing Mentorship, Portfolio & Skill Exchange...")
    # Mentors list
    res = client.get("/api/mentors")
    assert res.status_code == 200
    mentors = res.json()
    assert len(mentors) > 0
    print(f"   ✅ Listed {len(mentors)} mentors.")

    # Book mentorship slot if open slot exists
    open_slot_id = None
    for m in mentors:
        if m.get("open_slots"):
            open_slot_id = m["open_slots"][0]["id"]
            break

    if open_slot_id:
        res = client.post(f"/api/mentorship/book/{open_slot_id}", headers=student_headers)
        assert res.status_code == 200, f"Mentorship booking failed: {res.text}"
        print(f"   ✅ Mentorship slot #{open_slot_id} booked.")

    # Portfolio CRUD
    port_payload = {
        "type": "project",
        "title": "Smart AI Healthcare Triage",
        "description": "Built using FastAPI and React",
        "link": "https://github.com/demo/smart-triage"
    }
    res = client.post("/api/portfolio", json=port_payload, headers=student_headers)
    assert res.status_code == 201, f"Portfolio create failed: {res.text}"
    port_id = res.json()["id"]

    res = client.get("/api/portfolio", headers=student_headers)
    assert res.status_code == 200

    res = client.put(f"/api/portfolio/{port_id}", json={"title": "Smart AI Healthcare Triage v2"}, headers=student_headers)
    assert res.status_code == 200
    assert res.json()["title"] == "Smart AI Healthcare Triage v2"

    res = client.delete(f"/api/portfolio/{port_id}", headers=student_headers)
    assert res.status_code == 200
    print("   ✅ Portfolio CRUD verified.")

    # Skill Exchange Request
    pro_id = mentors[0]["id"]
    exchange_payload = {
        "professional_id": pro_id,
        "offered_skill": "React",
        "requested_skill": "Cloud Computing",
        "note": "Let's connect for peer review!"
    }
    res = client.post("/api/skill-exchange", json=exchange_payload, headers=student_headers)
    assert res.status_code == 201, f"Skill exchange failed: {res.text}"
    exchange_id = res.json()["id"]
    print(f"   ✅ Skill exchange requested (ID: {exchange_id}).")

    # 8. Professional & Academician Workflows
    print("\n8️⃣ Testing Professional & Academician Privileges...")
    # Create opportunity
    new_opp_payload = {
        "type": "internship",
        "title": "AI Research Associate Intern",
        "company": "SkillNexus AI Lab",
        "description": "Collaborate on NLP and deep learning models for skill taxonomy extraction.",
        "required_skills": ["Python", "Machine Learning", "FastAPI"],
        "location": "Bengaluru",
        "mode": "hybrid",
        "stipend_or_salary": "₹50,000/month",
        "deadline": "2026-11-30"
    }
    res = client.post("/api/opportunities", json=new_opp_payload, headers=prof_headers)
    assert res.status_code == 201, f"Opportunity creation failed: {res.text}"
    created_opp_id = res.json()["id"]
    print(f"   ✅ Professional created opportunity #{created_opp_id}.")

    # Student cannot create opportunity (RBAC check)
    res = client.post("/api/opportunities", json=new_opp_payload, headers=student_headers)
    assert res.status_code == 403, "Student should NOT be able to create opportunities!"
    print("   ✅ RBAC Guard confirmed: Student blocked from creating opportunity (403 Forbidden).")

    # Candidate ranking for an opportunity
    res = client.get(f"/api/opportunities/{sample_opp['id']}/candidates", headers=prof_headers)
    assert res.status_code == 200, f"Candidate matching failed: {res.text}"
    candidates = res.json()
    print(f"   ✅ Opportunity #{sample_opp['id']} candidates ranked by skill match %: {len(candidates)} candidates.")

    # Patch application status
    if my_apps:
        app_id_to_patch = my_apps[0]["id"]
        res = client.patch(
            f"/api/applications/{app_id_to_patch}",
            json={"status": "interview", "mentor_feedback": "Shortlisted for Round 1 Technical Interview"},
            headers=prof_headers
        )
        assert res.status_code == 200, f"Patch application failed: {res.text}"
        assert res.json()["status"] == "interview"
        print(f"   ✅ Application #{app_id_to_patch} status updated to 'interview'.")

    # Professional mentorship slots
    res = client.post("/api/mentorship/slots", json={"topic": "Microservices in Go & Python", "datetime": "Next Sunday at 4:00 PM IST"}, headers=prof_headers)
    assert res.status_code == 201
    new_slot_id = res.json()["id"]

    res = client.patch(f"/api/mentorship/{new_slot_id}/complete", json={"feedback": "Completed discussion on API gateways"}, headers=prof_headers)
    assert res.status_code == 200
    assert res.json()["status"] == "completed"
    print("   ✅ Mentorship slots management OK.")

    # 9. Analytics Endpoints
    print("\n9️⃣ Testing Analytics Endpoints...")
    res = client.get("/api/analytics/overview", headers=prof_headers)
    assert res.status_code == 200, f"Analytics overview failed: {res.text}"
    analytics = res.json()
    assert analytics["total_students"] >= 15
    assert analytics["total_opportunities"] >= 25
    assert "placement_funnel" in analytics
    print(f"   ✅ Analytics Overview: {analytics['total_students']} Students, {analytics['total_opportunities']} Opportunities, Funnel: {analytics['placement_funnel']}")

    res = client.get("/api/analytics/skill-demand", headers=acad_headers)
    assert res.status_code == 200, f"Skill demand failed: {res.text}"
    demand = res.json()
    assert len(demand) > 0
    print(f"   ✅ Top in-demand skill: {demand[0]['skill']} ({demand[0]['count']} opportunities, {demand[0]['percentage']}%)")

    print("\n=======================================================")
    print("🎉 ALL ENDPOINTS & AI MODULES VERIFIED SUCCESSFULLY!")
    print("=======================================================\n")


if __name__ == "__main__":
    run_tests()
