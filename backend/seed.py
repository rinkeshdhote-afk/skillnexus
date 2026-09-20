import sys
import os
from datetime import datetime, timedelta

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

# Ensure backend directory is in python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, SessionLocal, Base
from models import (
    User,
    StudentProfile,
    ProfessionalProfile,
    Skill,
    Opportunity,
    Application,
    LearningProgram,
    MentorshipSlot,
    SkillExchange,
    PortfolioItem,
    AssessmentQuestion,
)
from auth.security import get_password_hash


def seed_database():
    print("🌱 Initializing database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    demo_password_hash = get_password_hash("demo123")

    try:
        # ==========================================
        # 1. SEED SKILLS (Technical & Soft)
        # ==========================================
        print("⚡ Seeding Skills...")
        skills_data = [
            ("Python", "technical"),
            ("SQL", "technical"),
            ("Machine Learning", "technical"),
            ("Deep Learning", "technical"),
            ("React", "technical"),
            ("JavaScript", "technical"),
            ("Node.js", "technical"),
            ("Java", "technical"),
            ("Data Structures", "technical"),
            ("Cloud Computing", "technical"),
            ("Docker", "technical"),
            ("Kubernetes", "technical"),
            ("Linux", "technical"),
            ("Git", "technical"),
            ("Figma", "technical"),
            ("FastAPI", "technical"),
            ("Data Visualization", "technical"),
            ("Statistics", "technical"),
            ("Network Security", "technical"),
            ("REST APIs", "technical"),
            ("Communication", "soft"),
            ("Teamwork", "soft"),
            ("Problem Solving", "soft"),
            ("Agile/Scrum", "soft"),
            ("Critical Thinking", "soft"),
        ]

        skill_records = {}
        for name, cat in skills_data:
            s = Skill(name=name, category=cat)
            db.add(s)
            skill_records[name] = s
        db.commit()

        # ==========================================
        # 2. SEED DEMO USERS (Student, Professional, Academician)
        # ==========================================
        print("👤 Seeding Core Demo Users...")
        # 1) Demo Student
        demo_student = User(
            name="Aarav Sharma",
            email="student@demo.com",
            password_hash=demo_password_hash,
            role="student",
            organization="IIT Bombay",
            created_at=datetime.utcnow() - timedelta(days=60)
        )
        db.add(demo_student)
        db.flush()

        db.add(StudentProfile(
            user_id=demo_student.id,
            degree="B.Tech",
            branch="Computer Science & Engineering",
            year="3rd Year",
            interests="Full Stack Web Development, Machine Learning, Open Source Contributions",
            skills={"Python": 4, "SQL": 4, "React": 4, "Data Structures": 3, "Git": 4, "Communication": 4},
            assessment_done=True
        ))

        # 2) Demo Professional (Mentor)
        demo_prof = User(
            name="Priya Nair",
            email="professional@demo.com",
            password_hash=demo_password_hash,
            role="professional",
            organization="Microsoft India",
            created_at=datetime.utcnow() - timedelta(days=90)
        )
        db.add(demo_prof)
        db.flush()

        db.add(ProfessionalProfile(
            user_id=demo_prof.id,
            designation="Principal Software Architect",
            company="Microsoft India",
            expertise=["Full Stack Developer", "Cloud Computing", "Docker", "System Design"],
            years_experience=10.5,
            is_verified=True,
            sub_role="mentor"
        ))

        # 3) Demo Academician
        demo_academic = User(
            name="Dr. Rajesh Raman",
            email="academic@demo.com",
            password_hash=demo_password_hash,
            role="academician",
            organization="BITS Pilani",
            created_at=datetime.utcnow() - timedelta(days=120)
        )
        db.add(demo_academic)
        db.flush()

        db.add(ProfessionalProfile(
            user_id=demo_academic.id,
            designation="Head of Department & Placement Dean",
            company="BITS Pilani",
            expertise=["Machine Learning", "Data Structures", "Research & Innovation"],
            years_experience=18.0,
            is_verified=True,
            sub_role="mentor"
        ))

        # ==========================================
        # 3. SEED 14 ADDITIONAL STUDENTS (Total 15)
        # ==========================================
        print("🎓 Seeding 14 additional Students...")
        students_info = [
            ("Ishita Patel", "ishita.patel@gmail.com", "VJTI Mumbai", "B.Tech", "Information Technology", "4th Year",
             {"Python": 5, "Machine Learning": 4, "SQL": 4, "Statistics": 4, "Deep Learning": 3}, True),
            ("Rohan Gupta", "rohan.gupta@outlook.com", "DTU Delhi", "B.Tech", "Computer Science", "3rd Year",
             {"React": 5, "JavaScript": 5, "Node.js": 4, "Git": 4, "HTML/CSS": 5}, True),
            ("Ananya Iyer", "ananya.iyer@gmail.com", "Anna University Chennai", "B.Tech", "Electronics & Comm.", "4th Year",
             {"Python": 3, "Cloud Computing": 4, "Docker": 3, "Linux": 4, "Networking": 3}, True),
            ("Siddharth Verma", "siddharth.v@gmail.com", "NIT Trichy", "B.Tech", "Computer Science", "2nd Year",
             {"Java": 4, "Data Structures": 4, "Problem Solving": 4, "Git": 3}, True),
            ("Sneha Kulkarni", "sneha.k@gmail.com", "COEP Pune", "B.Tech", "Data Science", "3rd Year",
             {"SQL": 5, "Python": 4, "Data Visualization": 4, "Statistics": 4, "Excel": 4}, True),
            ("Vikram Singhania", "vikram.s@gmail.com", "IIIT Hyderabad", "B.Tech", "Computer Science", "4th Year",
             {"Python": 4, "Machine Learning": 4, "Data Structures": 5, "C++": 4}, True),
            ("Pooja Hegde", "pooja.h@gmail.com", "BMS College Bangalore", "B.Tech", "Information Science", "3rd Year",
             {"Figma": 5, "Wireframing": 4, "HTML/CSS": 4, "Communication": 5}, True),
            ("Kavya Nambiar", "kavya.n@gmail.com", "CET Trivandrum", "B.Tech", "Computer Science", "3rd Year",
             {"React": 4, "JavaScript": 4, "REST APIs": 4, "SQL": 3}, True),
            ("Manish Tiwari", "manish.t@gmail.com", "HBTI Kanpur", "B.Tech", "Mechanical Engg.", "4th Year",
             {"Python": 3, "SQL": 3, "Excel": 4, "Problem Solving": 4}, True),
            ("Neha Choudhary", "neha.c@gmail.com", "Jadavpur University Kolkata", "B.Tech", "IT", "4th Year",
             {"Cloud Computing": 4, "Kubernetes": 3, "Docker": 4, "Linux": 4}, True),
            ("Arjun Deshmukh", "arjun.d@gmail.com", "VJTI Mumbai", "B.Tech", "Electronics", "2nd Year",
             {"Python": 2, "Data Structures": 2, "Git": 2}, False),
            ("Divya Soni", "divya.s@gmail.com", "MNIT Jaipur", "B.Tech", "Computer Science", "3rd Year",
             {"Network Security": 4, "Linux": 4, "Cryptography": 3, "Python": 3}, True),
            ("Aditya Roy", "aditya.roy@gmail.com", "KIIT Bhubaneswar", "B.Tech", "Computer Science", "4th Year",
             {"React": 3, "Node.js": 3, "SQL": 3, "Git": 3}, True),
            ("Meera Bansal", "meera.b@gmail.com", "Thapar Institute Patiala", "B.Tech", "Software Engg.", "3rd Year",
             {"SQL": 4, "Business Intelligence": 4, "Excel": 5, "Communication": 4}, True),
        ]

        student_users = [demo_student]
        for name, email, college, deg, branch, yr, sks, assessed in students_info:
            u = User(
                name=name,
                email=email,
                password_hash=demo_password_hash,
                role="student",
                organization=college,
                created_at=datetime.utcnow() - timedelta(days=20)
            )
            db.add(u)
            db.flush()
            db.add(StudentProfile(
                user_id=u.id,
                degree=deg,
                branch=branch,
                year=yr,
                interests="Industry project readiness and placement",
                skills=sks,
                assessment_done=assessed
            ))
            student_users.append(u)
        db.commit()

        # ==========================================
        # 4. SEED 4 MORE PROFESSIONALS (Total 5: 3 Mentors, 2 Recruiters) + 1 MORE ACADEMICIAN (Total 2)
        # ==========================================
        print("💼 Seeding additional Industry Professionals and Academicians...")
        profs_data = [
            ("Suresh Reddy", "suresh.reddy@google.com", "Google India", "Staff ML Engineer",
             ["Python", "Machine Learning", "Deep Learning", "Mathematics"], 8.0, "mentor"),
            ("Anita Das", "anita.das@tcs.com", "Tata Consultancy Services (TCS)", "Technical Delivery Lead",
             ["Java", "Cloud Computing", "Teamwork", "Agile/Scrum"], 12.0, "mentor"),
            ("Karan Kapoor", "karan.kapoor@flipkart.com", "Flipkart", "Lead Talent Acquisition Partner",
             ["Recruitment", "Communication", "Talent Sourcing"], 6.5, "recruiter"),
            ("Tanvi Mehra", "tanvi.mehra@razorpay.com", "Razorpay", "Senior Tech Talent Partner",
             ["Tech Recruiting", "Campus Placement", "Fintech Hiring"], 5.0, "recruiter"),
        ]

        prof_users = [demo_prof]
        for name, email, company, desig, exp_list, yrs, subrole in profs_data:
            u = User(
                name=name,
                email=email,
                password_hash=demo_password_hash,
                role="professional",
                organization=company,
                created_at=datetime.utcnow() - timedelta(days=80)
            )
            db.add(u)
            db.flush()
            db.add(ProfessionalProfile(
                user_id=u.id,
                designation=desig,
                company=company,
                expertise=exp_list,
                years_experience=yrs,
                is_verified=True,
                sub_role=subrole
            ))
            prof_users.append(u)

        # 2nd Academician
        acad_user_2 = User(
            name="Prof. Sunita Mukherjee",
            email="sunita.m@iitd.ac.in",
            password_hash=demo_password_hash,
            role="academician",
            organization="IIT Delhi",
            created_at=datetime.utcnow() - timedelta(days=150)
        )
        db.add(acad_user_2)
        db.flush()
        db.add(ProfessionalProfile(
            user_id=acad_user_2.id,
            designation="Professor & Industry Liaison Officer",
            company="IIT Delhi",
            expertise=["Cloud Computing", "Cybersecurity Analyst", "Distributed Systems"],
            years_experience=22.0,
            is_verified=True,
            sub_role="mentor"
        ))
        academic_users = [demo_academic, acad_user_2]
        db.commit()

        # ==========================================
        # 5. SEED 60 ASSESSMENT QUESTIONS ACROSS ~15 SKILLS
        # ==========================================
        print("📝 Seeding 60 Assessment Questions across skills...")
        questions_data = [
            # Python (4 questions)
            ("Python", "technical", "What is the primary difference between a tuple and a list in Python?",
             ["Lists are immutable, tuples are mutable", "Tuples are immutable, lists are mutable", "Tuples cannot store strings", "Lists have faster iteration than tuples"], 1),
            ("Python", "technical", "Which built-in Python function returns an iterator of tuples from multiple sequences?",
             ["map()", "zip()", "enumerate()", "filter()"], 1),
            ("Python", "technical", "How is memory management predominantly handled in CPython?",
             ["Manual deallocation by programmer", "Reference counting combined with a cyclic garbage collector", "Purely through mark-and-sweep every 10 seconds", "Operating system swap space"], 1),
            ("Python", "technical", "What decorator is used in Python to define a method that belongs to the class rather than instances?",
             ["@classmethod", "@staticmethod", "@property", "@instancemethod"], 0),

            # SQL (4 questions)
            ("SQL", "technical", "What clause is used to filter group aggregates in an SQL query?",
             ["WHERE", "HAVING", "GROUP FILTER", "LIMIT"], 1),
            ("SQL", "technical", "Which SQL constraint ensures that all values in a column are distinct?",
             ["NOT NULL", "CHECK", "UNIQUE", "FOREIGN KEY"], 2),
            ("SQL", "technical", "What is the result of a FULL OUTER JOIN between table A and table B?",
             ["Only rows that match in both tables", "All rows from table A and only matching from B", "All rows from both tables, with NULLs for unmatched sides", "A Cartesian product of all rows"], 2),
            ("SQL", "technical", "Which database index structure is most widely used for range-based queries?",
             ["Hash Table", "B-Tree / B+ Tree", "R-Tree", "Linked List"], 1),

            # Machine Learning (4 questions)
            ("Machine Learning", "technical", "Which metric is best suited for evaluating a model on an imbalanced classification dataset?",
             ["Accuracy", "F1-Score / ROC-AUC", "Mean Squared Error", "R-squared"], 1),
            ("Machine Learning", "technical", "What problem is Regularization (L1/L2) primarily used to prevent?",
             ["Underfitting", "Overfitting", "Slow gradient calculation", "Data leakage"], 1),
            ("Machine Learning", "technical", "What is the role of the activation function in neural networks?",
             ["To speed up hardware memory allocation", "To introduce non-linearity into the network", "To normalize input dimensions", "To calculate the learning rate"], 1),
            ("Machine Learning", "technical", "Which algorithm creates an ensemble of decision trees using random subsets of features and samples?",
             ["K-Means", "Random Forest", "Linear Regression", "Naive Bayes"], 1),

            # React (4 questions)
            ("React", "technical", "Which React hook is used to run side effects in functional components?",
             ["useMemo", "useCallback", "useEffect", "useRef"], 2),
            ("React", "technical", "What is the purpose of keys in React lists?",
             ["To style each list item uniquely", "To help React identify which items have changed, been added, or removed", "To bind click events directly", "To make items accessible to screen readers"], 1),
            ("React", "technical", "What happens when you update state in React via setState or useState setter?",
             ["The DOM is updated synchronously without re-rendering", "React schedules a re-render of the component", "The entire web browser refreshes", "The component is destroyed and re-mounted from scratch"], 1),
            ("React", "technical", "How can you prevent unnecessary re-computations of expensive calculations in React?",
             ["useMemo", "useContext", "useReducer", "useLayoutEffect"], 0),

            # JavaScript (4 questions)
            ("JavaScript", "technical", "What will `typeof NaN` evaluate to in JavaScript?",
             ["'undefined'", "'number'", "'object'", "'nan'"], 1),
            ("JavaScript", "technical", "Which method returns a new array with elements that satisfy a predicate function?",
             ["forEach()", "map()", "filter()", "reduce()"], 2),
            ("JavaScript", "technical", "What is the event loop primarily responsible for in JavaScript?",
             ["Handling concurrent execution by offloading asynchronous callbacks to the call stack", "Rendering 3D animations directly on the GPU", "Compiling JavaScript to WebAssembly", "Allocating RAM for variable closures"], 0),
            ("JavaScript", "technical", "What does the `Promise.all()` method do when one promise in the iterable rejects?",
             ["It waits for all others to finish then ignores the rejection", "It rejects immediately with the reason of the first rejected promise", "It retries the rejected promise automatically", "It resolves with undefined values"], 1),

            # Java (4 questions)
            ("Java", "technical", "Which keyword prevents a Java class from being subclassed / extended?",
             ["static", "final", "abstract", "const"], 1),
            ("Java", "technical", "What is the difference between `==` and `.equals()` when comparing two String objects in Java?",
             ["`==` compares content, `.equals()` compares reference", "`==` compares memory reference, `.equals()` compares character sequence", "There is no difference in modern Java versions", "`==` is for primitive numbers only"], 1),
            ("Java", "technical", "Which collection in Java preserves insertion order and allows fast indexed access?",
             ["HashSet", "ArrayList", "TreeSet", "PriorityQueue"], 1),
            ("Java", "technical", "What exception is thrown when an application attempts to use null where an object reference is required?",
             ["IllegalArgumentException", "NullPointerException", "ClassCastException", "IndexOutOfBoundsException"], 1),

            # Data Structures (4 questions)
            ("Data Structures", "technical", "What is the average time complexity of searching an element in a balanced Binary Search Tree (AVL/Red-Black)?",
             ["O(1)", "O(log N)", "O(N)", "O(N log N)"], 1),
            ("Data Structures", "technical", "Which data structure operates on a First-In-First-Out (FIFO) principle?",
             ["Stack", "Queue", "Max Heap", "Graph"], 1),
            ("Data Structures", "technical", "What is the worst-case time complexity of standard QuickSort with poor pivot selection?",
             ["O(log N)", "O(N log N)", "O(N^2)", "O(2^N)"], 2),
            ("Data Structures", "technical", "Which data structure is typically used to implement Breadth-First Search (BFS) in graphs?",
             ["Stack", "Queue", "Priority Queue", "Disjoint Set Union"], 1),

            # Cloud Computing (4 questions)
            ("Cloud Computing", "technical", "Which cloud service model provides virtualized computing resources over the internet without managing underlying OS?",
             ["IaaS", "PaaS", "SaaS", "Bare Metal"], 1),
            ("Cloud Computing", "technical", "What does auto-scaling in cloud architecture accomplish?",
             ["Automatically backs up database files to tape storage", "Dynamically adjusts computational capacity based on live workload traffic", "Changes domain names during high traffic", "Encrypts all network packets using AES-256"], 1),
            ("Cloud Computing", "technical", "What is the primary benefit of deploying applications across multiple cloud availability zones (AZs)?",
             ["Decreased network bandwidth cost", "High availability and fault tolerance against data center failures", "Free storage quotas", "Simpler code deployments"], 1),
            ("Cloud Computing", "technical", "In AWS/Azure, which service provides serverless compute execution triggered by events?",
             ["AWS EC2 / Azure VM", "AWS Lambda / Azure Functions", "AWS EBS / Azure Disk", "AWS RDS / Azure SQL"], 1),

            # Docker & Containers (4 questions)
            ("Docker", "technical", "What instruction in a Dockerfile sets the default command that runs when a container launches?",
             ["RUN", "ENTRYPOINT / CMD", "ENV", "EXPOSE"], 1),
            ("Docker", "technical", "What is the key architectural difference between Docker containers and Virtual Machines?",
             ["Containers share the host OS kernel, while VMs run full guest OS on a hypervisor", "VMs are lighter and faster to boot than containers", "Docker requires dedicated physical hardware cards", "Containers cannot communicate across networks"], 0),
            ("Docker", "technical", "Which command is used to run a container in detached background mode?",
             ["docker run -d", "docker start -b", "docker exec -i", "docker build -t"], 0),
            ("Docker", "technical", "What is a multi-stage Docker build primarily used for?",
             ["Running multiple containers in a cluster", "Minimizing final production image size by separating build and runtime environments", "Building images on multiple CPU architectures simultaneously", "Automatically encrypting image layers"], 1),

            # Git (4 questions)
            ("Git", "technical", "Which Git command incorporates changes from a specified branch into the active branch?",
             ["git merge", "git fork", "git checkout", "git clone"], 0),
            ("Git", "technical", "How do you stash unstaged modifications in Git without committing them?",
             ["git stash save", "git reset --hard", "git branch -d", "git revert"], 0),
            ("Git", "technical", "What is the purpose of `git rebase`?",
             ["To delete remote commit history", "To move or combine a sequence of commits to a new base commit", "To stage all untracked files", "To clone a remote repository with depth 1"], 1),
            ("Git", "technical", "Which command displays the difference between your working directory and the staging area?",
             ["git status", "git diff", "git log -p", "git check"], 1),

            # Linux (4 questions)
            ("Linux", "technical", "Which command displays current system disk space usage in human-readable format?",
             ["free -m", "df -h", "du -s", "top"], 1),
            ("Linux", "technical", "What does file permission `755` mean in Linux?",
             ["Read/write/execute for owner, read/execute for group and others", "Read/write for everyone", "Full access for everyone", "Read only for owner, full for others"], 0),
            ("Linux", "technical", "Which command is used to search for patterns within text files using regular expressions?",
             ["find", "grep", "locate", "sed"], 1),
            ("Linux", "technical", "How do you check running processes and system resource utilization in real time?",
             ["ps -ef", "htop / top", "uptime", "uname -a"], 1),

            # Statistics & Data Analysis (4 questions)
            ("Statistics", "technical", "What does a p-value less than 0.05 typically indicate in hypothesis testing?",
             ["Acceptance of null hypothesis", "Statistically significant evidence against the null hypothesis", "The data has zero variance", "The sample size was too small"], 1),
            ("Statistics", "technical", "Which statistical measure is least affected by extreme outliers?",
             ["Mean", "Median", "Standard Deviation", "Variance"], 1),
            ("Statistics", "technical", "What does a correlation coefficient of -0.92 signify between two variables?",
             ["A weak positive relationship", "A strong negative linear relationship", "No relationship whatsoever", "A non-linear relationship"], 1),
            ("Statistics", "technical", "Which plot is ideal for visualizing the distribution and quartiles of numerical data?",
             ["Pie Chart", "Box and Whisker Plot", "Scatter Plot", "Network Diagram"], 1),

            # Communication (Soft Skill - 4 questions)
            ("Communication", "soft", "In an agile sprint review, what is the best way to communicate unexpected blockers to stakeholders?",
             ["Avoid mentioning them until the deadline passes", "Clearly articulate the blocker, its impact on deliverables, and proposed mitigation steps", "Send a one-word chat message to the client", "Blame other team members publicly"], 1),
            ("Communication", "soft", "What constitutes active listening in professional collaborative meetings?",
             ["Interrupting immediately whenever you have a point", "Paraphrasing key points to confirm understanding and acknowledging the speaker", "Checking your phone while colleagues present", "Only listening to your direct manager"], 1),
            ("Communication", "soft", "How should constructive feedback be delivered to a peer?",
             ["Vaguely and anonymously in public channels", "Specifically, focusing on actions and outcomes with actionable suggestions for improvement", "In emotional terms focusing on personality traits", "Never give feedback to peers"], 1),
            ("Communication", "soft", "What is essential when drafting technical documentation for non-technical stakeholders?",
             ["Use maximum esoteric jargon to impress them", "Use clear language, visual diagrams, executive summaries, and practical business impact", "Keep it strictly as raw code snippets without explanation", "Provide only database schemas"], 1),

            # Teamwork (Soft Skill - 4 questions)
            ("Teamwork", "soft", "When team members disagree on an architectural approach, what is the most productive resolution?",
             ["Majority voting without discussing trade-offs", "Objective evaluation of trade-offs against project requirements, constraints, and benchmarks", "Canceling the project feature entirely", "The loudest developer decides"], 1),
            ("Teamwork", "soft", "What is the primary characteristic of a high-performing collaborative team?",
             ["Zero communication outside emails", "Psychological safety, clear shared objectives, and mutual accountability", "Strict hierarchy where only leads speak", "Individual isolation on isolated modules"], 1),
            ("Teamwork", "soft", "How should a developer respond when a teammate is struggling to meet a sprint goal?",
             ["Ignore it because your own tasks are finished", "Proactively offer pair-programming support or help unblock dependencies", "Report them to HR immediately", "Take credit for their work"], 1),
            ("Teamwork", "soft", "What makes daily standup meetings most effective?",
             ["Spending 2 hours debating architecture details", "Keeping updates concise around what was done, what is planned next, and any blockers", "Reporting attendance only", "Reviewing company financials"], 1),

            # Problem Solving (Soft Skill - 4 questions)
            ("Problem Solving", "soft", "What is the recommended first step when diagnosing a critical production bug?",
             ["Immediately push random code patches to production", "Reproduce the issue reliably and inspect application logs and error metrics", "Delete the database and restore from last month's backup", "Reboot all servers simultaneously"], 1),
            ("Problem Solving", "soft", "What principle suggests breaking down complex large problems into smaller, manageable components?",
             ["Divide and Conquer / Decomposition", "Brute Force Enumeration", "Premature Optimization", "Shotgun Debugging"], 0),
            ("Problem Solving", "soft", "When faced with multiple constraints in a project timeline, how should tasks be prioritized?",
             ["Alphabetically by task title", "By impact on core business value versus technical effort (e.g. Eisenhower Matrix)", "By order of creation in Jira", "Only easiest tasks first"], 1),
            ("Problem Solving", "soft", "What is the purpose of conducting a 'Blameless Post-Mortem' after an incident?",
             ["To assign disciplinary action to the responsible engineer", "To uncover systemic failure points and implement automated safeguards to prevent recurrence", "To report the failure to external media", "To delete the incident ticket"], 1),
        ]

        for skill_name, cat, q_text, opts, correct_idx in questions_data:
            q = AssessmentQuestion(
                skill=skill_name,
                category=cat,
                question=q_text,
                options=opts,
                correct_index=correct_idx
            )
            db.add(q)
        db.commit()

        # ==========================================
        # 6. SEED 25 OPPORTUNITIES (Internships, Jobs, Projects, FDPs, Workshops)
        # ==========================================
        print("💼 Seeding 25 Opportunities across companies...")
        opps_data = [
            # 1
            ("internship", "Full Stack Engineering Intern", "Microsoft India",
             "Join Microsoft IDC team to build modern enterprise web applications using React, TypeScript, and FastAPI.",
             ["React", "JavaScript", "Python", "SQL", "Git"], "Hyderabad", "hybrid", "₹45,000/month", "2026-11-30"),
            # 2
            ("job", "Associate Data Scientist", "Google India",
             "Develop machine learning models and predictive analytics pipelines for Google Cloud customer solutions.",
             ["Python", "Machine Learning", "SQL", "Statistics", "Data Structures"], "Bengaluru", "hybrid", "₹18,00,000/year", "2026-12-15"),
            # 3
            ("internship", "Cloud DevOps Intern", "Tata Consultancy Services (TCS)",
             "Hands-on internship working on AWS infrastructure, CI/CD pipelines, and Docker container orchestration.",
             ["Cloud Computing", "Docker", "Linux", "Git"], "Pune", "onsite", "₹25,000/month", "2026-10-31"),
            # 4
            ("job", "Frontend React Developer", "Flipkart",
             "Build lightning-fast, accessible customer shopping experiences using React, Redux, and modern CSS systems.",
             ["React", "JavaScript", "HTML/CSS", "Git", "REST APIs"], "Bengaluru", "onsite", "₹14,00,000/year", "2026-11-15"),
            # 5
            ("internship", "Data Analytics Trainee", "Razorpay",
             "Analyze transactional patterns, merchant metrics, and create dynamic PowerBI/SQL reporting dashboards.",
             ["SQL", "Python", "Data Visualization", "Statistics", "Excel"], "Bengaluru", "remote", "₹35,000/month", "2026-10-25"),
            # 6
            ("apprenticeship", "Graduate Engineer Trainee - Cloud & Infra", "Wipro Technologies",
             "1-year comprehensive industry apprenticeship covering Linux administration, Docker, and hybrid cloud solutions.",
             ["Linux", "Cloud Computing", "Networking", "Python"], "Chennai", "onsite", "₹30,000/month", "2026-12-01"),
            # 7
            ("project", "Open Source ML Healthcare Diagnostic Toolkit", "IIT Bombay",
             "Collaborative industry-academia research project developing computer vision algorithms for medical scans.",
             ["Python", "Deep Learning", "Machine Learning", "Statistics"], "Mumbai", "remote", "₹20,000 Grant", "2026-11-20"),
            # 8
            ("fdp", "Faculty Development Program on Generative AI & MLOps", "BITS Pilani",
             "5-day sponsored faculty training workshop on deploying large language models and reproducible ML pipelines.",
             ["Python", "Machine Learning", "Deep Learning"], "Goa", "hybrid", "Free (Funded by AICTE)", "2026-10-15"),
            # 9
            ("workshop", "Hands-on Microservices Architecture with Docker & Kubernetes", "Microsoft India",
             "Intensive 2-day hands-on workshop led by Microsoft Architects covering microservice scaling.",
             ["Docker", "Kubernetes", "Cloud Computing", "REST APIs"], "Hyderabad", "remote", "Certificate of Participation", "2026-10-28"),
            # 10
            ("job", "Backend Systems Engineer (Java)", "Infosys Ltd",
             "Design high-throughput financial backend services with Java, Spring Boot, and PostgreSQL.",
             ["Java", "SQL", "Data Structures", "REST APIs", "Git"], "Mysuru", "onsite", "₹9,50,00,000/year".replace("9,50,00,000", "9,50,000"), "2026-11-10"),
            # 11
            ("internship", "Cybersecurity Analyst Intern", "Zomato",
             "Identify security vulnerabilities, audit application endpoints, and assist with SOC log analyses.",
             ["Network Security", "Linux", "Python", "Cryptography"], "Gurugram", "hybrid", "₹30,000/month", "2026-11-05"),
            # 12
            ("job", "Machine Learning Engineer", "Swiggy",
             "Architect real-time dispatch routing and delivery prediction models using scikit-learn and PyTorch.",
             ["Python", "Machine Learning", "SQL", "Data Structures"], "Bengaluru", "hybrid", "₹16,00,000/year", "2026-12-10"),
            # 13
            ("internship", "UI/UX Design Intern", "Zerodha",
             "Design clean, intuitive trading interfaces and design system tokens in Figma for Zerodha Kite.",
             ["Figma", "Wireframing", "Communication", "Design Systems"], "Bengaluru", "remote", "₹40,000/month", "2026-11-08"),
            # 14
            ("project", "Autonomous Drone Navigation Algorithm", "IIT Delhi",
             "Academic-industry grant project for autonomous drone flight path optimization using edge AI.",
             ["Python", "Deep Learning", "Data Structures"], "New Delhi", "onsite", "₹25,000 Stipend", "2026-11-25"),
            # 15
            ("apprenticeship", "Python Backend Developer Apprentice", "Jio Platforms",
             "Work with the JioCinema streaming platform backend team building REST APIs and caching layers.",
             ["Python", "FastAPI", "SQL", "Git", "Docker"], "Navi Mumbai", "onsite", "₹28,000/month", "2026-11-18"),
            # 16
            ("job", "Full Stack Engineer (MERN)", "Paytm",
             "Build consumer payment and wallet integrations with React, Node.js, and MongoDB.",
             ["React", "JavaScript", "Node.js", "SQL", "Git"], "Noida", "hybrid", "₹12,00,000/year", "2026-12-20"),
            # 17
            ("workshop", "Modern Cloud Security & Zero Trust Architecture", "Google India",
             "Executive masterclass on enterprise network perimeter defense and IAM policies.",
             ["Cloud Computing", "Network Security", "Linux"], "Bengaluru", "remote", "Industry Certification Badge", "2026-10-22"),
            # 18
            ("fdp", "FDP on Modern Web Technologies & Next-Gen Pedagogy", "Anna University Chennai",
             "National FDP bridging academic curriculum with modern industry web engineering paradigms.",
             ["React", "JavaScript", "REST APIs"], "Chennai", "onsite", "Sponsored by UGC", "2026-11-02"),
            # 19
            ("internship", "Data Science & NLP Intern", "InMobi",
             "Extract actionable insights from billions of ad impressions using transformer models and PySpark.",
             ["Python", "Machine Learning", "Statistics", "SQL"], "Bengaluru", "hybrid", "₹40,000/month", "2026-11-12"),
            # 20
            ("job", "Cloud Solutions Architect", "Tata Consultancy Services (TCS)",
             "Deliver cloud migration blueprints for Fortune 500 banking and financial clients.",
             ["Cloud Computing", "Docker", "Kubernetes", "Linux", "Communication"], "Mumbai", "hybrid", "₹15,00,000/year", "2026-12-05"),
            # 21
            ("project", "Smart Agriculture IoT & Soil Quality Analyzer", "BITS Pilani",
             "IoT sensor data collection and ML predictive model for crop yield forecasting.",
             ["Python", "Machine Learning", "Data Visualization"], "Pilani", "hybrid", "₹15,000 Grant", "2026-11-14"),
            # 22
            ("internship", "Product Management & Business Analyst Intern", "CRED",
             "Synthesize product requirements, build SQL telemetry queries, and map feature roadmaps.",
             ["SQL", "Statistics", "Communication", "Problem Solving", "Excel"], "Bengaluru", "onsite", "₹50,000/month", "2026-11-28"),
            # 23
            ("job", "Site Reliability Engineer (SRE)", "PhonePe",
             "Ensure 99.999% uptime of UPI payments infrastructure using Linux, Kubernetes, and Prometheus.",
             ["Linux", "Kubernetes", "Docker", "Python", "Cloud Computing"], "Bengaluru", "hybrid", "₹17,00,000/year", "2026-12-18"),
            # 24
            ("internship", "Software Development Engineer Intern (Java/Backend)", "Amazon India",
             "Build scalable multi-tier distributed storage and catalog services for Amazon Marketplace.",
             ["Java", "Data Structures", "SQL", "Problem Solving"], "Bengaluru", "onsite", "₹80,000/month", "2026-11-30"),
            # 25
            ("job", "Junior Security Operations Center (SOC) Analyst", "Wipro Cybersecuriy",
             "Monitor real-time alerts, investigate suspicious network activity, and manage firewall configurations.",
             ["Network Security", "Linux", "Communication"], "Hyderabad", "onsite", "₹7,50,000/year", "2026-12-01"),
        ]

        opp_records = []
        creator_user = prof_users[0]  # Priya Nair
        for idx, (typ, tit, comp, desc, req_s, loc, mod, pay, dline) in enumerate(opps_data):
            # cycle creators between professionals and academicians
            creator = prof_users[idx % len(prof_users)] if idx % 4 != 0 else academic_users[idx % len(academic_users)]
            opp = Opportunity(
                posted_by=creator.id,
                type=typ,
                title=tit,
                company=comp,
                description=desc,
                required_skills=req_s,
                location=loc,
                mode=mod,
                stipend_or_salary=pay,
                deadline=dline,
                status="open",
                created_at=datetime.utcnow() - timedelta(days=idx)
            )
            db.add(opp)
            opp_records.append(opp)
        db.commit()

        # ==========================================
        # 7. SEED 12 LEARNING PROGRAMS
        # ==========================================
        print("📚 Seeding 12 Learning Programs (NPTEL, Coursera, SWAYAM)...")
        learning_data = [
            ("Mastering Modern Full Stack Development with React & Node", "SWAYAM / IIT Madras",
             ["React", "JavaScript", "Node.js", "SQL", "Git"], "course", "https://swayam.gov.in/fullstack", "8 weeks"),
            ("Data Science & Machine Learning with Python", "NPTEL / IIT Kharagpur",
             ["Python", "Machine Learning", "Statistics", "Data Visualization"], "certification", "https://nptel.ac.in/courses/datascience", "12 weeks"),
            ("Cloud Architect Bootcamp: AWS & Microservices", "AWS Academy / Coursera",
             ["Cloud Computing", "Docker", "Kubernetes", "Linux"], "course", "https://aws.amazon.com/training", "6 weeks"),
            ("Deep Learning & Neural Network Foundations", "DeepLearning.AI",
             ["Deep Learning", "Python", "Machine Learning"], "certification", "https://coursera.org/specializations/deep-learning", "10 weeks"),
            ("Applied SQL & Database Engineering for Data Analysts", "Infosys Springboard",
             ["SQL", "Data Visualization", "Excel"], "course", "https://infyspringboard.onwingspan.com", "4 weeks"),
            ("Cybersecurity Analyst Professional Certificate", "Google Cloud / Coursera",
             ["Network Security", "Linux", "Cryptography", "Python"], "certification", "https://grow.google/certificates/cybersecurity", "16 weeks"),
            ("Algorithms & Data Structures in Java Masterclass", "NPTEL / IIT Delhi",
             ["Data Structures", "Java", "Problem Solving"], "course", "https://nptel.ac.in/courses/dsa-java", "12 weeks"),
            ("Enterprise UI/UX Design & Prototyping Systems", "Interaction Design Foundation",
             ["Figma", "Wireframing", "Design Systems"], "workshop", "https://interaction-design.org", "3 weeks"),
            ("Practical DevOps with Docker, CI/CD & Kubernetes", "Linux Foundation",
             ["Docker", "Kubernetes", "Linux", "Git"], "certification", "https://training.linuxfoundation.org", "8 weeks"),
            ("Business Intelligence & Financial Analytics", "Microsoft Learn",
             ["SQL", "Statistics", "Excel", "Data Visualization"], "course", "https://learn.microsoft.com", "5 weeks"),
            ("Executive Communication & Workplace Collaboration", "IIM Ahmedabad e-Learning",
             ["Communication", "Teamwork", "Problem Solving"], "workshop", "https://iima.ac.in", "2 weeks"),
            ("Production API Engineering with FastAPI & SQLAlchemy", "SkillNexus Industry Lab",
             ["FastAPI", "Python", "REST APIs", "SQL", "Git"], "workshop", "https://skillnexus.gov.in/lab", "4 weeks"),
        ]

        for tit, prov, sk_cov, typ, url, dur in learning_data:
            lp = LearningProgram(
                posted_by=demo_academic.id,
                title=tit,
                provider=prov,
                skills_covered=sk_cov,
                type=typ,
                url=url,
                duration=dur
            )
            db.add(lp)
        db.commit()

        # ==========================================
        # 8. SEED 15 MENTORSHIP SLOTS
        # ==========================================
        print("🤝 Seeding 15 Mentorship Slots...")
        slots_data = [
            (demo_prof.id, "Cracking System Design & Software Architecture Interviews", "Tomorrow at 4:00 PM IST", "open", None, None),
            (demo_prof.id, "Resume Review & Portfolio Building for Product Companies", "Friday at 6:00 PM IST", "booked", student_users[1].id, None),
            (demo_prof.id, "Transitioning from College to High-Scale Tech Engineering", "Saturday at 11:00 AM IST", "completed", student_users[0].id, "Aarav demonstrated stellar grasp of React and REST architecture. Advised him to focus on Docker!"),
            (prof_users[1].id, "Preparing for ML Engineer Roles at Tier-1 Tech", "Next Monday at 5:30 PM IST", "open", None, None),
            (prof_users[1].id, "How to Build End-to-End Deep Learning Projects for Portfolio", "Next Wednesday at 3:00 PM IST", "booked", student_users[2].id, None),
            (prof_users[2].id, "Java Enterprise Best Practices & Clean Architecture", "Thursday at 5:00 PM IST", "open", None, None),
            (prof_users[2].id, "Sprint Planning & Agile Delivery in Real World Projects", "Next Saturday at 10:00 AM IST", "open", None, None),
            (demo_academic.id, "Higher Studies vs Placements: Strategic Guidance", "Tuesday at 2:00 PM IST", "open", None, None),
            (demo_academic.id, "Research Paper Writing & Grant Submissions for Undergrads", "Thursday at 4:00 PM IST", "booked", student_users[3].id, None),
            (academic_users[1].id, "Cloud Security Protocols & Industry Certifications Advice", "Saturday at 12:00 PM IST", "open", None, None),
            (academic_users[1].id, "Navigating Campus Placements with Strong Core CS Foundations", "Next Tuesday at 6:00 PM IST", "open", None, None),
            (prof_users[3].id, "What Recruiters Actually Look for in Freshers' Resumes", "Friday at 7:00 PM IST", "open", None, None),
            (prof_users[3].id, "Mock Behavioral HR Interview & Negotiation Tips", "Next Friday at 4:00 PM IST", "booked", student_users[4].id, None),
            (prof_users[4].id, "Fintech Engineering: What Skills Are Demanded in 2026", "Sunday at 3:00 PM IST", "open", None, None),
            (demo_prof.id, "Open Source Contribution Strategy for GSoC & SIH Winners", "Next Sunday at 5:00 PM IST", "open", None, None),
        ]

        for mentor_id, topic, dt_str, st, b_by, fb in slots_data:
            ms = MentorshipSlot(
                mentor_id=mentor_id,
                topic=topic,
                datetime=dt_str,
                status=st,
                booked_by=b_by,
                feedback=fb
            )
            db.add(ms)
        db.commit()

        # ==========================================
        # 9. SEED APPLICATIONS (For demo student and others)
        # ==========================================
        print("📨 Seeding Applications for placement funnel...")
        app_statuses = [
            ("interview", "Selected for technical round 2 based on strong React knowledge."),
            ("shortlisted", "Resume matched 88% required skills."),
            ("applied", None),
            ("selected", "Offer extended! Exemplary problem-solving demonstrated."),
            ("applied", None),
        ]

        # Applications for demo student Aarav
        for i, (stat, fb) in enumerate(app_statuses):
            app = Application(
                student_id=demo_student.id,
                opportunity_id=opp_records[i].id,
                status=stat,
                applied_at=datetime.utcnow() - timedelta(days=10 - i * 2),
                mentor_feedback=fb
            )
            db.add(app)

        # Applications from other students for various opportunities
        for i in range(1, 10):
            db.add(Application(
                student_id=student_users[i].id,
                opportunity_id=opp_records[0].id,  # Microsoft intern
                status="shortlisted" if i % 2 == 0 else "applied",
                applied_at=datetime.utcnow() - timedelta(days=i),
                mentor_feedback="High match with front-end stack." if i % 2 == 0 else None
            ))
            db.add(Application(
                student_id=student_users[i].id,
                opportunity_id=opp_records[1].id,  # Google ML
                status="interview" if i % 3 == 0 else "applied",
                applied_at=datetime.utcnow() - timedelta(days=i + 1),
                mentor_feedback="Strong mathematical foundations." if i % 3 == 0 else None
            ))
            db.add(Application(
                student_id=student_users[i].id,
                opportunity_id=opp_records[2].id,  # TCS Cloud
                status="selected" if i == 2 else "applied",
                applied_at=datetime.utcnow() - timedelta(days=i + 2),
                mentor_feedback="Selected for cloud training cohort." if i == 2 else None
            ))
        db.commit()

        # ==========================================
        # 10. SEED PORTFOLIO ITEMS FOR DEMO STUDENT
        # ==========================================
        print("🎨 Seeding Portfolio Items...")
        portfolio_data = [
            ("project", "SkillNexus - SIH AI Placement Portal",
             "Full-stack collaboration platform with AI cosine similarity job matching and rule-based skill gap analyzer.",
             "https://github.com/demo/skillnexus", True),
            ("certificate", "AWS Certified Cloud Practitioner",
             "Validated overall understanding of AWS Cloud platform, security, and architectural principles.",
             "https://aws.amazon.com/verification/demo-cert", True),
            ("internship", "Summer Web Development Intern at TechLabs",
             "Developed responsive UI dashboards in React and integrated RESTful endpoints for 10,000+ active users.",
             "https://techlabs.in/interns", True),
            ("achievement", "1st Runner Up - National Smart Hackathon 2025",
             "Built an IoT automated disaster relief alert network under 36 hours.",
             "https://hackathon.gov.in/archive-2025", True),
        ]

        for typ, tit, desc, lnk, ver in portfolio_data:
            db.add(PortfolioItem(
                student_id=demo_student.id,
                type=typ,
                title=tit,
                description=desc,
                link=lnk,
                verified=ver
            ))
        db.commit()

        # ==========================================
        # 11. SEED SKILL EXCHANGE REQUEST
        # ==========================================
        print("🔄 Seeding Skill Exchange Requests...")
        db.add(SkillExchange(
            student_id=demo_student.id,
            professional_id=demo_prof.id,
            offered_skill="React & Modern Frontend UI",
            requested_skill="Distributed System Architecture & Cloud Deployments",
            status="accepted",
            note="Looking forward to peer exchange sessions on Saturday mornings!"
        ))
        db.commit()

        print("\n✅ SEEDING COMPLETE! Successfully populated:")
        print("   - 25 Skills (Technical & Soft)")
        print("   - 3 Core Demo Users (Student, Professional, Academician)")
        print("   - 14 Additional Students (Total 15)")
        print("   - 4 Additional Professionals (Total 5: 3 Mentors, 2 Recruiters)")
        print("   - 1 Additional Academician (Total 2)")
        print("   - 60 Assessment Questions across 15 skills")
        print("   - 25 Opportunities across top Indian & Global companies")
        print("   - 12 Learning Programs (NPTEL, Coursera, SWAYAM)")
        print("   - 15 Mentorship Slots with active booking states")
        print("   - Portfolio & Placement Applications for funnel analytics\n")
        print("🔑 Demo Credentials:")
        print("   Student:      student@demo.com      / demo123")
        print("   Professional: professional@demo.com / demo123")
        print("   Academician:  academic@demo.com     / demo123")

    except Exception as e:
        db.rollback()
        print(f"❌ Error while seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
