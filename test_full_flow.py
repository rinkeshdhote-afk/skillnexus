import sys
import requests

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

BACKEND_URL = "http://127.0.0.1:8000/api"


def verify_full_flow():
    print("=" * 65)
    print("🚀 VERIFYING END-TO-END SIH26044 CROSS-PORTAL WORKFLOW")
    print("=" * 65)

    # 1. Login as Professional (Priya Nair, Microsoft)
    print("\n1️⃣ Logging in as Professional (Mentor/Recruiter)...")
    pro_login = requests.post(
        f"{BACKEND_URL}/auth/login",
        json={"email": "professional@demo.com", "password": "demo123"}
    )
    assert pro_login.status_code == 200, f"Professional login failed: {pro_login.text}"
    pro_token = pro_login.json()["access_token"]
    pro_headers = {"Authorization": f"Bearer {pro_token}"}
    print("   ✅ Professional authenticated.")

    # 2. Professional Posts a new Opportunity
    print("\n2️⃣ Professional publishes a new Opportunity...")
    new_opp_payload = {
        "type": "internship",
        "title": "Cloud Native AI Solutions Intern",
        "company": "Microsoft Research India",
        "description": "Design distributed microservices and LLM pipelines using Python, React, and Docker.",
        "required_skills": ["Python", "React", "Docker", "SQL"],
        "location": "Bengaluru",
        "mode": "hybrid",
        "stipend_or_salary": "₹65,000/month",
        "deadline": "2026-12-31"
    }
    opp_res = requests.post(f"{BACKEND_URL}/opportunities", json=new_opp_payload, headers=pro_headers)
    assert opp_res.status_code == 201, f"Post opportunity failed: {opp_res.text}"
    opp_id = opp_res.json()["id"]
    print(f"   ✅ Created Opportunity #{opp_id}: '{new_opp_payload['title']}'")

    # 3. Student Logs in (Aarav Sharma, IIT Bombay)
    print("\n3️⃣ Logging in as Student (Aarav Sharma)...")
    stu_login = requests.post(
        f"{BACKEND_URL}/auth/login",
        json={"email": "student@demo.com", "password": "demo123"}
    )
    assert stu_login.status_code == 200, f"Student login failed: {stu_login.text}"
    stu_token = stu_login.json()["access_token"]
    stu_headers = {"Authorization": f"Bearer {stu_token}"}
    print("   ✅ Student authenticated.")

    # 4. Student queries AI Recommendations
    print("\n4️⃣ Student queries AI Recommendations (Cosine Similarity)...")
    recs_res = requests.get(f"{BACKEND_URL}/student/recommendations", headers=stu_headers)
    assert recs_res.status_code == 200, f"Recommendations failed: {recs_res.text}"
    recs = recs_res.json()
    matched_rec = next((r for r in recs if r["opportunity"]["id"] == opp_id), None)
    assert matched_rec is not None, "Newly created opportunity should appear in student recommendations!"
    print(f"   ✅ Opportunity #{opp_id} ranked with match score: {matched_rec['match_percent']}%")
    print(f"      - Verified Matching skills: {matched_rec['matching_skills']}")
    print(f"      - Missing skills: {matched_rec['missing_skills']}")

    # 5. Student Applies to the Opportunity
    print("\n5️⃣ Student applies for the Opportunity...")
    apply_res = requests.post(f"{BACKEND_URL}/applications", json={"opportunity_id": opp_id}, headers=stu_headers)
    assert apply_res.status_code == 201, f"Apply failed: {apply_res.text}"
    app_id = apply_res.json()["id"]
    print(f"   ✅ Application #{app_id} submitted by student.")

    # 6. Professional Inspects Ranked Candidates for this Opportunity
    print("\n6️⃣ Professional views AI-Ranked Candidates for Opportunity...")
    cand_res = requests.get(f"{BACKEND_URL}/opportunities/{opp_id}/candidates", headers=pro_headers)
    assert cand_res.status_code == 200, f"Candidates retrieval failed: {cand_res.text}"
    candidates = cand_res.json()
    student_candidate = next((c for c in candidates if c["application_id"] == app_id), None)
    assert student_candidate is not None
    print(f"   ✅ Candidate found: {student_candidate['student_name']} (Match: {student_candidate['match_percent']}%)")

    # 7. Professional Shortlists the Student and Adds Mentor Feedback
    print("\n7️⃣ Professional shortlists candidate with feedback...")
    patch_payload = {
        "status": "shortlisted",
        "mentor_feedback": "Strong verified mastery in Python and React. Invited to Round 1 Technical Interview."
    }
    patch_res = requests.patch(f"{BACKEND_URL}/applications/{app_id}", json=patch_payload, headers=pro_headers)
    assert patch_res.status_code == 200, f"Shortlist failed: {patch_res.text}"
    print(f"   ✅ Application #{app_id} updated to 'shortlisted'.")

    # 8. Student Checks Applications Pipeline & Sees Status + Feedback
    print("\n8️⃣ Student views updated application status & feedback...")
    my_apps_res = requests.get(f"{BACKEND_URL}/applications/mine", headers=stu_headers)
    assert my_apps_res.status_code == 200
    my_app = next((a for a in my_apps_res.json() if a["id"] == app_id), None)
    assert my_app is not None
    assert my_app["status"] == "shortlisted"
    assert "Strong verified mastery" in my_app["mentor_feedback"]
    print(f"   ✅ Student sees real-time status: '{my_app['status']}'")
    print(f"      Feedback received: \"{my_app['mentor_feedback']}\"")

    # 9. Test Demo Reset Endpoint
    print("\n9️⃣ Testing /api/demo/reset endpoint...")
    reset_res = requests.post(f"{BACKEND_URL}/demo/reset")
    assert reset_res.status_code == 200
    print("   ✅ Demo reset confirmed. Database re-seeded to initial pristine state.")

    print("\n" + "=" * 65)
    print("🎉 FULL CROSS-PORTAL COLLABORATION LOOP VERIFIED 100% SUCCESS!")
    print("=" * 65 + "\n")


if __name__ == "__main__":
    verify_full_flow()
