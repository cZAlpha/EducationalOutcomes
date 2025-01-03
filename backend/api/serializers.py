from rest_framework import serializers # Import the REST framework serializer
from .models import Course, User, UserRole, ABETLearningObjective, ABETVersion, Section, Semester, AssignmentTemplate, Assignment, AssignmentQuestion, AssignmentQuestionMapping, Log
from django.contrib.auth.password_validation import validate_password
from rest_framework.exceptions import ValidationError


# NOTE:
# - ALL MODELS MUST HAVE A SERIALIZER!!!!
# - Maps python objects (from Models.py) to corresponding JSON code
# - With our API, we will be using JSON, so we must serialize and deserialize information to make data flow correctly and efficiently


# User Serializer
class UserSerializer(serializers.ModelSerializer):
   class Meta:
      model = User
      fields = ["id", "username", "email", "password", "role"]
      extra_kwargs = {
         "password": {"write_only": True},
      }

   def validate_password(self, value):
      try:
         validate_password(value)
      except ValidationError as e:
         raise serializers.ValidationError(e.messages)
      return value
   
   def create(self, validated_data):
      password = validated_data.pop("password")
      role = validated_data.pop("role", None)
      
      # Create the user with the hashed password
      user = User.objects.create_user(
         username=validated_data["username"],
         email=validated_data["email"],
         password=password
      )
      
      # Assign the role if provided
      if role:
         user.role = role
      
      # Save the user, ensuring they are stored in the database
      user.save()
      
      return user


# UserRole Serializer
class UserRoleSerializer(serializers.ModelSerializer):
   class Meta:
      model = UserRole
      fields = ["id", "role_name", "role_description", "permissions"]


# Log Serializer
class LogSerializer(serializers.ModelSerializer):
   class Meta:
      model = Log
      fields = ['id', 'user', 'action', 'timestamp', 'description']


# ABET Serializers


# ABETVersion Serializer
class ABETVersionSerializer(serializers.ModelSerializer):
   class Meta:
      model = ABETVersion
      fields = ['id', 'year']


# ABETLearningObjective Serializer
class ABETLearningObjectiveSerializer(serializers.ModelSerializer):
   class Meta:
      model = ABETLearningObjective
      fields = ['id', 'abet_version', 'designation', 'description']


# Course Serializer
class CourseSerializer(serializers.ModelSerializer):
   class Meta:
      model = Course
      fields = ['crn_id', 'name', 'description']


# Semester Serializer
class SemesterSerializer(serializers.ModelSerializer):
   class Meta:
      model = Semester
      fields = ['id', 'name']


# Section Serializer
class SectionSerializer(serializers.ModelSerializer):
   class Meta:
      model = Section
      fields = ['id', 'course', 'abet_version', 'semester', 'instructor', 'year']


# AssignmentTemplate Serializer
class AssignmentTemplateSerializer(serializers.ModelSerializer):
   class Meta:
      model = AssignmentTemplate
      fields = ['id', 'instructor', 'name', 'description', 'date_created', 'templateData']


# Assignment Serializer
class AssignmentSerializer(serializers.ModelSerializer):
   class Meta:
      model = Assignment
      fields = ['id', 'section', 'template', 'name', 'description', 'csv_filepath', 'date_created']


# AssignmentQuestion Serializer
class AssignmentQuestionSerializer(serializers.ModelSerializer):
   class Meta:
      model = AssignmentQuestion
      fields = ['id', 'assignment', 'question_number', 'text', 'average_grade']


# AssignmentQuestionMapping
class AssignmentQuestionMappingSerializer(serializers.ModelSerializer):
   class Meta:
      model = AssignmentQuestionMapping
      fields = ['id', 'question', 'learning_objective']
