from django.db import models
from django.conf import settings  # Use this to refer to the custom User model
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone # For verifying time validity
from django.core.exceptions import ValidationError # For throwing validation errors
from django.contrib.auth.password_validation import validate_password # For validating passwords
from django.core.validators import MinValueValidator, MaxValueValidator


# NOTE: This is where API-compatible database tables are defined
# Each class in this file dictates the creation of a Django 'Model', 
# this is just a fancy way to call a table, or an object within
# a relational database. The name of the class dictates the name of
# the table within the database. Each internal variable dictates a 
# column within the table. The thing you set the variables equal to
# dictates the datatype of that column. You can also override 
# functions to meet your needs like in the Note table's usage of
# overriding the Python equivalent of Java's toString method.

# TODO:
# - If needed (test first before doing the work), use the Meta method to define pseudo-composite primary keys for all models
# - Before using META, use composite key method if not too many attributes are part of the primary key


# User Role
class UserRole(models.Model):
   ROLE_CHOICES = [ # These role choices are in order of power, admins can read and write anything, users can only read and write to certian fields and clients are READ ONLY for most things
      ('root', 'root'), # For Dr. Rasamny ONLY (or other applicable super administrator)
      ('Admin', 'Admin'), # For Dr. Smolenski and other high-ranking professors
      ('User', 'User'), # For general users such as normal professors
   ]
   role_name = models.CharField(max_length=20, unique=True, choices=ROLE_CHOICES)
   role_description = models.TextField(null=True, blank=True)
   permissions = models.JSONField(max_length=1000, null=True, blank=True) # Optional JSON object containing 'list' of permissions
   
   def __str__(self):
      return self.role_name


# User Manager (Django quirk but required)
class UserManager(BaseUserManager):
   # Purpose: The user manager is used to manage the creation of users
   # Q: Why not just use a user view to do this, like all other models??
   # A: Django expects a manager if you override the User model, plus it keeps some logic out of the views file, which can simplify things in some regards
   def create_user(self, d_number, email, password=None, **extra_fields): # This creates a normal user
      if not email:
         raise ValueError("The Email field must be set")
      if not d_number or len(d_number) != 9:
         raise ValueError("D_Number must be exactly 9 characters long")
      
      email = self.normalize_email(email) # Normalize the email
      extra_fields.setdefault("is_active", True) # Set the is_active attr. to true
      
      # Validate password before setting
      if password:
         try:
               validate_password(password)
         except ValidationError as e:
               raise ValueError(f"Invalid password: {', '.join(e.messages)}")
      
      user = self.model(d_number=d_number, email=email, **extra_fields) # Creates a new user object
      user.set_password(password) # Hashes AND sets the user's password
      user.save(using=self._db) # Saves the user object to the database
      return user

   def create_superuser(self, d_number, email, password=None, **extra_fields):
      extra_fields.setdefault("is_staff", True) # Sets admin to true
      extra_fields.setdefault("is_superuser", True) # Sets root to true
      return self.create_user(d_number, email, password, **extra_fields) # Calls normal constructor


# User
class User(AbstractBaseUser, PermissionsMixin):
   user_id = models.BigAutoField(primary_key=True)  # Auto-handled primary key
   d_number = models.CharField(max_length=9, unique=True)  # Username as D_Number
   role = models.ForeignKey("UserRole", on_delete=models.SET_NULL, null=True, blank=True)
   email = models.EmailField(unique=True)
   password = models.CharField(max_length=128)  # Handled by Django's hashing system
   first_name = models.CharField(max_length=20)
   last_name = models.CharField(max_length=40)
   employee_id = models.CharField(max_length=20, null=True, blank=True) # State-related employee ID, optional due to some adjuncts may not have it
   date_created = models.DateTimeField(auto_now_add=True)
   
   # Permissions fields
   is_active = models.BooleanField(default=True)
   is_staff = models.BooleanField(default=False)
   
   objects = UserManager()
   
   USERNAME_FIELD = "d_number"  # D_Number IS the username
   REQUIRED_FIELDS = ["email"]
   
   def __str__(self):
      return self.d_number


# Log 
class Log(models.Model):
   ACTION_CHOICES = [ # Log action types
      ('CREATE', 'Create'),
      ('UPDATE', 'Update'),
      ('DELETE', 'Delete'),
      ('LOGIN', 'Login'),
      ('LOGOUT', 'Logout'),
      ('ERROR', 'Error'),
   ]

   log_id = models.BigAutoField(primary_key=True)
   user = models.ForeignKey( # The user who caused the log
      settings.AUTH_USER_MODEL,
      on_delete=models.SET_NULL,
      null=True,
      blank=True,
      related_name="logs"
   )
   action = models.CharField(max_length=50, choices=ACTION_CHOICES) # The action the log is logging
   timestamp = models.DateTimeField(auto_now_add=True) # The time the log took place
   description = models.TextField(blank=True) # The description of the log, usually blank
   
   def __str__(self):
      return f"{self.user} | {self.action} | {self.timestamp}"


# Accreditation Organization
class AccreditationOrganization(models.Model):
   a_organization_id = models.BigAutoField(primary_key=True)  # Auto-handled primary key
   name = models.CharField(max_length=100, blank=False, null=False)  # The name of the organization
   description = models.CharField(max_length=1000, blank=True, null=False)  # A description of the organization
   
   def __str__(self): # To string metod
      return f"{self.name} | {self.description[:20]}"  # Shows the name and first 20 chars of the description of the organization


# Accreditation Version
class AccreditationVersion(models.Model):
   a_version_id = models.BigAutoField(primary_key=True)  # Auto-handled primary key
   a_organization = models.ForeignKey(AccreditationOrganization, on_delete=models.CASCADE)  # Dictates the organization from which the version comes from
   year = models.PositiveIntegerField()
   
   def clean(self):  # The reason this isn't EXPLICITLY called is because on .save(), Django will automatically call this function thankfully
      # Ensure the year is not in the future
      current_year = timezone.now().year
      if self.year > current_year + 1:
         raise ValidationError(f"The year {self.year} cannot be in the future by more than one year.")
      
      # Optionally, add further custom validation, such as a minimum year:
      if self.year < 2000:  # Adjust this according to your requirements
         raise ValidationError("The year must be greater than or equal to 2000.")
   
   def __str__(self): # To string method returns the given ABET Version's year
      return f"{self.a_organization} - {self.year}"


# Program Learning Objective (PLO)
class ProgramLearningObjective(models.Model):
   plo_id = models.BigAutoField(primary_key=True)  # Auto-handled primary key
   a_version = models.ForeignKey(AccreditationVersion, on_delete=models.CASCADE)  # Dictates the accreditation version that the given PLO uses
   designation = models.CharField(max_length=10)  # What letter is used to designate a given LO
   description = models.CharField(max_length=1200, null=True, blank=True)  # Optional description
   
   def __str__(self):
      return f"{self.designation}: {self.description[:20]} | Accreditation Version: {self.a_version} | From Organization: {self.a_version.a_organization}"


# Program
class Program(models.Model):
   program_id = models.BigAutoField(primary_key=True)  # Auto-handled primary key
   designation = models.CharField(max_length=20) # The 'name' of the program such as "CSCI" or "IT"
   description = models.CharField(max_length=100, null=True, blank=True)  # Optional description
   
   def __str__(self):
         return f"Program: {self.designation} | {self.description[:20]}"  # Gives program designation and description


# Courses
class Course(models.Model):
   course_id = models.BigAutoField(primary_key=True)  # Auto-handled primary key
   a_version = models.ForeignKey(AccreditationVersion, on_delete=models.CASCADE)  # Dictates the accreditation version that the course makes use of 
   course_number = models.IntegerField()  # The course number for the course
   name = models.CharField(max_length=255) # The name of the given course
   description = models.TextField(max_length=1000, null=True, blank=True) # Optional course description
   date_added = models.DateField(auto_now=True)  # Sets the date added to the current date upon instantiation
   date_removed = models.DateField(blank=True, null=True)  # The date that the course was removed, set to null by default for obvious reasons
   
   def __str__(self):
      return f"Course: {self.name} | {self.course_number} | {self.description[:20]}"  # Gives the course name, number and description


# Program Course Mapping
class ProgramCourseMapping(models.Model):  
   program_course_mapping_id = models.BigAutoField(primary_key=True)  # Explicitly state the ID as PK, then use a constraint to act as a pseudo PK
   program = models.ForeignKey(Program, on_delete=models.CASCADE)
   course = models.ForeignKey(Course, on_delete=models.CASCADE)
   
   class Meta:  # Allows for a pseudo-composite primary key to be used
      constraints = [
         models.UniqueConstraint(fields=['program', 'course'], name='unique_program_course')
      ]
   
   def __str__(self):
      return f"ID: {self.program_course_mapping_id} | Program: {self.program} | Course: {self.course}"


# Semesters
class Semester(models.Model):
   semester_id = models.BigAutoField(primary_key=True)
   designation = models.IntegerField()  # Holds the designation/'name' of the semester, e.g.: 202501 is Fall Semester of 2024
   
   def __str__(self):
      return str(self.designation)


# Sections
class Section(models.Model):
   section_id = models.BigAutoField(primary_key=True)
   course = models.ForeignKey(Course, on_delete=models.CASCADE) # Associated course for the given section
   section_number = models.CharField(max_length=5) # The section number may include letters and numbers, hence why it is a char field. It has a maximum character length of 5, but will usually not exceed 3.
   semester = models.ForeignKey(Semester, on_delete=models.CASCADE)
   crn = models.CharField(max_length=20)
   instructor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True) # Users are instructors, optional (at first)
   
   class Meta:
      constraints = [
         models.UniqueConstraint(fields=['course', 'section_number'], name='unique_course_section')
      ]
   
   def __str__(self):
      return f"Section {self.section_id} - {self.course.name} - {self.section_number} - ({self.semester})"


# Evaluation Type
class EvaluationType(models.Model):
   evaluation_type_id = models.BigAutoField(primary_key=True)
   type_name = models.CharField(max_length=30)  # The name of the type of evaluation
   description = models.CharField(max_length=250, null=True, blank=True)
   
   def __str__(self):
      return f"{self.type_name} | ID:{self.evaluation_type_id} | {self.description[:20]}"


# Evaluation Instrument
class EvaluationInstrument(models.Model):
   evaluation_instrument_id = models.BigAutoField(primary_key=True)
   section = models.ForeignKey(Section, on_delete=models.CASCADE) # If the associated section is deleted, so will any associated evaluation instrument
   evaluation_type = models.ForeignKey(EvaluationType, null=True, on_delete=models.SET_NULL)  # If the associated type is deleted, it will default to NULL instead of deleting the record
   name = models.CharField(max_length=255)
   description = models.TextField(max_length=1000, null=True, blank=True)
   
   def __str__(self):
      return f"{self.name} | {self.evaluation_type} | {self.description[:20]}"


# Embedded Task
class EmbeddedTask(models.Model):
   embedded_task_id = models.BigAutoField(primary_key=True)
   evaluation_instrument = models.ForeignKey(EvaluationInstrument, on_delete=models.CASCADE) # If the associated eval. instrument is deleted, delete the tasks associated with it too
   task_number = models.PositiveIntegerField()  # The task number (optional)
   task_text = models.TextField(max_length=2000, null=True, blank=True) # If your eval. instrument's text is longer than 500 words, that's on you!
   
   def __str__(self):
      return f"Q{self.task_number} - from Eval. Instrument: {self.evaluation_instrument.name} | Description: {self.task_text[:20]}"


# Course Learning Objective
class CourseLearningObjective(models.Model):
   clo_id = models.BigAutoField(primary_key=True)
   course = models.ForeignKey(Course, on_delete=models.CASCADE)  # Deletes course-specific learning objectives if the associated course was deleted
   designation = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(20)])  # Designation number can be from 1-20
   description = models.CharField(max_length=500, null=True, blank=True)  # Optional description
   created_by = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)  # If the creator user is deleted, set this to null
   
   def __str__(self):
      return f"CLO ID: {self.clo_id} | Course: {self.course} | Designation: {self.designation}"


# Task CLO Mapping
class TaskCLOMapping(models.Model):
   task_clo_mapping_id = models.BigAutoField(primary_key=True)  # Explicitly state the ID as PK, then use a constraint to act as a pseudo PK
   task = models.ForeignKey(EmbeddedTask, on_delete=models.CASCADE)
   clo = models.ForeignKey(CourseLearningObjective, on_delete=models.CASCADE)
   
   class Meta:  # Allows for a pseudo-composite primary key to be used
      constraints = [
         models.UniqueConstraint(fields=['task', 'clo'], name='unique_task_clo')
      ]
   
   def __str__(self):
      return f"ID: {self.task_clo_mapping_id} | Task: {self.task} | CLO: {self.clo}"


# PLO CLO Mapping
class PLOCLOMapping(models.Model):
   plo_clo_mapping_id = models.BigAutoField(primary_key=True)  # Explicitly state the ID as PK, then use a constraint to act as a pseudo PK
   plo = models.ForeignKey(ProgramLearningObjective, on_delete=models.CASCADE)
   clo = models.ForeignKey(CourseLearningObjective, on_delete=models.CASCADE)
   
   class Meta:  # Allows for a pseudo-composite primary key to be used
      constraints = [
         models.UniqueConstraint(fields=['plo', 'clo'], name='unique_plo_clo')
      ]
   
   def __str__(self):
      return f"ID: {self.plo_clo_mapping_id} | PLO: {self.plo} | CLO: {self.clo}"


# Student
class Student(models.Model):
   email = models.CharField(max_length=100, primary_key=True)
   first_name = models.CharField(max_length=20)
   last_name = models.CharField(max_length=40)
   
   def __str__(self):
      return f"Student: {self.first_name} {self.last_name}"


# Student Task Mapping
class StudentTaskMapping(models.Model):  # This is basically just a gradebook disguised as a mapping model
   student_task_mapping_id = models.BigAutoField(primary_key=True)
   student = models.ForeignKey(Student, on_delete=models.CASCADE, to_field='email')
   task = models.ForeignKey(EmbeddedTask, on_delete=models.CASCADE)  # When the associated task is deleted, delete all grades associated with it
   score = models.FloatField()  # The student's score on the given task
   total_possible_score = models.FloatField()  # The total possible points attainable on the task (this allows us to do calculations later and lets us easily handle non-normalized scores)
   
   class Meta:  # Allows for a pseudo-composite primary key to be used
      constraints = [
         models.UniqueConstraint(fields=['student', 'task'], name='unique_student_task')
      ]
   
   def __str__(self):
      return f"Student: {self.student.first_name} {self.student.last_name} | Score: {(self.score / self.total_possible_score)} | Task: {self.task}"