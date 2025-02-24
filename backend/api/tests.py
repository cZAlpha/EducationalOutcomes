import os
import sys
import django


# NOTE:
# - MySQL database implementation must be done


# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

# Import models
from api.models import *

# Import apps
from django.apps import apps


def populate_database(): # Function to populate the database with random users and courses
   print("[+] Populating Database...")
   
   # Add user roles
   print("[+] Creating User Roles")
   root_user_role, created = UserRole.objects.get_or_create(
      role_name = 'root',
      role_description = "Root users have access to everything. They are super users.",
      permissions = {"permission" : "root"}
   )
   admin_user_role, created = UserRole.objects.get_or_create(
      role_name = 'Admin',
      role_description = "Admin users have access to everything. They are super users.",
      permissions = {"permission" : "Admin"}
   ) 
   user_user_role, created = UserRole.objects.get_or_create(
      role_name = 'User',
      role_description = "Normal users have access to only the bare necessities required for their usage of this application.",
      permissions = {"permission" : "User"}
   )
   user_roles_list = [root_user_role, admin_user_role, user_user_role] # List to contain all user roles
   print("[+] User Roles Created: ", user_roles_list)
   
   
   # Add users
   print("[+] Creating Users...")
   dr_smolinski, created = User.objects.get_or_create(
      d_number="D10795834",
      role=root_user_role,
      email="drsmolinski@desu.edu",
      first_name="First Name",
      last_name="Smolinski",
      employee_id="D10795834"
   )
   dr_rasamny, created = User.objects.get_or_create(
      d_number="D10000000",
      role=root_user_role,
      email="drrasamny@desu.edu",
      first_name="Marwan",
      last_name="Rasamny",
      employee_id="D10000000"
   )
   noah_klaus, created = User.objects.get_or_create(
      d_number="D10686712",
      role=user_user_role,
      email="nbklaus21@students.desu.edu",
      first_name="Noah",
      last_name="Klaus",
      employee_id="" # No employee ID for Noah, as he is a student
   )
   users_list = [dr_smolinski, dr_rasamny, noah_klaus]
   print(f"[+] Created Users: {users_list}")
   
   
   # Accreditation Organization Creation
   print("[+] Creating Accreditation Organizations...")
   abet_accreditation_organization, created = AccreditationOrganization.objects.get_or_create(
      name = "ABET",
      description = "We are a nonprofit, ISO 9001 certified quality assurance organization focused on college and university programs in the science, technology, engineering and math (STEM) disciplines. Through our work and our partnerships we help ensure that the next generation of STEM professionals is equipped to help build a world that is safer, more efficient, more inclusive and more sustainable."
   )
   accreditation_organizations_list = [abet_accreditation_organization]
   print(f"[+] Created Accreditation Organizations: {accreditation_organizations_list}")
   
   
   # Accreditation Version Creation
   print("[+] Creating Accreditation Versions...")
   year = 2024
   abet_2024_accreditation_version, created = AccreditationVersion.objects.get_or_create(
      a_organization=abet_accreditation_organization,
      year=year
   )
   accreditation_versions_list = [abet_2024_accreditation_version]
   print(f"[+] Created Accreditation Versions: {accreditation_versions_list}")
   
   
   # Program Learning Objectives
   print("[+] Creating PLOs...")
   print("   [+] Creating CS PLOs...")
   plo_a_cs, created = ProgramLearningObjective.objects.get_or_create(
      a_version=abet_2024_accreditation_version,
      designation='a',
      description='Be able to apply knowledge of computing and mathematics appropriate to the discipline'
   )
   plo_b_cs, created = ProgramLearningObjective.objects.get_or_create(
      a_version=abet_2024_accreditation_version,
      designation='b',
      description='Be able to analyze a problem, and identify and define the computing requirements appropriate to its solution'
   )
   plo_c_cs, created = ProgramLearningObjective.objects.get_or_create(
      a_version=abet_2024_accreditation_version,
      designation='c',
      description='Be able to design, implement, and evaluate a computer-based system, process, component, or program to meet desired needs'
   )
   plo_d_cs, created = ProgramLearningObjective.objects.get_or_create(
      a_version=abet_2024_accreditation_version,
      designation='d',
      description='Be able to function effectively on teams to accomplish a common goal'
   )
   plo_e_cs, created = ProgramLearningObjective.objects.get_or_create(
      a_version=abet_2024_accreditation_version,
      designation='e',
      description='Understand professional, ethical, legal, security, and social issues and responsibilities'
   )
   plo_f_cs, created = ProgramLearningObjective.objects.get_or_create(
      a_version=abet_2024_accreditation_version,
      designation='f',
      description='Be able to communicate effectively with a range of audiences'
   )
   plo_g_cs, created = ProgramLearningObjective.objects.get_or_create(
      a_version=abet_2024_accreditation_version,
      designation='g',
      description='Be able to analyze the local and global impact of computing on individuals, organizations, and society'
   )
   plo_h_cs, created = ProgramLearningObjective.objects.get_or_create(
      a_version=abet_2024_accreditation_version,
      designation='h',
      description='Recognize the need for and an ability to engage in continuing professional development'
   )
   plo_i_cs, created = ProgramLearningObjective.objects.get_or_create(
      a_version=abet_2024_accreditation_version,
      designation='i',
      description='Be able to use current techniques, skills, and tools necessary for computing practice'
   )
   plo_j_cs, created = ProgramLearningObjective.objects.get_or_create(
      a_version=abet_2024_accreditation_version,
      designation='j',
      description='Be able to apply mathematical foundations, algorithmic principles, and computer science theory in the modeling and design of computer‐based systems in a way that demonstrates comprehension of the tradeoffs involved in design choices'
   )
   plo_k_cs, created = ProgramLearningObjective.objects.get_or_create(
      a_version=abet_2024_accreditation_version,
      designation='k',
      description='Be able to apply design and development principles in the construction of software systems of varying complexity'
   )
   cs_plo_list = [plo_a_cs, plo_b_cs, plo_c_cs, plo_d_cs, plo_e_cs, plo_f_cs, plo_g_cs, plo_h_cs, plo_i_cs, plo_j_cs, plo_k_cs]
   print(f"   [+] Created CS PLOs: {cs_plo_list}")
   
   #print("   [+] Creating IT Specific PLOs...")
   # TODO: Instantiate IT PLOs with NON-CONFLICTING DESIGNATIONS!!!
   # it_plo_list = [] 
   #print(f"   [+] Created IT PLOs: {it_plo_list}")
   print("[+] Created PLOs")
   
   
   # Program Creation
   print("[+] Creating Programs...")
   cs_program, created = Program.objects.get_or_create(
      designation = "CSCI",
      description = "Computer science majors at Delaware State learn more than how to write code. They also develop career-advancing skills such as communication, critical thinking, and creative problem-solving. Students are encouraged to explore new ideas and technologies, as well as to find new uses for existing computer science technologies. Small class sizes ensure that students can work closely with faculty and tailor their education to their own interests. The senior capstone project enables computer science majors to broaden their horizons and apply their expertise in fields such as business, science, education, social services, or entertainment. Nearly every industry relies on computers, so graduates from this major enjoy a wide range of job opportunities."
   )
   it_program, created = Program.objects.get_or_create(
      designation = "IT",
      description = "The Information Technology (IT) major involves more creativity than you might think. Students prepare for careers as technology design and management professionals, learning to integrate hardware, software, network components, and other technology into information systems. The program offers a balance of theoretical knowledge and practical, hands-on experience. Students develop critical thinking and communication skills, as well as an appreciation for the social implications of computing. They graduate with an ability to devise creative IT solutions that empower scientists, artists, inventors, and organizations."
   )
   programs_list = [cs_program, it_program]
   print(f"[+] Created Programs: {programs_list}")
   
   
   # Course Creation
   print("[+] Creating Courses...")
   # comp_think_i, created = Course.objects.get_or_create( NOTE: This was commented out due to me not having info for this course
   #    a_version = abet_2024_accreditation_version,
   #    course_number = 110,
   #    name = "Computational Thinking I",
   #    description = "Description for Comp. Think. I",
   #    # No date_removed
   # )
   comp_think_ii, created = Course.objects.get_or_create(
      a_version = abet_2024_accreditation_version,
      course_number = 111,
      name = "Computational Thinking II",
      description = "This course, like its first installment, exposes students to abstract and algorithmic thinking through hands-on exercises and projects focused on computer science problem-solving techniques. Students will be required to formulate problems and solutions and present these solutions in a form that is implementable on a computing device. Through this approach, students will be introduced, at an elementary level, to mathematical, computational, and engineering problem-solving techniques. Students will be exposed to UML and other diagramming tools, problem modeling, pseudo code, translation of pseudo code into an implementation language, and incremental development and testing. In addition, students may also apply computational thinking techniques to databases, mobile computing, and intelligent systems.",
      # No date_removed
   )
   course_list = [comp_think_ii]
   print(f"[+] Created Courses: {course_list}")
   
   
   # Program-Course Mappings Creation
   print("[+] Creating Program-Course Mappings...")
   # program_course_mapping_0, created = ProgramCourseMapping.objects.get_or_create( NOTE: SEE RELATED COURSE ABOVE
   #    program = cs_program,
   #    course = comp_think_i
   # )
   program_course_mapping_1, created = ProgramCourseMapping.objects.get_or_create(
      program = cs_program,
      course = comp_think_ii
   )
   program_course_mapping_list = [program_course_mapping_1]
   print("[+] Created Program-Course Mappings: ", program_course_mapping_list)
   
   # Semester Creation
   print("[+] Creating Semesters...")
   spring_2024_semester, created = Semester.objects.get_or_create(
      designation = 20243 # NOTE: THIS IS NOT CORRECT, IS PLACEHOLDER
   )
   fall_2024_semester, created = Semester.objects.get_or_create(
      designation = 20251 # NOTE: THIS IS NOT CORRECT, IS PLACEHOLDER
   )
   semester_list = [spring_2024_semester, fall_2024_semester]
   print("[+] Created Semesters: ", semester_list)
   
   
   # Section Creation
   print("[+] Creating Sections...")
   comp_think_ii_section_01, created = Section.objects.get_or_create(
      course = comp_think_ii,
      semester = spring_2024_semester,
      crn = "34324",
      instructor = dr_smolinski,
   )
   comp_think_ii_section_02, created = Section.objects.get_or_create(
      course = comp_think_ii,
      semester = spring_2024_semester,
      crn = "34683",
      instructor = dr_smolinski,
   )
   sections_list = [comp_think_ii_section_01, comp_think_ii_section_02]
   print(f"[+] Created Sections: {sections_list}")
   
   
   # Evaluation Types Creation
   print("[+] Creating Evaluation Types...")
   exam_evaluation_type, created = EvaluationType.objects.get_or_create(
      type_name = "Exam",
      description = "An exam can contain one or more tasks, a general type of evaluation."
   )
   presentation_evaluation_type, created = EvaluationType.objects.get_or_create(
      type_name = "Presentation",
      description = "A project/assignment whose grade(s) are based solely on a presentation and typically uses a rubric for grading."
   )
   project_evaulation_type, created = EvaluationType.objects.get_or_create(
      type_name = "Project",
      description = "A project, uses a rubric."
   )
   report_evaulation_type, created = EvaluationType.objects.get_or_create(
      type_name = "Report",
      description = "A report, uses a rubric."
   )
   evaluation_types_list = [exam_evaluation_type, presentation_evaluation_type, project_evaulation_type, report_evaulation_type]
   print(f"[+] Created Evaluation Types: {evaluation_types_list}")
   
   
   # Evaluation Instrument Creation
   print("[+] Creating Evaluation Instruments...")
   # Exam 0 for Computational Thinking II Section 01
   exam0_comp_think_ii_01, created = EvaluationInstrument.objects.get_or_create(
      section = comp_think_ii_section_01,
      evaluation_type = exam_evaluation_type,
      name = "Exam 0",
      description = "The first exam for Comp. Think. II, Section 01",
   )
   # Assignment 1 for Computational Thinking II Section 01
   exam1_comp_think_ii_01, created = EvaluationInstrument.objects.get_or_create(
      section = comp_think_ii_section_01,
      evaluation_type = exam_evaluation_type,
      name = "Exam 1",
      description = "The second exam for Comp. Think. II, Section 01",
   )
   evaluation_instruments_list = [exam0_comp_think_ii_01, exam1_comp_think_ii_01]
   print(f"[+] Created Assignments: {evaluation_instruments_list}")
   
   
   # Embedded Task Creation
   print("[+] Creating Embedded Tasks...")
   # Task 0 for Assignment 0 of Comp. Think. II Section 01
   task0_assignment0_comp_think_ii_01, created = EmbeddedTask.objects.get_or_create(
      evaluation_instrument = exam0_comp_think_ii_01,
      task_number = 0,
      task_text = "What is 2+2?",
   )
   # Task 1 for Assignment 0 of Comp. Think. II Section 01
   task1_assignment0_comp_think_ii_01, created = EmbeddedTask.objects.get_or_create(
      evaluation_instrument = exam0_comp_think_ii_01,
      task_number = 1,
      task_text = "What is Freud's First Name?",
   )
   # Task 2 for Assignment 0 of Comp. Think. II Section 01
   task2_assignment0_comp_think_ii_01, created = EmbeddedTask.objects.get_or_create(
      evaluation_instrument = exam0_comp_think_ii_01,
      task_number = 2,
      task_text = "What is 1+(7*3)?",
   )
   embedded_tasks_list = [task0_assignment0_comp_think_ii_01, task1_assignment0_comp_think_ii_01, task2_assignment0_comp_think_ii_01]
   print(f"[+] Created Embedded Tasks: {embedded_tasks_list}")
   
   
   # Course Learning Objective Creation
   print("[+] Creating CLOs...")
   clo_1_comp_think_ii, created = CourseLearningObjective.objects.get_or_create(
      course = comp_think_ii,
      designation = "1",
      description = "Formulate problems in a way that allows for computationally amenable solutions.",
      created_by = dr_smolinski,
   )
   clo_2_comp_think_ii, created = CourseLearningObjective.objects.get_or_create(
      course = comp_think_ii,
      designation = "2",
      description = "Use abstraction, decomposition, and recursion as a tool to attack large tasks or design large systems.",
      created_by = dr_smolinski,
   )
   clo_3_comp_think_ii, created = CourseLearningObjective.objects.get_or_create(
      course = comp_think_ii,
      designation = "3",
      description = "Create a model as a prototype of a solution to a computational problem.",
      created_by = dr_smolinski,
   )
   clo_4_comp_think_ii, created = CourseLearningObjective.objects.get_or_create(
      course = comp_think_ii,
      designation = "4",
      description = "Convert a model of a problem to pseudo-code, and subsequently translate the pseudo-code to an implementation on a computing device.",
      created_by = dr_smolinski,
   )
   clo_5_comp_think_ii, created = CourseLearningObjective.objects.get_or_create(
      course = comp_think_ii,
      designation = "5",
      description = "Work within a group to design a solution to a challenge and communicate the solution effectively in both oral and written form.",
      created_by = dr_smolinski,
   )
   clo_list = [clo_1_comp_think_ii, clo_2_comp_think_ii, clo_3_comp_think_ii, clo_4_comp_think_ii, clo_5_comp_think_ii]
   print(f"[+] Created Course Learning Objectives: {clo_list}")
   
   
   # Task-CLO Mapping Creation
   print("[+] Creating Task-CLO Mappings...")
   # FOR COMP. THINK. II
   # TASK 0
   task_clo_mapping_0_comp_think_ii, created = TaskCLOMapping.objects.get_or_create(
      task = task0_assignment0_comp_think_ii_01,
      clo = clo_1_comp_think_ii
   )
   # TASK 1
   task_clo_mapping_1_comp_think_ii, created = TaskCLOMapping.objects.get_or_create(
      task = task1_assignment0_comp_think_ii_01,
      clo = clo_1_comp_think_ii
   )
   task_clo_mapping_1_comp_think_ii, created = TaskCLOMapping.objects.get_or_create(
      task = task1_assignment0_comp_think_ii_01,
      clo = clo_2_comp_think_ii
   )
   # TASK 2
   task_clo_mapping_1_comp_think_ii, created = TaskCLOMapping.objects.get_or_create(
      task = task2_assignment0_comp_think_ii_01,
      clo = clo_3_comp_think_ii
   )
   task_clo_mapping_1_comp_think_ii, created = TaskCLOMapping.objects.get_or_create(
      task = task2_assignment0_comp_think_ii_01,
      clo = clo_4_comp_think_ii
   )
   task_clo_mapping_1_comp_think_ii, created = TaskCLOMapping.objects.get_or_create(
      task = task2_assignment0_comp_think_ii_01,
      clo = clo_5_comp_think_ii
   )
   task_clo_mappings_list = [task_clo_mapping_0_comp_think_ii, task_clo_mapping_1_comp_think_ii, task_clo_mapping_1_comp_think_ii]
   print(f"[+] Task-CLO Mappings: {task_clo_mappings_list}")
   
   
   # PLO-CLO Mapping Creation
   print("[+] Creating PLO-CLO Mappings...")
   # FOR COMP. THINK. II CLO 1
   plo_clo_mapping_0_comp_think_ii, created = PLOCLOMapping.objects.get_or_create(
      plo = plo_a_cs, # CS a
      clo = clo_1_comp_think_ii # Comp Think II CLO 1
   )
   plo_clo_mapping_1_comp_think_ii, created = PLOCLOMapping.objects.get_or_create(
      plo = plo_b_cs, # CS b
      clo = clo_1_comp_think_ii # Comp Think II CLO 1
   )
   plo_clo_mapping_2_comp_think_ii, created = PLOCLOMapping.objects.get_or_create(
      plo = plo_c_cs, # CS c
      clo = clo_1_comp_think_ii # Comp Think II CLO 1
   )
   # FOR COMP. THINK. II CLO 2
   plo_clo_mapping_3_comp_think_ii, created = PLOCLOMapping.objects.get_or_create(
      plo = plo_a_cs, # CS a
      clo = clo_2_comp_think_ii # Comp Think II CLO 2
   )
   plo_clo_mapping_4_comp_think_ii, created = PLOCLOMapping.objects.get_or_create(
      plo = plo_b_cs, # CS b
      clo = clo_2_comp_think_ii # Comp Think II CLO 2
   )
   # FOR COMP. THINK. II CLO 3
   plo_clo_mapping_5_comp_think_ii, created = PLOCLOMapping.objects.get_or_create(
      plo = plo_b_cs, # CS b
      clo = clo_3_comp_think_ii # Comp Think II CLO 3
   )
   plo_clo_mapping_6_comp_think_ii, created = PLOCLOMapping.objects.get_or_create(
      plo = plo_c_cs, # CS c
      clo = clo_3_comp_think_ii # Comp Think II CLO 3
   )
   plo_clo_mapping_7_comp_think_ii, created = PLOCLOMapping.objects.get_or_create(
      plo = plo_i_cs, # CS i
      clo = clo_3_comp_think_ii # Comp Think II CLO 3
   )
   # FOR COMP. THINK. II CLO 4
   plo_clo_mapping_8_comp_think_ii, created = PLOCLOMapping.objects.get_or_create(
      plo = plo_b_cs, # CS b
      clo = clo_4_comp_think_ii # Comp Think II CLO 4
   )
   plo_clo_mapping_9_comp_think_ii, created = PLOCLOMapping.objects.get_or_create(
      plo = plo_c_cs, # CS c
      clo = clo_4_comp_think_ii # Comp Think II CLO 4
   )
   plo_clo_mapping_10_comp_think_ii, created = PLOCLOMapping.objects.get_or_create(
      plo = plo_i_cs, # CS i
      clo = clo_4_comp_think_ii # Comp Think II CLO 4
   )
   # FOR COMP. THINK. II CLO 5
   plo_clo_mapping_11_comp_think_ii, created = PLOCLOMapping.objects.get_or_create(
      plo = plo_d_cs, # CS d
      clo = clo_5_comp_think_ii # Comp Think II CLO 5
   )
   plo_clo_mapping_12_comp_think_ii, created = PLOCLOMapping.objects.get_or_create(
      plo = plo_f_cs, # CS f
      clo = clo_5_comp_think_ii # Comp Think II CLO 5
   )
   plo_clo_mapping_13_comp_think_ii, created = PLOCLOMapping.objects.get_or_create(
      plo = plo_h_cs, # CS h
      clo = clo_5_comp_think_ii # Comp Think II CLO 5
   )
   plo_clo_mappings_list = [plo_clo_mapping_0_comp_think_ii, plo_clo_mapping_1_comp_think_ii, plo_clo_mapping_2_comp_think_ii, plo_clo_mapping_3_comp_think_ii, plo_clo_mapping_4_comp_think_ii, plo_clo_mapping_5_comp_think_ii, plo_clo_mapping_6_comp_think_ii, plo_clo_mapping_7_comp_think_ii, plo_clo_mapping_8_comp_think_ii, plo_clo_mapping_9_comp_think_ii, plo_clo_mapping_10_comp_think_ii, plo_clo_mapping_11_comp_think_ii, plo_clo_mapping_12_comp_think_ii, plo_clo_mapping_13_comp_think_ii]
   print(f"[+] Created PLO-CLO Mappings: {plo_clo_mapping_0_comp_think_ii}")
   
   
   # Student Creation
   print("[+] Creating Students...")
   student_noah_klaus, created = Student.objects.get_or_create(
      d_number = "D10686712",
      first_name = "Noah",
      last_name = "Klaus"
   )
   student_ceasar_pereira, created = Student.objects.get_or_create(
      d_number = "D10738409",
      first_name = "Ceasar",
      last_name = "Pereira"
   )
   students_list = [student_noah_klaus, student_ceasar_pereira]
   print(f"[+] Created Students: {students_list}")
   
   
   # Student-Task Mapping Creation
   print("[+] Creating Student-Task Mappings...")
   # FOR NOAH KLAUS
   student_task_mapping_0, created = StudentTaskMapping.objects.get_or_create( # Noah Klaus <-> Task 0
      student = student_noah_klaus,
      task = task0_assignment0_comp_think_ii_01,
      score = 80.0,
      total_possible_score = 100.0
   )
   student_task_mapping_1, created = StudentTaskMapping.objects.get_or_create( # Noah Klaus <-> Task 1
      student = student_noah_klaus,
      task = task1_assignment0_comp_think_ii_01,
      score = 85.0,
      total_possible_score = 100.0
   )
   student_task_mapping_2, created = StudentTaskMapping.objects.get_or_create( # Noah Klaus <-> Task 2
      student = student_noah_klaus,
      task = task2_assignment0_comp_think_ii_01,
      score = 90.0,
      total_possible_score = 100.0
   ) 
   # FOR CEASAR PEREIRA
   student_task_mapping_3, created = StudentTaskMapping.objects.get_or_create( # Ceasar Pereira <-> Task 0
      student = student_ceasar_pereira ,
      task = task0_assignment0_comp_think_ii_01,
      score = 92.0,
      total_possible_score = 100.0
   )
   student_task_mapping_4, created = StudentTaskMapping.objects.get_or_create( # Ceasar Pereira <-> Task 1
      student = student_ceasar_pereira,
      task = task1_assignment0_comp_think_ii_01,
      score = 94.5,
      total_possible_score = 100.0
   )
   student_task_mapping_5, created = StudentTaskMapping.objects.get_or_create( # Ceasar Pereira <-> Task 2
      student = student_ceasar_pereira,
      task = task2_assignment0_comp_think_ii_01,
      score = 98.0,
      total_possible_score = 100.0
   ) 
   student_task_mappings_list = [student_task_mapping_0, student_task_mapping_1, student_task_mapping_2, student_task_mapping_3, student_task_mapping_4, student_task_mapping_5]
   print(f"[+] Created Student-Task Mappings: {student_task_mappings_list}")
   
   print("[+] Database has been populated.")


def visualize_database(): # Function to visualize the database content
   print("\n[+] Visualizing database before wiping...")
   
   # Define the models to query
   models = [
      UserRole, User, Log, AccreditationOrganization, AccreditationVersion,
      ProgramLearningObjective, Program, Course, ProgramCourseMapping, Semester,
      Section, EvaluationType, EvaluationInstrument, EmbeddedTask, CourseLearningObjective,
      TaskCLOMapping, PLOCLOMapping, Student, StudentTaskMapping
   ]
   
   # Loop through each model and print its objects
   for model in models:
      objects = model.objects.all()
      print(f"\n{model.__name__} objects in database:")
      for obj in objects:
         print(obj)
      print("")
   
   print("\n[+] Visualization has concluded.", end="\n\n")


def calculate_average_grades():
   # learning_objectives = ABETLearningObjective.objects.all()
   
   # print("Average Grades for Each Learning Objective:")
   # for objective in learning_objectives:
   #    # Get all questions mapped to this learning objective
   #    mapped_questions = AssignmentQuestionMapping.objects.filter(learning_objective=objective)
   
   #    # Calculate the average grade for these questions
   #    average_grade = AssignmentQuestion.objects.filter(
   #       id__in=mapped_questions.values_list('question', flat=True)
   #    ).aggregate(Avg('average_grade'))['average_grade__avg']
   
   #    # Print the result
   #    print(f"{objective}: {average_grade if average_grade is not None else 'No Questions Mapped'}")
   pass


def wipe_database(): # Function to wipe the database
   print("\n[~] Wiping database...")
   # Get all models in the api app
   api_models = apps.get_app_config('api').get_models()
   # Iterate over each model and delete all its objects
   for model in api_models:
      model.objects.all().delete()
   print("[~] Database wiped!", end="\n\n")


if __name__ == "__main__": # Main execution
   wipe_database()
   
   populate_database()
   
   visualize_database()
   
   # calculate_average_grades() # TODO: Calculate the average grade for each learning objective and print it before wiping
   
   wipe_database()