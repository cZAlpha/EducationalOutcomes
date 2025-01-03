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
from api.models import Course, User, ABETLearningObjective, ABETVersion, Section, Semester, AssignmentTemplate, Assignment, AssignmentQuestion, AssignmentQuestionMapping


# Faker instance for random data generation
faker = Faker()

# Variables to specify the number of users and courses
NUM_USERS = 10  # Change this to the desired number of users
NUM_COURSES = 5  # Change this to the desired number of courses
NUM_SECTIONS = 3 # Change this to the desired number of sections for each course
NUM_QUESTIONS = 10 # Change this to the desired number of questions on the first fake assignment

# Function to populate the database with random users and courses
def populate_database(num_users, num_courses, num_sections):

   # ABET Version Creation
   print("Creating ABET Version...")
   year = 2024
   abetVersion, created = ABETVersion.objects.get_or_create(
      year=year
   )

   # ABET Learning Objectives (to be mapped onto ABET Version)
   print("Creating General ABET Learning Objectives...")
   generalDesignations = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']
   generalDescriptions = [
      'Be able to apply knowledge of computing and mathematics appropriate to the discipline',
      'Be able to analyze a problem, and identify and define the computing requirements appropriate to its solution',
      'Be able to design, implement, and evaluate a computer-based system, process, component, or program to meet desired needs',
      'Be able to function effectively on teams to accomplish a common goal',
      'Understand professional, ethical, legal, security, and social issues and responsibilities',
      'Be able to communicate effectively with a range of audiences',
      'Be able to analyze the local and global impact of computing on individuals, organizations, and society',
      'Recognize the need for and an ability to engage in continuing professional development',
      ' Be able to use current techniques, skills, and tools necessary for computing practice'
   ]

   for _ in range(len(generalDesignations)): # iterate over the general learning objectives and add them
      abetLearningObjective, created = ABETLearningObjective.objects.get_or_create(
         abet_version = abetVersion,
         designation = generalDesignations[_],
         description = generalDescriptions[_]
      )
      if created:
         print("ABET Learning Objective: ", generalDesignations[_], " was created")
   
   print("Creating Computer Science Specific Learning Objectives...")
   computerScienceDesignations = ['CS-j', 'CS-k']
   computerScienceDescriptions = [
      'Be able to apply mathematical foundations, algorithmic principles, and computer science theory in the modeling and design of computer‐based systems in a way that demonstrates comprehension of the tradeoffs involved in design choices',
      'Be able to apply design and development principles in the construction of software systems of varying complexity'
   ]
   
   for _ in range(len(computerScienceDesignations)): # iterate over the general learning objectives and add them
      abetCSLearningObjective, created = ABETLearningObjective.objects.get_or_create(
         abet_version = abetVersion,
         designation = computerScienceDesignations[_],
         description = computerScienceDescriptions[_]
      )
      if created:
         print("ABET CS Learning Objective: ", computerScienceDesignations[_], " was created")
   
   print("Creating IT Specific Learning Objectives...")
   ITDesignations = ['IT-j', 'IT-k', 'IT-l', 'IT-m', 'IT-n']
   ITDescriptions = [
      'Be able to use and apply current technical concepts and practices in the core information technologies',
      'Be able to identify and analyze user needs and take them into account in the selection, creation, evaluation and administration of computer‐based systems',
      'Be able to effectively integrate IT‐based solutions into the user environment',
      'Understand best practices and standards and their application',
      'Be able to assist in the creation of an effective project plan'
   ]
   
   for _ in range(len(ITDesignations)): # iterate over the general learning objectives and add them
      abetITLearningObjective, created = ABETLearningObjective.objects.get_or_create(
         abet_version = abetVersion,
         designation = ITDesignations[_],
         description = ITDescriptions[_]
      )
      if created:
         print("ABET CS Learning Objective: ", ITDesignations[_], " was created")
   
   
   # Add random users
   print(f"Creating {num_users} users and {num_courses} courses...\n")
   for _ in range(num_users):
      # Ensure unique usernames and emails
      username = faker.user_name()
      email = faker.email()
      
      user, created = User.objects.get_or_create(
         username=username,
         email=email,
         first_name=faker.first_name(),
         last_name=faker.last_name(),
      )
      if created:
         print("User created:", user)

   # Manually add in the semesters
   semesterNames = ["Fall", "Winter", "Spring", "Summer"]
   for _ in semesterNames:
      semester, created = Semester.objects.get_or_create(
         name = _
      )
      if created:
         print("Semester: ", semester, " was created")
   
   # Add random courses
   for _ in range(num_courses):
      course, created = Course.objects.get_or_create(
         crn_id=f"CSCI{random.randint(100, 999)}",
         name=faker.text(max_nb_chars=20),
         description=faker.text(max_nb_chars=100)
      )
      if created:
         print("Course created:", course)
         
         # Add random sections
         for _ in range(num_sections):
            section, created = Section.objects.get_or_create(
               course = course,
               abet_version = abetVersion,
               semester = Semester.objects.first(),
               instructor = User.objects.first(),
               year = "2024"
            )
            if created:
               print(section, " was created")
   
   
   # Add a base assignment template (templates are currently useless as they do not hold the mappings of the q's onto the objectives)
   assignmentTemplate, created = AssignmentTemplate.objects.get_or_create(
      instructor = User.objects.first(),
      name = "Base Template",
      description = "Base Template Placeholder Description",
      # Don't include date_created bc its auto-handled by Django
   )
   if created:
      print(assignmentTemplate, " has been created")
   
   # Add a base assignment for testing
   assignment, created = Assignment.objects.get_or_create(
      section = Section.objects.first(),
      template = assignmentTemplate,
      name = "First Assignment",
      description = "First Assignment Placeholder Description",
      csv_filepath = "/",
      # Don't include date_created bc its auto-handled by Django
   )
   if created:
      print(assignment, " has been created")

   # Add random questions to the first assignment
   questionsList = []
   for _ in range(NUM_QUESTIONS):
      assignmentQuestion, created = AssignmentQuestion.objects.get_or_create(
         assignment = assignment,
         question_number = _,
         text = faker.text(max_nb_chars=100),
         average_grade = random.uniform(0.0, 100.0),
      )
      if created:
         questionsList.append(assignmentQuestion) # Add the instance to the list for use in mapping
         print("Question: ", assignmentQuestion, " was created")
   
   # Map the aforementioned assignment questions onto their respective learning objectives
   for questionInstance in questionsList:
      learning_objective = random.choice(list(ABETLearningObjective.objects.all()))
      assignmentQuestionMapping, created = AssignmentQuestionMapping.objects.get_or_create(
         question=questionInstance,
         learning_objective=learning_objective
      )
      if created:
            print("Question Mapping: ", assignmentQuestionMapping, " was created")



# Function to visualize the database content
def visualize_database():
   abetVersions = ABETVersion.objects.all()
   print("\nABET Versions in database:")
   for abetVersion in abetVersions:
      print(abetVersion)
   
   abetLearningObjectives = ABETLearningObjective.objects.all()
   print("\nABET Learning Objectives in database:")
   for abetLearningObjective in abetLearningObjectives:
      print(abetLearningObjective)

   users = User.objects.all()
   print("\nUsers in database:")
   for user in users:
      print(user)

   semesters = Semester.objects.all()
   print("\nSemesters in the databse:")
   for semester in semesters:
      print(semester)

   courses = Course.objects.all()
   print("\nCourses in database:")
   for course in courses:
      print(course)

   sections = Section.objects.all()
   print("\nSections in database:")
   for section in sections:
      print(section)

   assignmentTemplates = AssignmentTemplate.objects.all()
   print("\nAssignment Templates in database:")
   for assignmentTemplate in assignmentTemplates:
      print(assignmentTemplate)

   assignments = Assignment.objects.all()
   print("\nAssignments in database:")
   for assignment in assignments:
      print(assignment)
   
   questions = AssignmentQuestion.objects.all()
   print("\nQuestions in database:")
   for question in questions:
      print(question)

   questionMappings = AssignmentQuestionMapping.objects.all()
   print("\nQuestion Mappings in database:")
   for questionMapping in questionMappings:
      print(questionMapping)


def calculate_average_grades():
   learning_objectives = ABETLearningObjective.objects.all()
   
   print("Average Grades for Each Learning Objective:")
   for objective in learning_objectives:
      # Get all questions mapped to this learning objective
      mapped_questions = AssignmentQuestionMapping.objects.filter(learning_objective=objective)
      
      # Calculate the average grade for these questions
      average_grade = AssignmentQuestion.objects.filter(
         id__in=mapped_questions.values_list('question', flat=True)
      ).aggregate(Avg('average_grade'))['average_grade__avg']
      
      # Print the result
      print(f"{objective}: {average_grade if average_grade is not None else 'No Questions Mapped'}")

# Function to wipe the database
def wipe_database():
   print("\nWiping database...")
   User.objects.all().delete()
   Course.objects.all().delete()
   Section.objects.all().delete()
   Semester.objects.all().delete()
   ABETVersion.objects.all().delete()
   ABETLearningObjective.objects.all().delete()
   AssignmentTemplate.objects.all().delete()
   Assignment.objects.all().delete()
   AssignmentQuestion.objects.all().delete()
   AssignmentQuestionMapping.objects.all().delete()
   print("Database wiped successfully!")

# Main execution
if __name__ == "__main__":
   print("Populating database...")
   populate_database(NUM_USERS, NUM_COURSES, NUM_SECTIONS)
   
   print("\nVisualizing database before wiping...")
   visualize_database()

   # Calculate the average grade for each learning objective and print it before wiping
   calculate_average_grades()
   
   wipe_database()