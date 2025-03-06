from rest_framework import serializers # Import the REST framework serializer
from .models import * # Import models
from django.core.exceptions import ValidationError
from datetime import datetime


# NOTE:
# - ALL MODELS MUST HAVE A SERIALIZER!!!!
# - Maps python objects (from Models.py) to corresponding JSON code
# - With our API, we will be using JSON, so we must serialize and deserialize information to make data flow correctly and efficiently


# All serializers should contain a create and update method (if required). Creation and updating should be handled at the serializer layer
# rather than the views layer.


# UserRole Serializer
class UserRoleSerializer(serializers.ModelSerializer):
   class Meta:
      model = UserRole
      fields = ["id", "role_name", "role_description", "permissions"]
   # Purposefully does not contain methods here. Records in this table should be set up manually upon startup.


# User Serializer
class UserSerializer(serializers.ModelSerializer):
   role = UserRoleSerializer(read_only=True)  # Include role data in the serialized response
   role_id = serializers.PrimaryKeyRelatedField(queryset=UserRole.objects.all(), write_only=True)  # For creating/updating a user, use the role ID
   
   class Meta:
      model = User
      fields = [
            'user_id', 'd_number', 'role', 'role_id', 'email', 'first_name', 'last_name', 
            'employee_id', 'date_created', 'is_active', 'is_staff'
      ]
      read_only_fields = ['user_id', 'date_created']  # These fields are auto-managed by Django and should be read-only

      extra_kwargs = {
         "password": {"write_only": True},
      }

   def create(self, validated_data):
      role_id = validated_data.pop('role_id', None)
      password = validated_data.pop('password')  # Extract password
      user = User.objects.create(**validated_data)
      user.set_password(password)  # Hash the password
      if role_id:
         user.role = UserRole.objects.get(id=role_id)
         user.save()
      return user

   def update(self, instance, validated_data):
      role_id = validated_data.pop('role_id', None)
      password = validated_data.pop('password', None)  # Extract password if present
      for attr, value in validated_data.items():
         setattr(instance, attr, value)
      if password:
         instance.set_password(password)  # Hash the password when updating | The "set_password" function hashes the password, FYI
      if role_id:
         instance.role = UserRole.objects.get(id=role_id)
      instance.save()
      return instance


# Log Serializer
class LogSerializer(serializers.ModelSerializer):
   user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())  # Explicit FK validation
   
   class Meta:
      model = Log
      fields = ['log_id', 'user', 'action', 'timestamp', 'description']


# Accreditation Organization Serializer
class AccreditationOrganizationSerializer(serializers.ModelSerializer):
   # Top level model does not have FK and doesn't need FK validation
   class Meta:
      model = AccreditationOrganization
      fields = ['a_organization_id', 'name', 'description']


# Accreditation Version Serializer
class AccreditationVersionSerializer(serializers.ModelSerializer):
   a_organization = AccreditationOrganizationSerializer() # Nested serializer to get the actual object instead of just the id
   
   class Meta:
      model = AccreditationVersion
      fields = ['a_version_id', 'a_organization', 'year']


# Program Learning Objective Serializer
class ProgramLearningObjectiveSerializer(serializers.ModelSerializer):
   a_version = serializers.PrimaryKeyRelatedField(queryset=AccreditationVersion.objects.all())  # Explicit FK validation
   
   class Meta:
      model = ProgramLearningObjective
      fields = ['plo_id', 'a_version', 'designation', 'description']


# Program Serializer
class ProgramSerializer(serializers.ModelSerializer):
   # Top level model does not have FK and doesn't need FK validation
   class Meta:
      model = Program
      fields = ['program_id', 'designation', 'description']


# Course Serializer
class CourseSerializer(serializers.ModelSerializer):
   a_version = serializers.PrimaryKeyRelatedField(queryset=AccreditationVersion.objects.all())
   a_version_details = AccreditationVersionSerializer(source='a_version', read_only=True) # Nested, read-only serializer
   
   class Meta:
      model = Course
      fields = ['course_id', 'a_version', 'a_version_details', 'course_number', 'name', 'description', 'date_added', 'date_removed']
      depth = 1  # This will automatically expand foreign keys
   
   # Custom validation for date_added and date_removed
   def validate_date_added(self, value):
      if value > datetime.now():
         raise ValidationError(f"The date_added cannot be in the future. Args you passed: {value}")
      return value
   
   def validate_date_removed(self, value):
      if value and value < self.initial_data.get('date_added'):
         raise ValidationError("The date_removed cannot be earlier than the date_added.")
      return value


# Program Course Mapping Serializer
class ProgramCourseMappingSerializer(serializers.ModelSerializer):
   # Mapping models require double FK validation (at minimum)
   program = serializers.PrimaryKeyRelatedField(queryset=Program.objects.all())  # Explicit FK validation
   course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all())  # Explicit FK validation

   class Meta:
      model = ProgramCourseMapping
      fields = ['program_course_mapping_id', 'program', 'course']


# Semester Serializer
class SemesterSerializer(serializers.ModelSerializer):
   class Meta:
      model = Semester
      fields = ['semester_id', 'designation']
   # Could add some semester designation validation but probably isn't necessary


# Section Serializer
class SectionSerializer(serializers.ModelSerializer):
   course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all())
   semester = serializers.PrimaryKeyRelatedField(queryset=Semester.objects.all())
   instructor = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
   
   course_details = CourseSerializer(source='course', read_only=True)
   semester_details = SemesterSerializer(source='semester', read_only=True)
   instructor_details = UserSerializer(source='instructor', read_only=True)
   
   class Meta:
      model = Section
      fields = ['section_id', 'course', 'section_number', 'semester', 'crn', 'instructor', 'course_details', 'semester_details', 'instructor_details']


# Evaluation Type Serializer
class EvaluationTypeSerializer(serializers.ModelSerializer):
   class Meta:
      model = EvaluationType
      fields = ['evaluation_type_id', 'type_name', 'description']


# Evaluation Instrument Serializer
class EvaluationInstrumentSerializer(serializers.ModelSerializer):
   section = serializers.PrimaryKeyRelatedField(queryset=Semester.objects.all())  # Explicit FK validation
   evaluation_type = serializers.PrimaryKeyRelatedField(queryset=Semester.objects.all())  # Explicit FK validation

   class Meta:
      model = EvaluationInstrument
      fields = ['evaluation_instrument_id', 'section', 'evaluation_type', 'name', 'description']


# Embedded Task Serializer
class EmbeddedTaskSerializer(serializers.ModelSerializer):
   evaluation_instrument = serializers.PrimaryKeyRelatedField(queryset=EvaluationInstrument.objects.all())  # Explicit FK validation

   class Meta:
      model = EmbeddedTask
      fields = ['embedded_task_id', 'evaluation_instrument', 'task_number', 'task_text']


# Course Learning Objective Serializer
class CourseLearningObjectiveSerializer(serializers.ModelSerializer):
   course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all())
   created_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
   
   course_details = CourseSerializer(source='course', read_only=True)
   created_by_details = UserSerializer(source='created_by', read_only=True)
   
   class Meta:
      model = CourseLearningObjective
      fields = ['clo_id', 'course', 'designation', 'description', 'created_by', 'course_details', 'created_by_details']


# Task CLO Mapping Serializer
class TaskCLOMappingSerializer(serializers.ModelSerializer):
   # Mapping model requires both FK to be validated
   task = serializers.PrimaryKeyRelatedField(queryset=EmbeddedTask.objects.all())  # Explicit FK validation
   clo = serializers.PrimaryKeyRelatedField(queryset=CourseLearningObjective.objects.all())  # Explicit FK validation
   
   class Meta:
      model = TaskCLOMapping
      fields = ['task_clo_mapping_id', 'task', 'clo']


# PLO CLO Mapping Serializer
class PLOCLOMappingSerializer(serializers.ModelSerializer):
   # Mapping model requires both FK to be validated
   plo = serializers.PrimaryKeyRelatedField(queryset=ProgramLearningObjective.objects.all())  # Explicit FK validation
   clo = serializers.PrimaryKeyRelatedField(queryset=CourseLearningObjective.objects.all())  # Explicit FK validation
   
   class Meta:
      model = PLOCLOMapping
      fields = ['plo_clo_mapping_id', 'plo', 'clo']


# Student Serializer
class StudentSerializer(serializers.ModelSerializer):
   class Meta:
      model = Student
      fields = ['d_number', 'first_name', 'last_name']


# Student Task Mapping Serializer
class StudentTaskMappingSerializer(serializers.ModelSerializer):
   # Mapping model requires both FK to be validated
   task = serializers.PrimaryKeyRelatedField(queryset=EmbeddedTask.objects.all())  # Explicit FK validation
   student = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all())  # Explicit FK validation
   
   class Meta:
      model = StudentTaskMapping
      fields = ['task_clo_mapping_id', 'student', 'task']
