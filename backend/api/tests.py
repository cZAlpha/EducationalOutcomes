from django.test import TestCase
import os
import sys
import django
from faker import Faker
import random
from django.db.models import Avg


# NOTE:
# - MySQL database implementation must be done
# - AssignmentTemplates are currently useless, as they do not store the required mappings of questions onto their objectives



# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

# Import models
from api.models import *


# Faker instance for random data generation
faker = Faker()

# Variables to specify the number of users and courses
NUM_USERS = 10  # Change this to the desired number of users
NUM_COURSES = 5  # Change this to the desired number of courses
NUM_SECTIONS = 3 # Change this to the desired number of sections for each course
NUM_QUESTIONS = 10 # Change this to the desired number of questions on the first fake assignment

# Function to populate the database with random users and courses
def populate_database():

   # Add user roles
   print("Creating User Roles...")
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
   print("User Roles Created: ", user_roles_list)
   

   # Add users
   print("Creating users...")
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
   
   
   # Accreditation Organization Creation
   print("Creating Accreditation Organization: ABET...")
   abet_accreditation_organization, created = AccreditationOrganization.objects.get_or_create(
      name = "ABET"
      description = "We are a nonprofit, ISO 9001 certified quality assurance organization focused on college and university programs in the science, technology, engineering and math (STEM) disciplines. Through our work and our partnerships we help ensure that the next generation of STEM professionals is equipped to help build a world that is safer, more efficient, more inclusive and more sustainable."
   )
   print("Created Accreditation Organization: ABET")
   

   # Accreditation Version Creation
   print("Creating Accreditation Version...")
   year = 2024
   abet_2024_accreditation_version, created = AccreditationVersion.objects.get_or_create(
      a_organization=abet_accreditation_organization,
      year=year
   )
   print(f"Created Accreditation Version: {abet_2024_accreditation_version}")
   

   # Program Learning Objectives
   print("Creating Program Learning Objectives...")
   cs_designations = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k']
   cs_descriptions = [
      'Be able to apply knowledge of computing and mathematics appropriate to the discipline',
      'Be able to analyze a problem, and identify and define the computing requirements appropriate to its solution',
      'Be able to design, implement, and evaluate a computer-based system, process, component, or program to meet desired needs',
      'Be able to function effectively on teams to accomplish a common goal',
      'Understand professional, ethical, legal, security, and social issues and responsibilities',
      'Be able to communicate effectively with a range of audiences',
      'Be able to analyze the local and global impact of computing on individuals, organizations, and society',
      'Recognize the need for and an ability to engage in continuing professional development',
      ' Be able to use current techniques, skills, and tools necessary for computing practice'
      'Be able to apply mathematical foundations, algorithmic principles, and computer science theory in the modeling and design of computer‐based systems in a way that demonstrates comprehension of the tradeoffs involved in design choices',
      'Be able to apply design and development principles in the construction of software systems of varying complexity'
   ]

   for _ in range(len(cs_designations)): # iterate over the general learning objectives and add them
      cs_program_learning_objective, created = ProgramLearningObjective.objects.get_or_create(
         a_version = abet_2024_accreditation_version,
         designation = cs_designations[_],
         description = cs_descriptions[_]
      )
      if created:
         print("CS Program Learning Objective: ", cs_designations[_], " was created")
   

   print("Creating IT Specific Learning Objectives...")
   it_designations = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n']
   it_descriptions = [
      'Be able to apply knowledge of computing and mathematics appropriate to the discipline',
      'Be able to analyze a problem, and identify and define the computing requirements appropriate to its solution',
      'Be able to design, implement, and evaluate a computer-based system, process, component, or program to meet desired needs',
      'Be able to function effectively on teams to accomplish a common goal',
      'Understand professional, ethical, legal, security, and social issues and responsibilities',
      'Be able to communicate effectively with a range of audiences',
      'Be able to analyze the local and global impact of computing on individuals, organizations, and society',
      'Recognize the need for and an ability to engage in continuing professional development',
      ' Be able to use current techniques, skills, and tools necessary for computing practice'
      'Be able to use and apply current technical concepts and practices in the core information technologies',
      'Be able to identify and analyze user needs and take them into account in the selection, creation, evaluation and administration of computer‐based systems',
      'Be able to effectively integrate IT‐based solutions into the user environment',
      'Understand best practices and standards and their application',
      'Be able to assist in the creation of an effective project plan'
   ]
   
   for _ in range(len(it_designations)): # iterate over the general learning objectives and add them
      abet_it_program_learning_objective, created = ProgramLearningObjective.objects.get_or_create(
         a_version = abet_2024_accreditation_version,
         designation = it_designations[_],
         description = it_descriptions[_]
      )
      if created:
         print("IT Program Learning Objective: ", it_designations[_], " was created")
   
   
   # Program Creation
   print("Creating Programs: CS, IT")
   cs_program, created = Program.objects.get_or_create(
      designation = "CSCI",
      description = "Computer science majors at Delaware State learn more than how to write code. They also develop career-advancing skills such as communication, critical thinking, and creative problem-solving. Students are encouraged to explore new ideas and technologies, as well as to find new uses for existing computer science technologies. Small class sizes ensure that students can work closely with faculty and tailor their education to their own interests. The senior capstone project enables computer science majors to broaden their horizons and apply their expertise in fields such as business, science, education, social services, or entertainment. Nearly every industry relies on computers, so graduates from this major enjoy a wide range of job opportunities."
   )
   it_program, created = Program.objects.get_or_create(
      designation = "IT",
      description = "The Information Technology (IT) major involves more creativity than you might think. Students prepare for careers as technology design and management professionals, learning to integrate hardware, software, network components, and other technology into information systems. The program offers a balance of theoretical knowledge and practical, hands-on experience. Students develop critical thinking and communication skills, as well as an appreciation for the social implications of computing. They graduate with an ability to devise creative IT solutions that empower scientists, artists, inventors, and organizations."
   )
   programs_list = [cs_program, it_program]
   print(f"Creating Programs: {programs_list}")
   
   # Course Creation
   print("Creating Courses: Computational Thinking I, Computational Thinking II")
   # TODO: EVERYTHING ELSE!
   

# # Function to visualize the database content
# def visualize_database():
#    abetVersions = ABETVersion.objects.all()
#    print("\nABET Versions in database:")
#    for abetVersion in abetVersions:
#       print(abetVersion)
#
#    abetLearningObjectives = ABETLearningObjective.objects.all()
#    print("\nABET Learning Objectives in database:")
#    for abetLearningObjective in abetLearningObjectives:
#       print(abetLearningObjective)
#
#    users = User.objects.all()
#    print("\nUsers in database:")
#    for user in users:
#       print(user)
#
#    semesters = Semester.objects.all()
#    print("\nSemesters in the databse:")
#    for semester in semesters:
#       print(semester)
#
#    courses = Course.objects.all()
#    print("\nCourses in database:")
#    for course in courses:
#       print(course)
#
#    sections = Section.objects.all()
#    print("\nSections in database:")
#    for section in sections:
#       print(section)
#
#    assignmentTemplates = AssignmentTemplate.objects.all()
#    print("\nAssignment Templates in database:")
#    for assignmentTemplate in assignmentTemplates:
#       print(assignmentTemplate)
#
#    assignments = Assignment.objects.all()
#    print("\nAssignments in database:")
#    for assignment in assignments:
#       print(assignment)
#
#    questions = AssignmentQuestion.objects.all()
#    print("\nQuestions in database:")
#    for question in questions:
#       print(question)
#
#    questionMappings = AssignmentQuestionMapping.objects.all()
#    print("\nQuestion Mappings in database:")
#    for questionMapping in questionMappings:
#       print(questionMapping)
#
#
# def calculate_average_grades():
#    learning_objectives = ABETLearningObjective.objects.all()
#
#    print("Average Grades for Each Learning Objective:")
#    for objective in learning_objectives:
#       # Get all questions mapped to this learning objective
#       mapped_questions = AssignmentQuestionMapping.objects.filter(learning_objective=objective)
#
#       # Calculate the average grade for these questions
#       average_grade = AssignmentQuestion.objects.filter(
#          id__in=mapped_questions.values_list('question', flat=True)
#       ).aggregate(Avg('average_grade'))['average_grade__avg']
#
#       # Print the result
#       print(f"{objective}: {average_grade if average_grade is not None else 'No Questions Mapped'}")
#
# # Function to wipe the database
# def wipe_database():
#    print("\nWiping database...")
#    User.objects.all().delete()
#    Course.objects.all().delete()
#    Section.objects.all().delete()
#    Semester.objects.all().delete()
#    ABETVersion.objects.all().delete()
#    ABETLearningObjective.objects.all().delete()
#    AssignmentTemplate.objects.all().delete()
#    Assignment.objects.all().delete()
#    AssignmentQuestion.objects.all().delete()
#    AssignmentQuestionMapping.objects.all().delete()
#    print("Database wiped successfully!")
#
# # Main execution
# if __name__ == "__main__":
#    print("Populating database...")
#    populate_database(NUM_USERS, NUM_COURSES, NUM_SECTIONS)
#
#    print("\nVisualizing database before wiping...")
#    visualize_database()
#
#    # Calculate the average grade for each learning objective and print it before wiping
#    calculate_average_grades()
#
#    wipe_database()