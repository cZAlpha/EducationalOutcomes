from django.db import models
from django.conf import settings  # Use this to refer to the custom User model
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone # For verifying time validity
from django.core.exceptions import ValidationError # For throwing validation errors
from django.contrib.auth.password_validation import validate_password # For validating passwords


# NOTE: This is where API-compatible database tables are defined
# Each class in this file dictates the creation of a Django 'Model', 
# this is just a fancy way to call a table, or an object within
# a relational database. The name of the class dictates the name of
# the table within the database. Each internal variable dictates a 
# column within the table. The thing you set the variables equal to
# dictates the datatype of that column. You can also override 
# functions to meet your needs like in the Note table's usage of
# overriding the Python equivalent of Java's toString method.


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


class Log(models.Model):
   ACTION_CHOICES = [ # Log action types
      ('CREATE', 'Create'),
      ('UPDATE', 'Update'),
      ('DELETE', 'Delete'),
      ('LOGIN', 'Login'),
      ('LOGOUT', 'Logout'),
      ('ERROR', 'Error'),
   ]

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
      return f"{self.user} - {self.action} - {self.timestamp}"


# ABET Specific Models

# ABET Versions
class ABETVersion(models.Model):
   year = models.PositiveIntegerField()
   
   def clean(self):
      # Ensure the year is not in the future
      current_year = timezone.now().year
      if self.year > current_year:
         raise ValidationError(f"The year {self.year} cannot be in the future.")
      
      # Optionally, add further custom validation, such as a minimum year:
      if self.year < 2000:  # Adjust this according to your requirements
         raise ValidationError("The year must be greater than or equal to 2000.")
   
   def __str__(self): # To string method returns the given ABET Version's year
      return str(self.year)


# ABET Learning Objectives
class ABETLearningObjective(models.Model):
   abet_version = models.ForeignKey(ABETVersion, on_delete=models.CASCADE)
   designation = models.CharField(max_length=10) # What letter is used to designate a given LO
   description = models.CharField(max_length=100, null=True, blank=True) # Optional description
   
   def __str__(self):
      return f"{self.designation}: {self.description} | ABET Version: {self.abet_version}"


# Courses
class Course(models.Model):
   crn_id = models.CharField(max_length=20, primary_key=True) # The CRN of a given course IS ITS PK, e.g. CRN would be: 'CSCI 361-01'
   name = models.CharField(max_length=255) # The name of the given course
   description = models.TextField(max_length=1000, null=True, blank=True) # Optional course description
   
   def __str__(self):
      return self.name


# Semesters
class Semester(models.Model):
   SEMESTER_CHOICES = [ # These are the only choices for semesters
      ('Spring', 'Spring'), 
      ('Fall', 'Fall'), 
      ('Winter', 'Winter'), 
      ('Summer', 'Summer')
   ]

   name = models.CharField(max_length=30, choices=SEMESTER_CHOICES)
   
   def __str__(self):
      return self.name


# Sections
class Section(models.Model):
   course = models.ForeignKey(Course, on_delete=models.CASCADE)
   abet_version = models.ForeignKey(ABETVersion, on_delete=models.CASCADE)
   semester = models.ForeignKey(Semester, on_delete=models.CASCADE)
   instructor = models.ForeignKey(User, on_delete=models.CASCADE) # Users are instructors
   year = models.PositiveIntegerField()
   
   def clean(self):
      # Ensure the year is not in the future
      current_year = timezone.now().year
      if self.year > current_year:
         raise ValidationError(f"The year {self.year} cannot be in the future.")
      
      # Optionally, add further custom validation, such as a minimum year:
      if self.year < 2000:  # Adjust this according to your requirements
         raise ValidationError("The year must be greater than or equal to 2000.")

   
   def __str__(self):
      return f"Section {self.id} - {self.course.name} ({self.year})"


# Assignment Templates
class AssignmentTemplate(models.Model):
   instructor = models.ForeignKey(User, on_delete=models.CASCADE)
   name = models.CharField(max_length=255)
   description = models.TextField(max_length=1000, null=True, blank=True)
   date_created = models.DateField(auto_now_add=True)
   templateData = models.JSONField()
   
   def clean(self):
      # Insert templateData verification here
      # JSON data should look like:
      # {
      #     ABETVersion: must be an entry in the ABETVersion table
      #     QuestionMappings {
      #        1: string with a lowercase letter (if uppercase, lowercase it before saving)
      #        2: ...
      #        ...
      #     }
      #    
      # }
      pass
   
   def __str__(self):
      return self.name


# Assignments
class Assignment(models.Model):
   section = models.ForeignKey(Section, on_delete=models.CASCADE)
   template = models.ForeignKey(AssignmentTemplate, on_delete=models.CASCADE, null=True, blank=True)
   name = models.CharField(max_length=255)
   description = models.TextField(max_length=1000, null=True, blank=True)
   csv_filepath = models.CharField(max_length=500, null=True, blank=True)
   date_created = models.DateField(auto_now_add=True)
   
   def __str__(self):
      return self.name


# Assignment Questions
class AssignmentQuestion(models.Model):
   assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE)
   question_number = models.PositiveIntegerField()
   text = models.TextField(max_length=500, null=True, blank=True) # If your assignment's question is longer than 500 words, that's on you!
   average_grade = models.FloatField() # Average grade is not optional
   
   def __str__(self):
      return f"Q{self.question_number} - {self.assignment.name} had an average grade of: {self.average_grade}"


# Assignment Question Mappings
class AssignmentQuestionMapping(models.Model):
   question = models.ForeignKey(AssignmentQuestion, on_delete=models.CASCADE)
   learning_objective = models.ForeignKey(ABETLearningObjective, on_delete=models.CASCADE)
   
   def __str__(self):
      return f"Mapping {self.id} maps Q{self.question.id} -> LO {self.learning_objective.id}"


