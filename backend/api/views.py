# Django Imports
from django.db.models import Sum, Avg, F, ExpressionWrapper, FloatField
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.hashers import make_password
from rest_framework.exceptions import NotFound
from django.shortcuts import get_object_or_404
from django.core.exceptions import BadRequest
from rest_framework.response import Response
from rest_framework import status, generics
from django.http import FileResponse
from collections import defaultdict
from django.db import transaction
import json

# Graphing imports
import matplotlib
matplotlib.use("Agg") # Uses the 'Agg' backend for matplotlib to ensure no GUI instances are spun up, thus avoiding memory leaks and wasted processing power and time
import matplotlib.pyplot as plt
import base64
import io
import os

# PDF imports
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Spacer, Paragraph, Image, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER 
from reportlab.lib.units import inch
from reportlab.lib import colors

# User-made django imports
from .serializers import * # Import serializers
from .models import * # Import models


# TODO:
# - Rewrite every single <MODEL>Detail View's perform update function to verify input / existance of at least one valid field with better error handling to help with development
# - Possibly change the lookup field for the ABET related views, as it may make more sense to use other attributes of the models other than their primary key (which is usually an auto-int handled by Django)


# START - USERS
# Create User View (Restricted to Superusers) | This is only separate from the UserLisCreate View due to security concerns.
class CreateUserView(generics.CreateAPIView):
   """
   Allows only superusers to create new users.
   """
   queryset = User.objects.all()
   serializer_class = UserSerializer
   permission_classes = [IsAuthenticated]  # Only superusers can create users

# User List and Create View (Only Admins can create users)
class UserListCreate(generics.ListCreateAPIView):
   """
   Allows authenticated users to list users.
   - Superusers can see all users.
   - Regular users can only see their own details.
   - Only superusers can create new users.
   """
   serializer_class = UserSerializer
   permission_classes = [IsAuthenticated]
   
   def get_queryset(self):
      """
      If the user is a superuser, return all users.
      Otherwise, return only the requesting user's data.
      """
      user = self.request.user
      if user.is_superuser:
         return User.objects.all()  # Superusers see all users
      return User.objects.filter(user_id=user.user_id) # only returns the same user
   
   def create(self, request, *args, **kwargs):
      """
      Override create method to ensure only superusers can create users.
      """
      if not request.user.is_superuser:
         return Response({"error": "Only superusers can create new users."}, status=status.HTTP_403_FORBIDDEN)
      return super().create(request, *args, **kwargs)

# User Detail View (Retrieve, Update, Delete)
class UserDetail(generics.RetrieveUpdateDestroyAPIView):
   """
   Allows authenticated users to retrieve, update, and delete a user instance.
   """
   queryset = User.objects.all()
   serializer_class = UserSerializer
   permission_classes = [IsAuthenticated]
   
   def get_object(self):
      """
      Retrieve user by either ID or username.
      """
      user_identifier = self.kwargs['user_identifier']
      try:
         return get_object_or_404(User, pk=int(user_identifier))  # Try by ID
      except ValueError:
         return get_object_or_404(User, d_number=user_identifier) # Try by d number
   
   def perform_update(self, request, serializer):
      """
      Hash password before saving, if updated.
      """
      if not request.user.is_superuser: # Disallows non-super users from updating user information under any circumstances
         return Response({"error": "Only superusers can create new users."}, status=status.HTTP_403_FORBIDDEN)
      if 'password' in serializer.validated_data:
         serializer.validated_data['password'] = make_password(serializer.validated_data['password'])
      serializer.save()
   
   def perform_destroy(self, request, instance):
      """
      Deletes the user instance.
      """
      if not request.user.is_superuser: # Disallows non-super users from deleting users under any circumstances
         return Response({"error": "Only superusers can create new users."}, status=status.HTTP_403_FORBIDDEN)
      instance.delete()
      return Response(status=status.HTTP_204_NO_CONTENT)
# STOP - USERS



# START - LOG
class LogListCreate(generics.ListCreateAPIView):
   """
   API endpoint for listing all logs and creating a new log.
   """
   serializer_class = LogSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   
   def get(self, request):
      if not request.user.is_superuser:  # Checks for superuser status
         return Response({"error": "Only superusers can create new users."}, status=status.HTTP_403_FORBIDDEN)
      logs = Log.objects.all()
      serializer = LogSerializer(logs, many=True)
      return Response(serializer.data)
   
   def post(self, request):
      if not request.user.is_superuser:  # Checks for superuser status
         return Response({"error": "Only superusers can create new users."}, status=status.HTTP_403_FORBIDDEN)
      serializer = LogSerializer(data=request.data)
      if serializer.is_valid():  # Checks for valid serializer
         serializer.save()
         return Response(serializer.data, status=status.HTTP_201_CREATED)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogDetail(generics.RetrieveUpdateDestroyAPIView):
   """
   A view for retrieving, updating, and deleting a specific log instance.
   """
   queryset = Log.objects.all()  # Define queryset for the view
   serializer_class = LogSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   lookup_field = "pk"  # Use the primary key to find the log instance
   
   def get_queryset(self, request):
      if not request.user.is_superuser:  # Checks for superuser status
            return Response({"error": "Only superusers can create new users."}, status=status.HTTP_403_FORBIDDEN)
      return Log.objects.all()
   
   def perform_update(self, request, serializer):
      """
      This method is called when an update (PUT) request is made.
      It allows us to add custom behavior during the update (e.g., adding more info).
      """
      if not request.user.is_superuser:  # Checks for superuser status
            return Response({"error": "Only superusers can create new users."}, status=status.HTTP_403_FORBIDDEN)
      # If you want to perform additional checks or modifications before saving the log
      serializer.save()
   
   def perform_destroy(self, request, instance):
      """
      This method is called when a delete (DELETE) request is made.
      We can perform any custom logic before actually deleting the log.
      """
      if not request.user.is_superuser:  # Checks for superuser status
         return Response({"error": "Only superusers can create new users."}, status=status.HTTP_403_FORBIDDEN)
      instance.delete()
# STOP - LOGS



# START - AccreditationOrganization
class AccreditationOrganizationListCreate(generics.ListCreateAPIView):
   """
   API endpoint for listing all Accreditation Organizations and creating a new Accreditation Organization.
   """
   serializer_class = AccreditationOrganizationSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   
   def get(self, request):
      accreditation_organizations = AccreditationOrganization.objects.all()
      serializer = AccreditationOrganizationSerializer(accreditation_organizations, many=True)
      return Response(serializer.data)
   
   def post(self, request):
      if not request.user.is_superuser:  # Checks for superuser status
            return Response({"error": "Only superusers can create new Accreditation Organizations."}, status=status.HTTP_403_FORBIDDEN)
      serializer = AccreditationOrganizationSerializer(data=request.data)
      if serializer.is_valid():  # Checks for valid serializer
         serializer.save()
         return Response(serializer.data, status=status.HTTP_201_CREATED)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AccreditationOrganizationDetail(generics.RetrieveUpdateDestroyAPIView):
   """
   A view for retrieving, updating, and deleting a specific Accreditation Organization instance.
   """
   queryset = AccreditationOrganization.objects.all()  # Define queryset for the view
   serializer_class = AccreditationOrganizationSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   lookup_field = "pk"  # Use the primary key to find the log instance
   
   def get_queryset(self, request):
      return AccreditationOrganization.objects.all()
   
   def perform_update(self, request, serializer):
      """
      This method is called when an update (PUT) request is made.
      It allows us to add custom behavior during the update (e.g., adding more info).
      """
      if not request.user.is_superuser:  # Checks for superuser status
         return Response({"error": "Only superusers can create new Accreditation Organizations."}, status=status.HTTP_403_FORBIDDEN)
      serializer.save()
   
   def perform_destroy(self, request, instance):
      """
      This method is called when a delete (DELETE) request is made.
      We can perform any custom logic before actually deleting the instance.
      """
      if not request.user.is_superuser:  # Checks for superuser status
            return Response({"error": "Only superusers can create new Accreditation Organizations."}, status=status.HTTP_403_FORBIDDEN)
      instance.delete()
# STOP - AccreditationOrganization



# START - AccreditationVersion
class AccreditationVersionListCreate(generics.ListCreateAPIView):
   """
   API endpoint for listing all instances of and creating a new Accreditation Version.
   """
   serializer_class = AccreditationVersionSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   
   def get(self, request):
      accreditation_versions = AccreditationVersion.objects.all()
      serializer = AccreditationVersionSerializer(accreditation_versions, many=True)
      return Response(serializer.data)
   
   def post(self, request):
      if not request.user.is_superuser:  # Checks for superuser status
            return Response({"error": "Only superusers can create new Accreditation Versions."}, status=status.HTTP_403_FORBIDDEN)
      serializer = AccreditationVersionSerializer(data=request.data)
      if serializer.is_valid():  # Checks for valid serializer
         serializer.save()
         return Response(serializer.data, status=status.HTTP_201_CREATED)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AccreditationVersionDetail(generics.RetrieveUpdateDestroyAPIView):
   """
   A view for retrieving, updating, and deleting a specific Accreditation Version instance.
   """
   queryset = AccreditationVersion.objects.all()  # Define queryset for the view
   serializer_class = AccreditationVersionSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   lookup_field = "pk"  # Use the primary key to find the instance
   
   def get_queryset(self, request):
      return AccreditationVersion.objects.all()
   
   def perform_update(self, request, serializer):
      """
      This method is called when an update (PUT) request is made.
      It allows us to add custom behavior during the update (e.g., adding more info).
      """
      if not request.user.is_superuser:  # Checks for superuser status
         return Response({"error": "Only superusers can create new Accreditation Versions."}, status=status.HTTP_403_FORBIDDEN)
      serializer.save()
   
   def perform_destroy(self, request, instance):
      """
      This method is called when a delete (DELETE) request is made.
      We can perform any custom logic before actually deleting the instance.
      """
      if not request.user.is_superuser:  # Checks for superuser status
            return Response({"error": "Only superusers can create new Accreditation Versions."}, status=status.HTTP_403_FORBIDDEN)
      instance.delete()
# STOP - AccreditationVersion



# START - ProgramLearningObjective (PLO)
class ProgramLearningObjectiveListCreate(generics.ListCreateAPIView):
   """
   API endpoint for listing all instances of and creating a new Program Learning Objectives.
   """
   serializer_class = ProgramLearningObjectiveSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   
   def get(self, request):
      program_learning_objectives = ProgramLearningObjective.objects.all()
      serializer = ProgramLearningObjectiveSerializer(program_learning_objectives, many=True)
      return Response(serializer.data)
   
   def post(self, request):
      if not request.user.is_superuser:  # Checks for superuser status
            return Response({"error": "Only superusers can create new Program Learning Objectives."}, status=status.HTTP_403_FORBIDDEN)
      serializer = ProgramLearningObjectiveSerializer(data=request.data)
      if serializer.is_valid():  # Checks for valid serializer
         serializer.save()
         return Response(serializer.data, status=status.HTTP_201_CREATED)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProgramLearningObjectiveDetail(generics.RetrieveUpdateDestroyAPIView):
   """
   A view for retrieving, updating, and deleting a specific Program Learning Objective instance.
   """
   queryset = ProgramLearningObjective.objects.all()  # Define queryset for the view
   serializer_class = ProgramLearningObjectiveSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   lookup_field = "pk"  # Use the primary key to find the instance
   
   def get_queryset(self, request):
      return ProgramLearningObjective.objects.all()
   
   def perform_update(self, request, serializer):
      """
      This method is called when an update (PUT) request is made.
      It allows us to add custom behavior during the update (e.g., adding more info).
      """
      if not request.user.is_superuser:  # Checks for superuser status
         return Response({"error": "Only superusers can create new Program Learning Objectives."}, status=status.HTTP_403_FORBIDDEN)
      serializer.save()
   
   def perform_destroy(self, request, instance):
      """
      This method is called when a delete (DELETE) request is made.
      We can perform any custom logic before actually deleting the instance.
      """
      if not request.user.is_superuser:  # Checks for superuser status
            return Response({"error": "Only superusers can create new Program Learning Objectives."}, status=status.HTTP_403_FORBIDDEN)
      instance.delete()
# STOP - ProgramLearningObjective (PLO)



# START - Program
class ProgramListCreate(generics.ListCreateAPIView):
   """
   API endpoint for listing all instances of and creating a new Program instance.
   """
   serializer_class = ProgramSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   
   def get(self, request):
      programs = Program.objects.all()
      serializer = ProgramSerializer(programs, many=True)
      return Response(serializer.data)
   
   def post(self, request):
      if not request.user.is_superuser:  # Checks for superuser status
            return Response({"error": "Only superusers can create new Programs."}, status=status.HTTP_403_FORBIDDEN)
      serializer = ProgramSerializer(data=request.data)
      if serializer.is_valid():  # Checks for valid serializer
         serializer.save()
         return Response(serializer.data, status=status.HTTP_201_CREATED)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProgramDetail(generics.RetrieveUpdateDestroyAPIView):
   """
   A view for retrieving, updating, and deleting a specific Program instance.
   """
   queryset = Program.objects.all()  # Define queryset for the view
   serializer_class = ProgramSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   lookup_field = "pk"  # Use the primary key to find the instance
   
   def get_queryset(self):
      return Program.objects.all()
   
   def perform_update(self, request, serializer):
      """
      This method is called when an update (PUT) request is made.
      It allows us to add custom behavior during the update (e.g., adding more info).
      """
      if not request.user.is_superuser:  # Checks for superuser status
         return Response({"error": "Only superusers can create new Programs."}, status=status.HTTP_403_FORBIDDEN)
      serializer.save()
   
   def perform_destroy(self, request, instance):
      """
      This method is called when a delete (DELETE) request is made.
      We can perform any custom logic before actually deleting the instance.
      """
      if not request.user.is_superuser:  # Checks for superuser status
            return Response({"error": "Only superusers can create new Programs."}, status=status.HTTP_403_FORBIDDEN)
      instance.delete()
# STOP - Program



# START - Course
class CourseListCreate(generics.ListCreateAPIView):
   """
   API endpoint for listing all instances of and creating a new Course instance.
   """
   serializer_class = CourseSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   
   def get(self, request):
      courses = Course.objects.all()
      serializer = CourseSerializer(courses, many=True)
      return Response(serializer.data)
   
   def post(self, request):
      # If needed, the code below will ensure that only super users can make a new course
      # if not request.user.is_superuser:
      #    return Response({"error": "Only superusers can create new Courses."}, status=status.HTTP_403_FORBIDDEN)
      
      data = request.data
      print(data)  # use a logger
      
      # Extract relevant information
      program_id = data.get("course", {}).get("program")
      accreditation_version = data.get("course", {}).get("accreditationVersion")
      course_number = data.get("course", {}).get("courseNumber")
      course_number = int(course_number) # Force the course number to be an integer
      course_name = data.get("course", {}).get("courseName")
      course_description = data.get("course", {}).get("description")
      clos_data = data.get("clos", [])  # List of CLOs
      mappings_data = data.get("plo_clo_mappings", [])  # List of CLO-PLO mappings
      
      if not program_id:
         return Response({"error": "Missing program_id."}, status=status.HTTP_400_BAD_REQUEST)
      elif not accreditation_version:
         return Response({"error": "Missing accreditation_version."}, status=status.HTTP_400_BAD_REQUEST)
      elif not course_number:
         return Response({"error": "Missing course_number."}, status=status.HTTP_400_BAD_REQUEST)
      elif not course_name:
         return Response({"error": "Missing course_name."}, status=status.HTTP_400_BAD_REQUEST)
      elif not course_description:
         return Response({"error": "Missing course_description."}, status=status.HTTP_400_BAD_REQUEST)
      
      try:
         with transaction.atomic(): # Use transaction to ensure that nothing is saved if any part of the course creation process fails
               # Step 1: Create Course
               course_data = {
                  "a_version": accreditation_version,
                  "course_number": course_number,
                  "name": course_name,
                  "description": course_description
               }
               print("Course Data: ", course_data)
               course_serializer = CourseSerializer(data=course_data)
               if not course_serializer.is_valid(): # If the course data is invalid, return 400 error
                  transaction.set_rollback(True)
                  return Response(course_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
               
               course = course_serializer.save()  # Save Course if the course data was valid
               
               # Step 1.5: Create Program-Course Mapping
               ProgramCourseMapping.objects.create(program_id=program_id, course=course)
               
               # Step 2: Create CLOs and store their IDs for mapping
               clo_id_map = {}  # Maps CLO designation to actual saved CLO ID
               for clo in clos_data:
                  clo_data = {
                     "course": course.course_id,
                     "designation": clo.get("designation"),
                     "description": clo.get("description"),
                     "created_by": clo.get("created_by")
                  }
                  clo_serializer = CourseLearningObjectiveSerializer(data=clo_data)
                  if clo_serializer.is_valid():
                     saved_clo = clo_serializer.save()
                     clo_id_map[clo.get("designation")] = saved_clo.clo_id  # Store for mapping
                  else:
                     transaction.set_rollback(True)
                     return Response(clo_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
               
               # Step 3: Create CLO-PLO Mappings
               for mapping in mappings_data:
                  clo_designation = mapping.get("cloDesignation")  # Using the correct key 'cloDesignation'
                  plo_id = mapping.get("plo")  # Using the correct key 'plo'
                                 
                  if clo_designation not in clo_id_map or not plo_id:
                     transaction.set_rollback(True)
                     return Response({"error": "Invalid CLO-PLO mapping data."}, status=status.HTTP_400_BAD_REQUEST)
                                 
                  mapping_data = {
                     "clo": clo_id_map[clo_designation],  # Use actual saved CLO ID
                     "plo": plo_id
                  }
                  mapping_serializer = PLOCLOMappingSerializer(data=mapping_data)
                  if mapping_serializer.is_valid():
                     mapping_serializer.save()
                  else:
                     transaction.set_rollback(True)
                     return Response(mapping_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
               
               return Response(course_serializer.data, status=status.HTTP_201_CREATED)
      
      except Exception as e:
         return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CourseDetail(generics.RetrieveUpdateDestroyAPIView):
   """
   A view for retrieving, updating, and deleting a specific Course instance.
   """
   queryset = Course.objects.all()  # Define queryset for the view
   serializer_class = CourseSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   lookup_field = "pk"  # Use the primary key to find the instance
   
   def get_queryset(self):
      return Course.objects.all()
   
   def perform_update(self, serializer):
      """
      This method is called when an update (PUT or PATCH) request is made.
      It allows us to add custom behavior during the update.
      """
      serializer.save()
   
   def perform_destroy(self, request, instance):
      """
      This method is called when a delete (DELETE) request is made.
      We can perform any custom logic before actually deleting the instance.
      """
      if not request.user.is_superuser:  # Checks for superuser status
            return Response({"error": "Only superusers can create new Courses."}, status=status.HTTP_403_FORBIDDEN)
      instance.delete()

class CoursePerformance(generics.RetrieveAPIView):
   queryset = Course.objects.all()
   serializer_class = SectionSerializer
   lookup_field = "pk"
   
   def get(self, *args, **kwargs):
      course_id = self.kwargs.get("pk")
      
      # Fetch the course
      try:
         course = Course.objects.get(pk=course_id)
      except Course.DoesNotExist:
         raise NotFound(detail="Course not found")
      
      # Fetch all sections related to the course
      sections = Section.objects.filter(course=course)
      
      # Compute performance metrics for each section and average them
      all_clo_scores = defaultdict(list)
      for section in sections:
         section_clo_performance = self.generate_clo_performance(section)
         for clo_id, score in section_clo_performance.items():
               all_clo_scores[clo_id].append(score)
      
      # Calculate the average CLO performance
      average_clo_performance = {
         clo_id: sum(scores) / len(scores) if scores else 0
         for clo_id, scores in all_clo_scores.items()
      }
      
      overall_plo_performance = self.generate_course_plo_performance(sections)
      
      print("average_clo_performance", average_clo_performance)
      print("overall_plo_performance", overall_plo_performance)
      
      return Response({
         "clo_performance": average_clo_performance,
         "plo_performance": overall_plo_performance
      })
   
   def generate_clo_performance(self, section):
      """
      Generate the CLO performance for a single section, ensuring normalized scores.
      """
      # Step 1: Get all Evaluation Instruments for the given section
      evaluation_instruments = EvaluationInstrument.objects.filter(section=section)
      
      # Step 2: Get all Embedded Tasks from these Evaluation Instruments
      embedded_tasks = EmbeddedTask.objects.filter(evaluation_instrument__in=evaluation_instruments)
      
      # Step 3: Compute **normalized** average score for each embedded task
      task_avg_scores = {}
      for task in embedded_tasks:
         task_scores = StudentTaskMapping.objects.filter(task=task).values_list("score", "total_possible_score")
         
         # Normalize each individual score
         normalized_scores = [(score / total) * 100 for score, total in task_scores if total > 0]
         
         # Compute the average normalized score for the task
         avg_normalized_score = sum(normalized_scores) / len(normalized_scores) if normalized_scores else 0
         task_avg_scores[task.embedded_task_id] = avg_normalized_score
      
      # Step 4: Get all TaskCLOMapping records for these embedded tasks
      task_clo_mappings = TaskCLOMapping.objects.filter(task__in=embedded_tasks)
      
      # Step 5: Group normalized task scores by CLO
      clo_scores = defaultdict(list)
      for mapping in task_clo_mappings:
         avg_score = task_avg_scores.get(mapping.task.embedded_task_id, 0)
         clo_id = mapping.clo.clo_id
         clo_scores[clo_id].append(avg_score)
      
      # Step 6: Calculate the average score per CLO
      final_clo_performance = {
         clo_id: sum(scores) / len(scores) if scores else 0
         for clo_id, scores in clo_scores.items()
      }
      
      return final_clo_performance
   
   def generate_course_clo_performance(self, sections):
      """
      Generate the CLO performance for all sections in the course.
      """
      all_clo_scores = defaultdict(list)
      
      for section in sections:
            # Get CLO performance for the individual section
            section_clo_performance = self.generate_clo_performance(section)
            for clo_id, score in section_clo_performance.items():
               all_clo_scores[clo_id].append(score)
      
      # Compute average CLO performance for the entire course
      final_clo_performance = {
            clo_id: sum(scores) / len(scores) if scores else 0
            for clo_id, scores in all_clo_scores.items()
      }
      
      return final_clo_performance
   
   def generate_course_plo_performance(self, sections):
      """
      Generate the PLO performance for all sections in the course.
      """
      # Get CLO performance for the entire course
      all_clo_performance = self.generate_course_clo_performance(sections)
      clo_ids = all_clo_performance.keys()
      
      all_plo_scores = defaultdict(list)
      
      # Get PLO performance for each CLO
      clo_plo_mappings = PLOCLOMapping.objects.filter(clo__clo_id__in=clo_ids)
      for mapping in clo_plo_mappings:
            clo_id = mapping.clo.clo_id
            plo_id = mapping.plo.plo_id
            clo_score = all_clo_performance.get(clo_id, 0)
            all_plo_scores[plo_id].append(clo_score)
      
      # Compute average PLO performance for the entire course
      final_plo_performance = {
            plo_id: sum(scores) / len(scores) if scores else 0
            for plo_id, scores in all_plo_scores.items()
      }
      
      return final_plo_performance

class CoursePerformanceReport(generics.RetrieveAPIView):
   queryset = Course.objects.all()
   serializer_class = SectionSerializer
   lookup_field = "pk"
   
   def get(self, request, *args, **kwargs):
      course_id = self.kwargs.get("pk")
      
      # Fetch the course
      try:
         course = Course.objects.get(pk=course_id)
      except Course.DoesNotExist:
         raise NotFound(detail="Course not found")
      
      program_names = list(ProgramCourseMapping.objects.filter(course=course).values_list("program__designation", flat=True))
      
      # Extract query parameters from request
      selectedCourseSemesters = request.query_params.getlist("selectedCourseSemesters", [])
      excludedSections = request.query_params.getlist("excludedSection", [])
      
      # Convert excludedSections to integers
      try:
         excludedSections = [int(section_id) for section_id in excludedSections]
      except ValueError:
         raise BadRequest("Invalid excluded section ID format")
      
      # Parse selectedCourseSemesters into semester IDs
      try:
         if selectedCourseSemesters:  # Check if semesters were passed
            semester_ids = []
            
            for entry in selectedCourseSemesters:
                  try:
                     semester_obj = json.loads(entry)  # Convert JSON string to dictionary
                     semester_ids.append(int(semester_obj["semester_id"]))
                  except (json.JSONDecodeError, KeyError, TypeError, ValueError):
                     raise BadRequest("Invalid semester format in selectedCourseSemesters")
            
            print("Semester IDs:", semester_ids)
            sections = Section.objects.filter(course=course, semester_id__in=semester_ids)  # Whitelist filter
         else:
            sections = Section.objects.filter(course=course)  # No filtering if no semesters provided
      except BadRequest as e:
         raise e  # Raise a 400 Bad Request error with the message
      
      # Whitelist filtering (match semester_id)
      print("Sections left after semester whitelisting: ", sections)
      
      # Blacklist filtering (exclude specific section IDs)
      if excludedSections:
         sections = sections.exclude(section_id__in=excludedSections)
      print("Sections left after excludedSections filtering: ", sections)
      
      if len(sections) <= 0: # If there are no sections after filtering
         raise BadRequest("There were no sections left after filtering!")
      
      # Compute performance metrics
      overall_avg_grade = self.calculate_average_student_grade(sections)
      overall_clo_performance = self.generate_course_clo_performance(sections)
      overall_plo_performance = self.generate_course_plo_performance(sections)
      #print("overall_clo_performance", overall_clo_performance)
      #print("overall_plo_performance", overall_plo_performance)
      
      # Query CLOs and PLOs to get designations
      clo_designations = {}
      plo_designations = {}
      # Assuming you have CLO and PLO models with a 'designation' field
      for clo_id in overall_clo_performance.keys():
         clo = CourseLearningObjective.objects.get(pk=clo_id) 
         clo_designations[clo_id] = clo.designation
      
      for plo_id in overall_plo_performance.keys():
         plo = ProgramLearningObjective.objects.get(pk=plo_id) 
         plo_designations[plo_id] = plo.designation
      
      # Replace PK IDs with designations in performance dictionaries
      clo_performance_with_designations = {
         clo_designations[clo_id]: value
         for clo_id, value in overall_clo_performance.items()
      }
      
      plo_performance_with_designations = {
         plo_designations[plo_id]: value
         for plo_id, value in overall_plo_performance.items()
      }
      
      # START - Get All CLOs and What PLOs They Correspond To
         # Query CLOs and PLOs to get the actual objects by their IDs
      clo_objects = {}
      for clo_id in overall_clo_performance.keys():
         clo = CourseLearningObjective.objects.get(clo_id=clo_id)
         clo_objects[clo.clo_id] = clo
      
      plo_objects = {}
      for plo_id in overall_plo_performance.keys():
         plo = ProgramLearningObjective.objects.get(plo_id=plo_id)
         plo_objects[plo.plo_id] = plo
      # Construct CLO → PLO mappings dictionary using the junction table with actual objects
      clo_plo_mappings = {}
      for clo_id, clo in clo_objects.items():
         # Get the mapped PLOs from the junction table
         mapped_plos = PLOCLOMapping.objects.filter(clo_id=clo_id).values_list("plo_id", flat=True)
         # Store the PLO objects in the dictionary
         clo_plo_mappings[clo] = []
         for plo_id in mapped_plos:
               if plo_id in plo_objects:
                  clo_plo_mappings[clo].append(plo_objects[plo_id])
      # STOP  - Get All CLOs and What PLOs They Correspond To
      
      # START - PLOs For This Course
      plos = ProgramLearningObjective.objects.filter( plo_id__in=[plo.plo_id for clo in clo_plo_mappings.values() for plo in clo] ) # Fetch only PLOs relevant to the class
      # STOP  - PLOs For This Course
      
      # START - Get All CLOs and What Types of Evaluation Instruments They Used
         # Query CLOs and their associated evaluation instrument types
      clo_evaluation_types = defaultdict(set)
         # This algorithm right here is O(n^4), quite possibly the worst algorithm I've ever written.
      for section in sections:
         evaluation_instruments = EvaluationInstrument.objects.filter(section=section)
         for instrument in evaluation_instruments:
            embedded_tasks = EmbeddedTask.objects.filter(evaluation_instrument=instrument)
            for task in embedded_tasks:
                  task_clo_mappings = TaskCLOMapping.objects.filter(task=task)
                  for mapping in task_clo_mappings:
                     clo_evaluation_types[mapping.clo.designation].add(instrument.evaluation_type)
      clo_evaluation_types = {clo: list(types) for clo, types in clo_evaluation_types.items()}
      print(f"CLOs to Types: {clo_evaluation_types}")
      # STOP  - Get All CLOs and What Types of Evaluation Instruments They Used
      
      # Generate graphs
      plo_graph_path = self.create_bar_chart(plo_performance_with_designations, "PLO Performance", "PLOs", "Average Score")
      clo_graph_path = self.create_bar_chart(clo_performance_with_designations, "CLO Performance", "CLOs", "Average Score")
      box_plot_path = self.create_box_plot_for_sections(sections)
      
      # Create and return PDF
      pdf_path = self.generate_pdf(course, sections, program_names, plos, clo_plo_mappings, clo_evaluation_types, overall_avg_grade, clo_graph_path, plo_graph_path, box_plot_path)
      return FileResponse(open(pdf_path, "rb"), as_attachment=True, filename="Course_Performance.pdf")
   
   def calculate_average_student_grade(self, sections):
      """
      Calculate the overall average student grade (normalized) across all sections in the course.
      """
      student_total_scores = defaultdict(lambda: [0, 0])  # {student_email: [total_score, total_possible]}
      
      for section in sections:
         # Get all student task mappings for the section
         student_scores = StudentTaskMapping.objects.filter(task__evaluation_instrument__section=section)
         
         # Accumulate normalized scores per student
         for entry in student_scores:
               student_total_scores[entry.student.email][0] += entry.score
               student_total_scores[entry.student.email][1] += entry.total_possible_score
      
      # Compute each student's overall average, then average those
      student_averages = [
         (total_score / total_possible) * 100  # Convert to percentage
         for total_score, total_possible in student_total_scores.values()
         if total_possible > 0
      ]
      
      return sum(student_averages) / len(student_averages) if student_averages else 0
      
   def generate_clo_performance(self, section):
      """
      Generate the CLO performance for a single section, ensuring normalized scores.
      """
      # Step 1: Get all Evaluation Instruments for the given section
      evaluation_instruments = EvaluationInstrument.objects.filter(section=section)
      
      # Step 2: Get all Embedded Tasks from these Evaluation Instruments
      embedded_tasks = EmbeddedTask.objects.filter(evaluation_instrument__in=evaluation_instruments)
      
      # Step 3: Compute **normalized** average score for each embedded task
      task_avg_scores = {}
      for task in embedded_tasks:
         task_scores = StudentTaskMapping.objects.filter(task=task).values_list("score", "total_possible_score")
         
         # Normalize each individual score
         normalized_scores = [(score / total) * 100 for score, total in task_scores if total > 0]
         
         # Compute the average normalized score for the task
         avg_normalized_score = sum(normalized_scores) / len(normalized_scores) if normalized_scores else 0
         task_avg_scores[task.embedded_task_id] = avg_normalized_score
      
      # Step 4: Get all TaskCLOMapping records for these embedded tasks
      task_clo_mappings = TaskCLOMapping.objects.filter(task__in=embedded_tasks)
      
      # Step 5: Group normalized task scores by CLO
      clo_scores = defaultdict(list)
      for mapping in task_clo_mappings:
         avg_score = task_avg_scores.get(mapping.task.embedded_task_id, 0)
         clo_id = mapping.clo.clo_id
         clo_scores[clo_id].append(avg_score)
      
      # Step 6: Calculate the average score per CLO
      final_clo_performance = {
         clo_id: sum(scores) / len(scores) if scores else 0
         for clo_id, scores in clo_scores.items()
      }
      
      return final_clo_performance
   
   def generate_course_clo_performance(self, sections):
      """
      Generate the CLO performance for all sections in the course.
      """
      all_clo_scores = defaultdict(list)
      
      for section in sections:
            # Get CLO performance for the individual section
            section_clo_performance = self.generate_clo_performance(section)
            for clo_id, score in section_clo_performance.items():
               all_clo_scores[clo_id].append(score)
      
      # Compute average CLO performance for the entire course
      final_clo_performance = {
            clo_id: sum(scores) / len(scores) if scores else 0
            for clo_id, scores in all_clo_scores.items()
      }
      
      return final_clo_performance
   
   def generate_course_plo_performance(self, sections):
      """
      Generate the PLO performance for all sections in the course.
      """
      # Get CLO performance for the entire course
      all_clo_performance = self.generate_course_clo_performance(sections)
      clo_ids = all_clo_performance.keys()
      
      all_plo_scores = defaultdict(list)
      
      # Get PLO performance for each CLO
      clo_plo_mappings = PLOCLOMapping.objects.filter(clo__clo_id__in=clo_ids)
      for mapping in clo_plo_mappings:
            clo_id = mapping.clo.clo_id
            plo_id = mapping.plo.plo_id
            clo_score = all_clo_performance.get(clo_id, 0)
            all_plo_scores[plo_id].append(clo_score)
      
      # Compute average PLO performance for the entire course
      final_plo_performance = {
            plo_id: sum(scores) / len(scores) if scores else 0
            for plo_id, scores in all_plo_scores.items()
      }
      
      return final_plo_performance
   
   def create_bar_chart(self, data, title, xlabel, ylabel):
      """
      Generate a bar chart and save it as an image file.
      """
      plt.figure(figsize=(6, 4))
      plt.bar(data.keys(), data.values(), color='#2b7fff')  # Deeper blue color
      plt.xlabel(xlabel)
      plt.ylabel(ylabel)
      plt.ylim(0, 100)  # Set y-axis range from 0 to 100
      plt.title(title)
      plt.xticks(rotation=0)
      
      img_path = f"/tmp/{title.replace(' ', '_')}.png"
      plt.savefig(img_path, bbox_inches='tight')
      plt.close()
      return img_path
   
   def create_box_plot_for_sections(self, sections):
      """
      Generate a box plot for student average grades (normalized) across all tasks in each section.
      If no data is available, generate an empty box plot instead of returning None.
      """
      section_averages = []  # Store student averages per section for a true box plot
      valid_sections = []  # List to store sections with data
      
      for idx, section in enumerate(sections):  # Use enumerate to track the index
         student_scores = defaultdict(list)
      
         # Fetch scores and total possible scores for each student grouped by student email
         for entry in StudentTaskMapping.objects.filter(task__evaluation_instrument__section=section):
               if entry.total_possible_score:  # Avoid division by zero
                  normalized_score = entry.score / entry.total_possible_score  # Normalize the score
                  student_scores[entry.student.email].append(normalized_score)
         
         # Compute average normalized score per student
         student_avg_scores = [
               sum(scores) / len(scores) for scores in student_scores.values()
         ]
         
         if student_avg_scores:  # Ensure section has data
               section_averages.append([avg * 100 for avg in student_avg_scores])  # Convert to percentage
               valid_sections.append(f"Section {idx + 1}")  # Use idx to get the section number
      
      img_path = "/tmp/box_plot.png"
      plt.figure(figsize=(8, 5))
      
      if section_averages:  
         boxplot = plt.boxplot(section_averages, vert=True, patch_artist=True)
         
         # Style Stuff
         for box in boxplot['boxes']:
               box.set(facecolor='#2b7fff')  # Deep navy blue box background
         
         for median in boxplot['medians']:
               median.set(linewidth=3, color='#f82001')  # Thicker median line
         
         plt.xticks(range(1, len(valid_sections) + 1), valid_sections)
         plt.ylabel("Average Grade (%)")
         plt.ylim(0, 100)  # Ensure y-axis runs from 0% to 100%
         plt.title("Student Average Grade Distribution by Section")
      
      else:  # If there's no data, create an empty plot with a message
         plt.text(0.5, 0.5, "No Data Available", fontsize=14, ha='center', va='center', transform=plt.gca().transAxes)
         plt.xticks([])
         plt.yticks([])
         plt.box(False)
         plt.title("Student Average Grade Distribution by Section")
      
      plt.xlabel("Sections")
      
      plt.savefig(img_path, bbox_inches='tight')
      plt.close()
      
      return img_path
   
   def generate_pdf(self, course, sections, program_names, program_learning_objectives, clo_plo_mappings, clo_evaluation_types, avg_grade, clo_graph, plo_graph, box_plot):
      """
      Generate a PDF report containing the course performance data and graphs.
      """
      pdf_path = "/tmp/Course_Performance.pdf"
      doc = SimpleDocTemplate(pdf_path, pagesize=letter)
      
      elements = []
      styles = getSampleStyleSheet()
      
      # Create a new style based on Heading1 and center align it.
      centered_title_style = ParagraphStyle(
         name='CenteredHeading1',
         parent=styles['Heading1'],
         alignment=TA_CENTER  # Set alignment to center
      )
      
      width, height = letter
      
      # Path to the static images
      dsu_logo_justwords_image_path = os.path.join(settings.BASE_DIR, "api", "static", "images", "DSU_Logo_JustWords.png")
      pemacs_logo_long_image_path = os.path.join(settings.BASE_DIR, "api", "static", "images", "PEMaCS_Logo_LongStandard.jpg")
      
      # Check if both images exist, then make a table to make them inline with each other at the top of the document
      if os.path.exists(dsu_logo_justwords_image_path) and os.path.exists(pemacs_logo_long_image_path):
         dsu_logo = Image(dsu_logo_justwords_image_path, width=3*inch, height=1*inch)
         pemacs_logo_long = Image(pemacs_logo_long_image_path, width=4*inch, height=1.2*inch)
         
         # Adjust column widths to match image sizes
         logo_table = Table(
            [[dsu_logo, pemacs_logo_long]], 
            colWidths=[3.2*inch, 4.2*inch]  # Make the first column wide enough
         )
         # Apply table styling
         logo_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),  # Center vertically
            ('ALIGN', (0, 0), (0, 0), 'LEFT'),       # Align DSU logo to left
            ('ALIGN', (1, 0), (1, 0), 'LEFT'),       # Align PEMaCS logo to left
            ('LEFTPADDING', (0, 0), (0, 0), 0),      # Remove extra left padding
            ('RIGHTPADDING', (0, 0), (0, 0), 5),     # Add space between logos
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),  # Add spacing
         ]))
         elements.append(logo_table)  # Add table to PDF
      
      # Document title using centered style
      title = Paragraph(f"Course Performance Report", centered_title_style)
      elements.append(title)
      
      # Header (Course Information)
      title = Paragraph(f"Course Information", styles['Heading2'])
      elements.append(title)
      
      # Title (Course Name) 
      course_name = Paragraph(f"{course.name} - {course.course_number}", styles['Heading3'])
      elements.append(course_name)
      
      # Description (Course Description) with wrapping
      description = Paragraph(f"{course.description}", styles['Normal'])
      elements.append(description)
      
      # Sections
      # Title with no indentation
      semester_title_style = styles['Heading4'].clone('title_style') #clone the style
      semester_title_style.leftIndent = 0
      semester_title = Paragraph("Sections Listed By Semester Designation:", semester_title_style)
      elements.append(semester_title)
      
      program_names_inline = "• "
      for program_name in program_names:
         program_names_inline += program_name
      
      sections_by_semester = defaultdict(list)
      for section in sections:
         sections_by_semester[section.semester.designation].append(section)
      
      for semester_designation in sorted(sections_by_semester, key=lambda x: int(x)):
         # Semester Heading with indentation
         semester_header_style = styles['Heading4'].clone(f'header_style_{semester_designation}') #clone the style
         semester_header_style.leftIndent = 30
         semester_header = Paragraph(f"{semester_designation}:", semester_header_style)
         elements.append(semester_header)
      
         # List sections under this semester with indentation
         for section in sections_by_semester[semester_designation]:
            section_style = styles['Normal'].clone(f'section_style_{section.crn}') #clone the style
            section_style.leftIndent = 50
            section_to_show = Paragraph(
                  f"{program_names_inline} {section.course.course_number} - {section.section_number} ({section.crn})",
                  section_style
            )
            elements.append(section_to_show)
      
      # Instructor Comment Section
      elements.append(Paragraph("Instructor Comments:", styles['Heading3']))
      elements.append(Spacer(1, 12))
      elements.append(Paragraph(
         "__________________________________________________________________________________",
         styles['Normal']
      ))
      elements.append(Spacer(1, 12))
      elements.append(Paragraph(
         "__________________________________________________________________________________",
         styles['Normal']
      ))
      elements.append(Spacer(1, 12))
      elements.append(Paragraph(
         "__________________________________________________________________________________",
         styles['Normal']
      ))
      elements.append(Spacer(1, 12))
      elements.append(Paragraph(
         "__________________________________________________________________________________",
         styles['Normal']
      ))
      elements.append(Spacer(1, 12))
      
      # START - CLO <-> PLO Mapping Table
      section_header = Paragraph(f"Course Learning Outcomes to Program Learning Outcomes Map:", styles['Heading4'])
      elements.append(section_header)
         # Create a table with CLO to PLO mappings
      table_data = []
      table_data.append(['Course Learning Outcome', 'Program Learning Outcome(s)'])  # Header row
         # Iterate through the clo_plo_mappings to populate the table data
      for clo, plos in clo_plo_mappings.items():
            # Build the list of PLO designations for each CLO
         plo_designations = ', '.join([str(plo.designation) for plo in plos])
            # Wrap CLO description text using Paragraph for text wrapping
         clo_text = f"{str(clo.designation)}. {clo.description}"
         clo_paragraph = Paragraph(clo_text, style=getSampleStyleSheet()['BodyText'])
            # Add a row to the table data
         table_data.append([clo_paragraph, plo_designations])
      # Create the table
      table = Table(table_data, colWidths=[4*inch, 2.5*inch])
         # Define table styles
      table_style = TableStyle([
         ('GRID', (0, 0), (-1, -1), 1, colors.black),  # Grid for table cells
         ('BACKGROUND', (0, 0), (-1, 0), colors.grey),  # Header row background color
         ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),  # Header row text color
         ('ALIGN', (0, 0), (-1, -1), 'CENTER'),  # Center align all text (header, initially)
         ('ALIGN', (0, 1), (0, -1), 'LEFT'),  # Left-align text in the first column (CLO descriptions)
         ('ALIGN', (1, 1), (-1, -1), 'CENTER'),  # Center-align text in the second column (PLOs)
         ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),  # Header row font
         ('BOTTOMPADDING', (0, 0), (-1, 0), 12),  # Padding for header
         ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),  # Body rows background color
         ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),  # Body rows text color
         ('TOPPADDING', (0, 1), (-1, -1), 8),  # Padding for body rows
         ('BOTTOMPADDING', (0, 1), (-1, -1), 8),  # Padding for body rows
         ('LEFTPADDING', (0, 1), (-1, -1), 6),  # Padding for left column text
         ('RIGHTPADDING', (0, 1), (-1, -1), 6),  # Padding for right column text
      ])
      table.setStyle(table_style)
         # Add the table to the document
      elements.append(table)
      # STOP  - CLO <-> PLO Mapping Table
      
      # START - PLOs Table
         # Define section header for the table
      section_header = Paragraph(f"Program Learning Objectives (PLOs):", styles['Heading4'])
      elements.append(section_header)
         # Create a table for PLOs with 'Designation' and 'Description' as headers
      table_data = []
      table_data.append(['Designation', 'Description'])  # Header row
         # Iterate through the PLOs to populate the table data
      for plo in program_learning_objectives:
         # Create a row for each PLO with its designation and description
         designation = str(plo.designation)  # Convert designation to string if it's not already
         description = str(plo.description)  # Convert description to string if it's not already
         
         # Create a paragraph for the description to ensure text wrapping
         description_paragraph = Paragraph(description, style=getSampleStyleSheet()['BodyText'])
         
         # Add the row to the table data
         table_data.append([designation, description_paragraph])
         # Create the table
      table = Table(table_data, colWidths=[1*inch, 5.5*inch])
         # Define table styles
      table_style = TableStyle([
         ('GRID', (0, 0), (-1, -1), 1, colors.black),  # Grid for table cells
         ('BACKGROUND', (0, 0), (-1, 0), colors.grey),  # Header row background color
         ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),  # Header row text color
         ('ALIGN', (0, 0), (-1, -1), 'CENTER'),  # Center align all text (header, initially)
         ('ALIGN', (0, 1), (0, -1), 'CENTER'),  # Center-align text in the first column (Designations)
         ('ALIGN', (1, 1), (-1, -1), 'LEFT'),  # Left-align text in the second column (Descriptions)
         ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),  # Header row font
         ('BOTTOMPADDING', (0, 0), (-1, 0), 12),  # Padding for header
         ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),  # Body rows background color
         ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),  # Body rows text color
         ('TOPPADDING', (0, 1), (-1, -1), 8),  # Padding for body rows
         ('BOTTOMPADDING', (0, 1), (-1, -1), 8),  # Padding for body rows
         ('LEFTPADDING', (0, 1), (-1, -1), 6),  # Padding for left column text
         ('RIGHTPADDING', (0, 1), (-1, -1), 6),  # Padding for right column text
      ])
      table.setStyle(table_style)
         # Add the table to the document
      elements.append(table)
      # STOP - PLOs Table
      
      # START - CLOs -> Evaluation Types Used
      # Define section header for the table
      section_header = Paragraph("Course Learning Objectives (CLOs) and Evaluation Types:", styles['Heading4'])
      elements.append(section_header)
      
      # Create a table for CLOs with 'CLO Designation' and 'Evaluation Types' as headers
      table_data = []
      table_data.append(['CLO Designation', 'Evaluation Types'])  # Header row
      
      # Iterate through the CLOs to populate the table data
      for clo, evaluation_types in clo_evaluation_types.items():
         clo_designation = str(clo)  # Convert designation to string
         evaluation_text = ', '.join(str(evaluation.type_name) for evaluation in evaluation_types)
         evaluation_paragraph = Paragraph(evaluation_text, styles['BodyText'])
         
         # Add the row to the table data
         table_data.append([clo_designation, evaluation_paragraph])
      
      # Create the table
      table = Table(table_data, colWidths=[1.5*inch, 5*inch])
      
      # Define table styles
      table_style = TableStyle([
         ('GRID', (0, 0), (-1, -1), 1, colors.black),  # Grid for table cells
         ('BACKGROUND', (0, 0), (-1, 0), colors.grey),  # Header row background color
         ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),  # Header row text color
         ('ALIGN', (0, 0), (-1, -1), 'CENTER'),  # Center align all text initially
         ('ALIGN', (1, 1), (-1, -1), 'LEFT'),  # Left-align text in the second column (Evaluation Types)
         ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),  # Header row font
         ('BOTTOMPADDING', (0, 0), (-1, 0), 12),  # Padding for header
         ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),  # Body rows background color
         ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),  # Body rows text color
         ('TOPPADDING', (0, 1), (-1, -1), 8),  # Padding for body rows
         ('BOTTOMPADDING', (0, 1), (-1, -1), 8),  # Padding for body rows
         ('LEFTPADDING', (0, 1), (-1, -1), 6),  # Padding for left column text
         ('RIGHTPADDING', (0, 1), (-1, -1), 6),  # Padding for right column text
      ])
      
      table.setStyle(table_style)
      
      # Add the table to the document
      elements.append(table)
      # STOP  - CLOs -> Evaluation Types Used
      
      # Overall Average Grade
      avg_grade_text = Paragraph(f"Overall Average Grade: {avg_grade:.2f}", styles['Normal'])
      elements.append(avg_grade_text)
      
      # Embed Graphs
      # PLO Performance
      plo_label = Paragraph("PLO Performance", styles['Normal'])
      elements.append(plo_label)
      plo_image = Image(plo_graph, width=4*inch, height=2.5*inch)
      elements.append(plo_image)
      # CLO Performance
      clo_label = Paragraph("CLO Performance", styles['Normal'])
      elements.append(clo_label)
      clo_image = Image(clo_graph, width=4*inch, height=2.5*inch)
      elements.append(clo_image)
      # Student Grade Box Plot
      box_plot_label = Paragraph("Student Grade Distribution", styles['Normal'])
      elements.append(box_plot_label)
      box_plot_image = Image(box_plot, width=4*inch, height=2.5*inch)
      elements.append(box_plot_image)
      
      doc.build(elements)
      
      return pdf_path
# STOP - Course



# START - ProgramCourseMapping
class ProgramCourseMappingListCreate(generics.ListCreateAPIView):
   """
   API endpoint for listing all instances of and creating a new Program Course Mapping instance.
   """
   serializer_class = ProgramCourseMappingSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   
   def get(self, request):
      program_course_mappings = ProgramCourseMapping.objects.all()
      serializer = ProgramCourseMappingSerializer(program_course_mappings, many=True)
      return Response(serializer.data)
   
   def post(self, request):
      if not request.user.is_superuser:  # Checks for superuser status
            return Response({"error": "Only superusers can create new Program Course Mappings."}, status=status.HTTP_403_FORBIDDEN)
      serializer = ProgramCourseMappingSerializer(data=request.data)
      if serializer.is_valid():  # Checks for valid serializer
         serializer.save()
         return Response(serializer.data, status=status.HTTP_201_CREATED)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProgramCourseMappingDetail(generics.RetrieveUpdateDestroyAPIView):
   """
   A view for retrieving, updating, and deleting a specific Program Course Mapping instance.
   """
   queryset = ProgramCourseMapping.objects.all()  # Define queryset for the view
   serializer_class = ProgramCourseMappingSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   lookup_field = "pk"  # Use the primary key to find the instance
   
   def get_queryset(self):
      return ProgramCourseMapping.objects.all()
   
   def perform_update(self, request, serializer):
      """
      This method is called when an update (PUT) request is made.
      It allows us to add custom behavior during the update (e.g., adding more info).
      """
      if not request.user.is_superuser:  # Checks for superuser status
         return Response({"error": "Only superusers can create new Program Course Mappings."}, status=status.HTTP_403_FORBIDDEN)
      serializer.save()
   
   def perform_destroy(self, request, instance):
      """
      This method is called when a delete (DELETE) request is made.
      We can perform any custom logic before actually deleting the instance.
      """
      if not request.user.is_superuser:  # Checks for superuser status
            return Response({"error": "Only superusers can create new Program Course Mappings."}, status=status.HTTP_403_FORBIDDEN)
      instance.delete()
# STOP - ProgramCourseMapping



# START - Semester
class SemesterListCreate(generics.ListCreateAPIView):
   """
   API endpoint for listing all instances of and creating a new Semester instance.
   """
   serializer_class = SemesterSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   
   def get(self, request):
      semesters = Semester.objects.all()
      serializer = SemesterSerializer(semesters, many=True)
      return Response(serializer.data)
   
   def post(self, request):
      if not request.user.is_superuser:  # Checks for superuser status
            return Response({"error": "Only superusers can create new Semesters."}, status=status.HTTP_403_FORBIDDEN)
      serializer = SemesterSerializer(data=request.data)
      if serializer.is_valid():  # Checks for valid serializer
         serializer.save()
         return Response(serializer.data, status=status.HTTP_201_CREATED)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SemesterDetail(generics.RetrieveUpdateDestroyAPIView):
   """
   A view for retrieving, updating, and deleting a specific Semester instance.
   """
   queryset = Semester.objects.all()  # Define queryset for the view
   serializer_class = SemesterSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   lookup_field = "pk"  # Use the primary key to find the instance
   
   def get_queryset(self, request):
      return Semester.objects.all()
   
   def perform_update(self, request, serializer):
      """
      This method is called when an update (PUT) request is made.
      It allows us to add custom behavior during the update (e.g., adding more info).
      """
      if not request.user.is_superuser:  # Checks for superuser status
         return Response({"error": "Only superusers can create new Semesters."}, status=status.HTTP_403_FORBIDDEN)
      serializer.save()
   
   def perform_destroy(self, request, instance):
      """
      This method is called when a delete (DELETE) request is made.
      We can perform any custom logic before actually deleting the instance.
      """
      if not request.user.is_superuser:  # Checks for superuser status
            return Response({"error": "Only superusers can create new Semesters."}, status=status.HTTP_403_FORBIDDEN)
      instance.delete()
# STOP - Semester



# START - Section
class SectionListCreate(generics.ListCreateAPIView):
   """
   API endpoint for listing all instances of and creating a new Section instance.
   """
   serializer_class = SectionSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   
   def get(self, request):
      sections = Section.objects.all()
      serializer = SectionSerializer(sections, many=True)
      return Response(serializer.data)
   
   def post(self, request):
      serializer = SectionSerializer(data=request.data)
      if serializer.is_valid():  # Checks for valid serializer
         serializer.save()
         return Response(serializer.data, status=status.HTTP_201_CREATED)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SectionDetail(generics.RetrieveUpdateDestroyAPIView):
   """
   A view for retrieving, updating, and deleting a specific Section instance.
   """
   queryset = Section.objects.all()  # Define queryset for the view
   serializer_class = SectionSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   lookup_field = "pk"  # Use the primary key to find the instance
   
   def get_queryset(self):
      return Section.objects.all()
   
   def perform_update(self, request, serializer):
      """
      This method is called when an update (PUT) request is made.
      It allows us to add custom behavior during the update (e.g., adding more info).
      """
      serializer.save()
   
   def perform_destroy(self, request, instance):
      """
      This method is called when a delete (DELETE) request is made.
      We can perform any custom logic before actually deleting the instance.
      """
      instance.delete()

class SectionPerformance(generics.RetrieveAPIView):
   """
   This view is meant to ascertain the section performance.
   It retrieves the section based on the provided primary key (pk).
   """
   queryset = Section.objects.all()
   serializer_class = SectionSerializer
   lookup_field = "pk"
   
   def get(self, request, *args, **kwargs):
      section_id = self.kwargs.get("pk")
      
      # Check if the given section_id corresponds to a valid Section object
      try:
         section = Section.objects.get(pk=section_id)
      except Section.DoesNotExist:
         raise NotFound(detail="Section not found")
      
      # Perform necessary logic for performance report generation here
      performance_data = self.generate_performance_report(section)
      
      return Response(performance_data)
   
   def generate_clo_performance(self, section):
      # Step 1: Get all Evaluation Instruments for the given section
      evaluation_instruments = EvaluationInstrument.objects.filter(section=section)
      
      # Step 2: Get all Embedded Tasks from these Evaluation Instruments
      embedded_tasks = EmbeddedTask.objects.filter(evaluation_instrument__in=evaluation_instruments)
      
      # Step 3: Compute average score for each embedded task
      # We'll store these in a dictionary keyed by the task's primary key (embedded_task_id)
      task_avg_scores = {}
      for task in embedded_tasks:
         # Aggregate the average score from StudentTaskMapping
         avg_score = (
            StudentTaskMapping.objects.filter(task=task)
            .aggregate(avg_score=Avg("score"))["avg_score"]
         )
         
         # Aggregate the total possible score from StudentTaskMapping for the task
         total_possible_score = (
            StudentTaskMapping.objects.filter(task=task)
            .aggregate(total_possible_score=Avg("total_possible_score"))["total_possible_score"]
         )
         
         # Normalize the avg_score by total_possible_score
         normalized_avg_score = ((avg_score / total_possible_score) * 100) if total_possible_score else 0
         task_avg_scores[task.embedded_task_id] = normalized_avg_score if avg_score is not None else 0

      
      # Step 4: Get all TaskCLOMapping records for these embedded tasks.
      # This junction model links EmbeddedTasks to CourseLearningObjectives (CLOs)
      task_clo_mappings = TaskCLOMapping.objects.filter(task__in=embedded_tasks)
      
      # Step 5: Group task scores by CLO. 
      # For each mapping, retrieve the task's average score and append it to the list for that CLO.
      clo_scores = defaultdict(list)
      for mapping in task_clo_mappings:
         # mapping.task is the EmbeddedTask instance
         # mapping.clo is the related CLO instance.
         avg_score = task_avg_scores.get(mapping.task.embedded_task_id, 0)
         clo_id = mapping.clo.clo_id  # using clo_id as the primary key for CLO
         clo_scores[clo_id].append(avg_score)
      
      # Step 6: Calculate the average score per CLO
      final_clo_performance = {
         clo_id: sum(scores) / len(scores) if scores else 0
         for clo_id, scores in clo_scores.items()
      }

      return final_clo_performance
   
   def generate_plo_performance(self, section):
      # Step 1: Get CLO performance using the existing function
      clo_performance = self.generate_clo_performance(section)
      
      # Step 2: Get all CLOs from the computed performance
      clo_ids = clo_performance.keys()
      
      # Step 3: Get PLO mappings for these CLOs
      clo_plo_mappings = PLOCLOMapping.objects.filter(clo__clo_id__in=clo_ids)
      
      # Step 4: Group CLO scores by PLO
      plo_scores = defaultdict(list)
      for mapping in clo_plo_mappings:
         clo_id = mapping.clo.clo_id  # CLO ID from mapping
         plo_id = mapping.plo.plo_id  # PLO ID from mapping
         clo_score = clo_performance.get(clo_id, 0)  # Get the CLO's average score
         plo_scores[plo_id].append(clo_score)  # Append to PLO list
      
      # Step 5: Compute final PLO performance (simple average)
      final_plo_performance = {
         plo_id: sum(scores) / len(scores) if scores else 0
         for plo_id, scores in plo_scores.items()
      }
      
      return final_plo_performance
   
   def generate_performance_report(self, section):
      """
      Generate a performance report for the section.
      Instead of computing average scores per embedded task, we now
      compute the average score per CLO by using the TaskCLOMapping intermediary.
      """
      
      clo_performance = self.generate_clo_performance(section)
      
      plo_performance = self.generate_plo_performance(section)
      
      return {"section_id": section.section_id, "clo_performance": clo_performance, "plo_performance": plo_performance}

class SectionPerformanceReport(generics.RetrieveAPIView):
   """
   This view is meant to ascertain the section performance.
   It retrieves the section based on the provided primary key (pk).
   """
   queryset = Section.objects.all()
   serializer_class = SectionSerializer
   lookup_field = "pk"
   
   def get(self, request, *args, **kwargs):
      section_id = self.kwargs.get("pk")
      
      # Check if the given section_id corresponds to a valid Section object
      try:
         section = Section.objects.get(pk=section_id)
      except Section.DoesNotExist:
         raise NotFound(detail="Section not found")
      
      # Perform necessary logic for performance report generation here
      performance_data = self.generate_performance_report(section)
      
      # Compute performance metrics
      overall_plo_performance = self.generate_plo_performance(section)
      overall_clo_performance = self.generate_clo_performance(section)
      
      # START - Get All CLOs and What PLOs They Correspond To
         # Query CLOs and PLOs to get the actual objects by their IDs
      clo_objects = {}
      for clo_id in overall_clo_performance.keys():
         clo = CourseLearningObjective.objects.get(clo_id=clo_id)
         clo_objects[clo.clo_id] = clo
      
      plo_objects = {}
      for plo_id in overall_plo_performance.keys():
         plo = ProgramLearningObjective.objects.get(plo_id=plo_id)
         plo_objects[plo.plo_id] = plo
      # Construct CLO → PLO mappings dictionary using the junction table with actual objects
      clo_plo_mappings = {}
      for clo_id, clo in clo_objects.items():
         # Get the mapped PLOs from the junction table
         mapped_plos = PLOCLOMapping.objects.filter(clo_id=clo_id).values_list("plo_id", flat=True)
         # Store the PLO objects in the dictionary
         clo_plo_mappings[clo] = []
         for plo_id in mapped_plos:
               if plo_id in plo_objects:
                  clo_plo_mappings[clo].append(plo_objects[plo_id])
      # STOP  - Get All CLOs and What PLOs They Correspond To
      print("CLO-PLO Mappings: ", clo_plo_mappings)
      
      # START - Get PLO & CLO Performance with Designations
         # Query CLOs and PLOs to get designations
      clo_designations = {}
      plo_designations = {}
      
      for clo_id in overall_clo_performance.keys():
         clo = CourseLearningObjective.objects.get(pk=clo_id) 
         clo_designations[clo_id] = clo.designation
      
      for plo_id in overall_plo_performance.keys():
         plo = ProgramLearningObjective.objects.get(pk=plo_id) 
         plo_designations[plo_id] = plo.designation
      # Replace PK IDs with designations in performance dictionaries
      clo_performance_with_designations = {
         clo_designations[clo_id]: value
         for clo_id, value in overall_clo_performance.items()
      }
      plo_performance_with_designations = {
         plo_designations[plo_id]: value
         for plo_id, value in overall_plo_performance.items()
      }
      # STOP  - Get PLO & CLO Performance with Designations
      
      # Generate graphs
      plo_graph_path = self.create_bar_chart(plo_performance_with_designations, "PLO Performance", "PLOs", "Average Score")
      clo_graph_path = self.create_bar_chart(clo_performance_with_designations, "CLO Performance", "CLOs", "Average Score")
      box_plot_path = self.create_box_plot_for_section(section)
      
      # Generate PDF
      pdf_path = self.generate_pdf(performance_data, section, clo_plo_mappings, clo_graph_path, plo_graph_path, box_plot_path)
      
      return FileResponse(open(pdf_path, "rb"), as_attachment=True, filename="Section_Performance.pdf")
   
   def generate_clo_performance(self, section):
      # Step 1: Get all Evaluation Instruments for the given section
      evaluation_instruments = EvaluationInstrument.objects.filter(section=section)
      
      # Step 2: Get all Embedded Tasks from these Evaluation Instruments
      embedded_tasks = EmbeddedTask.objects.filter(evaluation_instrument__in=evaluation_instruments)
      
      # Step 3: Compute average score for each embedded task
      # We'll store these in a dictionary keyed by the task's primary key (embedded_task_id)
      task_avg_scores = {}
      for task in embedded_tasks:
         # Aggregate the average score from StudentTaskMapping
         avg_score = (
            StudentTaskMapping.objects.filter(task=task)
            .aggregate(avg_score=Avg("score"))["avg_score"]
         )
         
         # Aggregate the total possible score from StudentTaskMapping for the task
         total_possible_score = (
            StudentTaskMapping.objects.filter(task=task)
            .aggregate(total_possible_score=Avg("total_possible_score"))["total_possible_score"]
         )
         
         # Normalize the avg_score by total_possible_score
         normalized_avg_score = ((avg_score / total_possible_score) * 100) if total_possible_score else 0
         task_avg_scores[task.embedded_task_id] = normalized_avg_score if avg_score is not None else 0
   
      
      # Step 4: Get all TaskCLOMapping records for these embedded tasks.
      # This junction model links EmbeddedTasks to CourseLearningObjectives (CLOs)
      task_clo_mappings = TaskCLOMapping.objects.filter(task__in=embedded_tasks)
      
      # Step 5: Group task scores by CLO. 
      # For each mapping, retrieve the task's average score and append it to the list for that CLO.
      clo_scores = defaultdict(list)
      for mapping in task_clo_mappings:
         # mapping.task is the EmbeddedTask instance
         # mapping.clo is the related CLO instance.
         avg_score = task_avg_scores.get(mapping.task.embedded_task_id, 0)
         clo_id = mapping.clo.clo_id  # using clo_id as the primary key for CLO
         clo_scores[clo_id].append(avg_score)
      
      # Step 6: Calculate the average score per CLO
      final_clo_performance = {
         clo_id: sum(scores) / len(scores) if scores else 0
         for clo_id, scores in clo_scores.items()
      }
   
      return final_clo_performance
   
   def generate_plo_performance(self, section):
      # Step 1: Get CLO performance using the existing function
      clo_performance = self.generate_clo_performance(section)
      
      # Step 2: Get all CLOs from the computed performance
      clo_ids = clo_performance.keys()
      
      # Step 3: Get PLO mappings for these CLOs
      clo_plo_mappings = PLOCLOMapping.objects.filter(clo__clo_id__in=clo_ids)
      
      # Step 4: Group CLO scores by PLO
      plo_scores = defaultdict(list)
      for mapping in clo_plo_mappings:
         clo_id = mapping.clo.clo_id  # CLO ID from mapping
         plo_id = mapping.plo.plo_id  # PLO ID from mapping
         clo_score = clo_performance.get(clo_id, 0)  # Get the CLO's average score
         plo_scores[plo_id].append(clo_score)  # Append to PLO list
      
      # Step 5: Compute final PLO performance (simple average)
      final_plo_performance = {
         plo_id: sum(scores) / len(scores) if scores else 0
         for plo_id, scores in plo_scores.items()
      }
      
      return final_plo_performance
   
   def generate_performance_report(self, section):
      """
      Generate a performance report for the section.
      """
      clo_performance = self.generate_clo_performance(section)
      plo_performance = self.generate_plo_performance(section)
      return {"section_id": section.section_id, "clo_performance": clo_performance, "plo_performance": plo_performance}
   
   def create_bar_chart(self, data, title, xlabel, ylabel):
      """
      Generate a bar chart and save it as an image file.
      """
      plt.figure(figsize=(6, 4))
      plt.bar(data.keys(), data.values(), color='#2b7fff')  # Deeper blue color
      plt.xlabel(xlabel)
      plt.ylabel(ylabel)
      plt.ylim(0, 100)  # Set y-axis range from 0 to 100
      plt.title(title)
      plt.xticks(rotation=0)
      
      img_path = f"/tmp/{title.replace(' ', '_')}.png"
      plt.savefig(img_path, bbox_inches='tight')
      plt.close()
      return img_path
   
   def create_box_plot_for_section(self, section):
      """
      Generate a box plot for student average grades (normalized) in a given section.
      If no data is available, generate an empty box plot instead of returning None.
      """
      student_scores = defaultdict(list)
      
      # Fetch scores and total possible scores for each student grouped by student email
      for entry in StudentTaskMapping.objects.filter(task__evaluation_instrument__section=section):
         if entry.total_possible_score:  # Avoid division by zero
               normalized_score = entry.score / entry.total_possible_score  # Normalize the score
               student_scores[entry.student.email].append(normalized_score)
      
      # Compute average normalized score per student
      student_avg_scores = [
         sum(scores) / len(scores) for scores in student_scores.values()
      ]
      
      img_path = "/tmp/box_plot.png"
      plt.figure(figsize=(6, 5))  # Adjusted size for a single section
      
      if student_avg_scores:  # Ensure section has data
         section_averages = [avg * 100 for avg in student_avg_scores]  # Convert to percentage
         boxplot = plt.boxplot(section_averages, vert=True, patch_artist=True)
         
         # Style Stuff
         for box in boxplot['boxes']:
            box.set(facecolor='#2b7fff')  # Deep navy blue box background
         
         for median in boxplot['medians']:
            median.set(linewidth=3, color='#f82001')  # Thicker median line
         
         plt.xticks([])  # Remove x-axis ticks completely
         plt.xlabel("")
         plt.ylabel("Average Grade (%)")
         plt.ylim(0, 100)  # Ensure y-axis runs from 0% to 100%
         plt.title(f"Student Average Grade Distribution")
      
      else:  # If there's no data, create an empty plot with a message
         plt.text(0.5, 0.5, "No Data Available", fontsize=14, ha='center', va='center', transform=plt.gca().transAxes)
         plt.xticks([])
         plt.yticks([])
         plt.box(False)
         plt.title(f"Student Average Grade Distribution")
      
      plt.xlabel("Section")
      
      plt.savefig(img_path, bbox_inches='tight')
      plt.close()
      
      return img_path
   
   def generate_pdf(self, performance_data, section, clo_plo_mappings, clo_graph, plo_graph, box_plot):
      """
      Generate a PDF from the performance data using ReportLab, saving to a file.
      """
      pdf_path = "/tmp/Section_Performance.pdf"
      doc = SimpleDocTemplate(pdf_path, pagesize=letter)
      styles = getSampleStyleSheet()
      elements = []
      
      # Path to the static images
      dsu_logo_justwords_image_path = os.path.join(settings.BASE_DIR, "api", "static", "images", "DSU_Logo_JustWords.png")
      pemacs_logo_long_image_path = os.path.join(settings.BASE_DIR, "api", "static", "images", "PEMaCS_Logo_LongStandard.jpg")
      
      # Check if both images exist, then make a table to make them inline with each other at the top of the document
      if os.path.exists(dsu_logo_justwords_image_path) and os.path.exists(pemacs_logo_long_image_path):
         dsu_logo = Image(dsu_logo_justwords_image_path, width=3*inch, height=1*inch)
         pemacs_logo_long = Image(pemacs_logo_long_image_path, width=4*inch, height=1.2*inch)
         
         # Adjust column widths to match image sizes
         logo_table = Table(
            [[dsu_logo, pemacs_logo_long]], 
            colWidths=[3.2*inch, 4.2*inch]  # Make the first column wide enough
         )
         # Apply table styling
         logo_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),  # Center vertically
            ('ALIGN', (0, 0), (0, 0), 'LEFT'),       # Align DSU logo to left
            ('ALIGN', (1, 0), (1, 0), 'LEFT'),       # Align PEMaCS logo to left
            ('LEFTPADDING', (0, 0), (0, 0), 0),      # Remove extra left padding
            ('RIGHTPADDING', (0, 0), (0, 0), 5),     # Add space between logos
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),  # Add spacing
         ]))
         elements.append(logo_table)  # Add table to PDF
      
      elements.append(Paragraph("Section Performance Report", styles['Title']))
      elements.append(Spacer(1, 12))
      elements.append(Paragraph(f"{section.course.name} #{section.section_number} ({section.crn}) | Semester: {section.semester.designation}", styles['Heading2']))
      elements.append(Spacer(1, 4))
      
      # Description (Course Description) with wrapping
      description = Paragraph(f"{section.course.description}", styles['Normal'])
      elements.append(description)
      
      # Instructor Comment Section
      elements.append(Paragraph("Instructor Comments:", styles['Heading3']))
      elements.append(Spacer(1, 12))
      elements.append(Paragraph(
         "__________________________________________________________________________________",
         styles['Normal']
      ))
      elements.append(Spacer(1, 12))
      elements.append(Paragraph(
         "__________________________________________________________________________________",
         styles['Normal']
      ))
      elements.append(Spacer(1, 12))
      elements.append(Paragraph(
         "__________________________________________________________________________________",
         styles['Normal']
      ))
      elements.append(Spacer(1, 12))
      elements.append(Paragraph(
         "__________________________________________________________________________________",
         styles['Normal']
      ))
      elements.append(Spacer(1, 12))
      
      # START - CLO <-> PLO Mapping Table
      section_header = Paragraph(f"Course Learning Outcomes to Program Learning Outcomes Map:", styles['Heading4'])
      elements.append(section_header)
         # Create a table with CLO to PLO mappings
      table_data = []
      table_data.append(['Course Learning Outcome', 'Program Learning Outcome(s)'])  # Header row
         # Iterate through the clo_plo_mappings to populate the table data
      for clo, plos in clo_plo_mappings.items():
            # Build the list of PLO designations for each CLO
         plo_designations = ', '.join([str(plo.designation) for plo in plos])
            # Wrap CLO description text using Paragraph for text wrapping
         clo_text = f"{str(clo.designation)}. {clo.description}"
         clo_paragraph = Paragraph(clo_text, style=getSampleStyleSheet()['BodyText'])
            # Add a row to the table data
         table_data.append([clo_paragraph, plo_designations])
      # Create the table
      table = Table(table_data, colWidths=[4*inch, 2.5*inch])
         # Define table styles
      table_style = TableStyle([
         ('GRID', (0, 0), (-1, -1), 1, colors.black),  # Grid for table cells
         ('BACKGROUND', (0, 0), (-1, 0), colors.grey),  # Header row background color
         ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),  # Header row text color
         ('ALIGN', (0, 0), (-1, -1), 'CENTER'),  # Center align all text (header, initially)
         ('ALIGN', (0, 1), (0, -1), 'LEFT'),  # Left-align text in the first column (CLO descriptions)
         ('ALIGN', (1, 1), (-1, -1), 'CENTER'),  # Center-align text in the second column (PLOs)
         ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),  # Header row font
         ('BOTTOMPADDING', (0, 0), (-1, 0), 12),  # Padding for header
         ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),  # Body rows background color
         ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),  # Body rows text color
         ('TOPPADDING', (0, 1), (-1, -1), 8),  # Padding for body rows
         ('BOTTOMPADDING', (0, 1), (-1, -1), 8),  # Padding for body rows
         ('LEFTPADDING', (0, 1), (-1, -1), 6),  # Padding for left column text
         ('RIGHTPADDING', (0, 1), (-1, -1), 6),  # Padding for right column text
      ])
      table.setStyle(table_style)
         # Add the table to the document
      elements.append(table)
      # STOP  - CLO <-> PLO Mapping Table
      
      # CLO Performance Table with designations
      elements.append(Paragraph("CLO Performance", styles['Heading3']))
      clo_data = [["CLO", "Average Score"]]  # Header row
      
      # Define a style for wrapping text at 200 characters
      clo_style = ParagraphStyle(
         "CLOStyle",
         parent=styles["Normal"],
         wordWrap="CJK",  # Ensures text wraps properly
         maxLineLength=200  # This indirectly helps keep the text within bounds
      )
      
      for clo_id, score in performance_data['clo_performance'].items():
         # Query the CourseLearningObjectives model to get the CLO designation based on the clo_id
         try:
            clo = CourseLearningObjective.objects.get(clo_id=clo_id)  # Fetch the CLO by its id
            clo_designation = clo.designation  # Grab designation
            clo_description = clo.description  # Grab description
         except CourseLearningObjective.DoesNotExist:
            clo_designation = "Unknown CLO"
            clo_description = "No description available"
         
         # Create a wrapped paragraph for the CLO column
         clo_text = Paragraph(f"<b>{clo_designation}:</b> {clo_description}", clo_style)
         
         clo_data.append([clo_text, f"{score:.2f}%"])  # Append wrapped text
      
      clo_table = Table(clo_data, colWidths=[350, 100])  # Adjust width as needed
      
      clo_table.setStyle(TableStyle([
         ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
         ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
         ('ALIGN', (0, 0), (0, -1), 'LEFT'),  # Left-align CLO column
         ('ALIGN', (1, 0), (1, -1), 'CENTER'),  # Center-align score column
         ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
         ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
         ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
         ('GRID', (0, 0), (-1, -1), 1, colors.black)
      ]))
      
      elements.append(clo_table)
      
      # PLO Performance Table with designations
      elements.append(Paragraph("PLO Performance", styles['Heading3']))
      plo_data = [["PLO", "Average Score"]]  # Header row
      
      # Define a style for wrapping text at 200 characters
      plo_style = ParagraphStyle(
         "PLOStyle",
         parent=styles["Normal"],
         wordWrap="CJK",  # Ensures text wraps properly
         maxLineLength=200  # Helps keep the text contained within the cell
      )
      
      for plo_id, score in performance_data['plo_performance'].items():
         # Query the ProgramLearningObjective model to get the PLO designation
         try:
            plo = ProgramLearningObjective.objects.get(plo_id=plo_id)  # Fetch the PLO by its id
            plo_designation = plo.designation  # Get designation
            plo_description = plo.description  # Get description
         except ProgramLearningObjective.DoesNotExist:
            plo_designation = "Unknown PLO"
            plo_description = "No description available"
         
         # Create a wrapped paragraph for the PLO column
         plo_text = Paragraph(f"<b>{plo_designation}:</b> {plo_description}", plo_style)
         
         plo_data.append([plo_text, f"{score:.2f}%"])  # Append formatted text
      
      plo_table = Table(plo_data, colWidths=[350, 100])  # Adjust width as needed
      
      plo_table.setStyle(TableStyle([
         ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
         ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
         ('ALIGN', (0, 0), (0, -1), 'LEFT'),  # Left-align PLO column
         ('ALIGN', (1, 0), (1, -1), 'CENTER'),  # Center-align score column
         ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
         ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
         ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
         ('GRID', (0, 0), (-1, -1), 1, colors.black)
      ]))
      
      elements.append(plo_table)
      
      # Embed Graphs
      # PLO Performance
      plo_label = Paragraph("PLO Performance", styles['Normal'])
      elements.append(plo_label)
      plo_image = Image(plo_graph, width=4*inch, height=2.5*inch)
      elements.append(plo_image)
      # CLO Performance
      clo_label = Paragraph("CLO Performance", styles['Normal'])
      elements.append(clo_label)
      clo_image = Image(clo_graph, width=4*inch, height=2.5*inch)
      elements.append(clo_image)
      # Student Grade Box Plot
      box_plot_label = Paragraph("Student Grade Distribution", styles['Normal'])
      elements.append(box_plot_label)
      box_plot_image = Image(box_plot, width=4*inch, height=2.5*inch)
      elements.append(box_plot_image)

      doc.build(elements)
      return pdf_path # Return the path to the created PDF
# STOP - Section



# START - EvaluationType
class EvaluationTypeListCreate(generics.ListCreateAPIView):
   """
   XAPI endpoint for listing all instances of and creating a new Evaluation Type instance.
   """
   serializer_class = EvaluationTypeSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   
   def get(self, request):
      evaluation_types = EvaluationType.objects.all()
      serializer = EvaluationTypeSerializer(evaluation_types, many=True)
      return Response(serializer.data)
   
   def post(self, request):
      if not request.user.is_superuser:  # Checks for superuser status
            return Response({"error": "Only superusers can create new Evaluation Types."}, status=status.HTTP_403_FORBIDDEN)
      serializer = EvaluationTypeSerializer(data=request.data)
      if serializer.is_valid():  # Checks for valid serializer
         serializer.save()
         return Response(serializer.data, status=status.HTTP_201_CREATED)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EvaluationTypeDetail(generics.RetrieveUpdateDestroyAPIView):
   """
   A view for retrieving, updating, and deleting a specific Evaluation Types instance.
   """
   queryset = EvaluationType.objects.all()  # Define queryset for the view
   serializer_class = EvaluationTypeSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   lookup_field = "pk"  # Use the primary key to find the instance
   
   def get_queryset(self, request):
      return EvaluationType.objects.all()
   
   def perform_update(self, request, serializer):
      """
      This method is called when an update (PUT) request is made.
      It allows us to add custom behavior during the update (e.g., adding more info).
      """
      if not request.user.is_superuser:  # Checks for superuser status
         return Response({"error": "Only superusers can create new Evaluation Types."}, status=status.HTTP_403_FORBIDDEN)
      serializer.save()
   
   def perform_destroy(self, request, instance):
      """
      This method is called when a delete (DELETE) request is made.
      We can perform any custom logic before actually deleting the instance.
      """
      if not request.user.is_superuser:  # Checks for superuser status
            return Response({"error": "Only superusers can create new Evaluation Types."}, status=status.HTTP_403_FORBIDDEN)
      instance.delete()
# STOP - AssignmentTemplate



# START - EvaluationInstrument
class EvaluationInstrumentListCreate(generics.ListCreateAPIView):
   """
   API endpoint for listing all instances of and creating a new Evaluation Instrument instance.
   """
   serializer_class = EvaluationInstrumentSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   
   def get(self, request):
      evaluation_instruments = EvaluationInstrument.objects.all()
      serializer = EvaluationInstrumentSerializer(evaluation_instruments, many=True)
      return Response(serializer.data)
   
   def post(self, request):
      data = request.data
      instrument_info = data.get('instrumentInfo')
      clo_mappings = data.get('cloMappings')
      students = data.get('students')
      tasks = data.get('tasks')
      
      if not instrument_info or not clo_mappings or not students:
         return Response({"error": "Missing required fields: instrumentInfo, cloMappings, or students."}, status=status.HTTP_400_BAD_REQUEST)
      
      try:
         with transaction.atomic():  # Use transaction to ensure that nothing is saved if any part of the process fails
               print("\n" + "Step 1:")
               # Step 1: Create Evaluation Instrument
               instrument_data = {
                  "section" : instrument_info.get("section"),
                  "name": instrument_info.get("name"),
                  "description": instrument_info.get("description"),
                  "evaluation_type": instrument_info.get("evaluation_type"),
               }
               instrument_serializer = EvaluationInstrumentSerializer(data=instrument_data)
               if not instrument_serializer.is_valid():
                  transaction.set_rollback(True)
                  return Response(instrument_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
               instrument = instrument_serializer.save()
               
               # TESTING ONLY: Print out each task to check the contents of them and
               # why they ain't getting created twin
               print("\n" + "Step 2:")
               for task in tasks: 
                  task["evaluation_instrument"] = instrument.evaluation_instrument_id # Add the evaluation instrument to each task (bc we must make a relationship there using the PK for the FK)
                  print("Task: ", task)
               
               # Step 2: Create Tasks for the Instrument
               task_id_map = {}
               for task_data in tasks:  
                  task_serializer = EmbeddedTaskSerializer(data=task_data)
                  if task_serializer.is_valid():
                     task = task_serializer.save(evaluation_instrument=instrument)
                     task_id_map[task_data["task_number"]] = task.embedded_task_id  # Store task ID using task number
                  else:
                     transaction.set_rollback(True)
                     return Response(task_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
               print("\n", "Step 2 has finished. task_id_map: ", task_id_map)
               
               print("\n", "Step 3 has started...", end="\n")
               # Step 3: Create CLO Mappings for each Task
               task_clo_mapping_list = [] # USED ONLY FOR TESTING!!!
               for mapping_data in clo_mappings:
                  task_number = mapping_data.get("task_number")  # Make sure this is the correct key
                  clo_ids = mapping_data.get("cloIds")  # List of CLO IDs to map
                  if task_number not in task_id_map:
                     transaction.set_rollback(True)
                     return Response({"error": f"Task {task_number} does not exist."}, status=status.HTTP_400_BAD_REQUEST)
                  task = EmbeddedTask.objects.get(embedded_task_id=task_id_map[task_number])
                  
                  for clo_id in clo_ids:
                     try:
                           clo = CourseLearningObjective.objects.get(clo_id=clo_id)
                           TaskCLOMapping.objects.create(task=task, clo=clo)
                           task_clo_mapping_list.append((task, clo)) # Append the tuple obj to the list for viewing during testing
                     except CourseLearningObjective.DoesNotExist:
                           transaction.set_rollback(True)
                           return Response({"error": f"CLO with ID {clo_id} does not exist."}, status=status.HTTP_400_BAD_REQUEST)
               print("\n", "Step 3 has ended. Produced: ", task_clo_mapping_list, end="\n")
               
               print("\n" + "Step 4 has started", end="\n")
               # Step 4: Create Student Objects if they do not exist
               student_objects = []
               for student_data in students:                  
                  # Extract only the useful data from student_data
                  filtered_student_data = {
                     'email': student_data.get('username', ''),  # assuming username is the d_number
                     'first_name': student_data.get('firstName', ''),
                     'last_name': student_data.get('lastName', '')
                  }
                  
                  # Only proceed if the required data is valid
                  if 'email' in filtered_student_data and filtered_student_data['email']:
                     # Use get_or_create to avoid duplicates
                     student, created = Student.objects.get_or_create(
                           email=filtered_student_data['email'],
                           defaults={
                              'first_name': filtered_student_data['first_name'],
                              'last_name': filtered_student_data['last_name']
                           }
                     )
                     
                     # If not created (i.e., student already exists), no need to do anything further
                     if not created:
                           print(f"Student with email {student.email} already exists. Skipping creation.")
                     
                     student_objects.append(student)
                  else:
                     transaction.set_rollback(True)
                     return Response({'error': 'Invalid student data'}, status=status.HTTP_400_BAD_REQUEST)
               print("\n", "Step 4 has ended. Produced: ", student_objects, end="\n")
               
               # Step 5: Create Student <-> Task Mappings
               print("\n" + "Step 5: ")               
               # Iterate over each student in the 'students' data from the form
               for student_data in students:  # student_data now represents the form data, not the model object
                  print(f"Student: {student_data['username']}")  # Accessing email/username in the form data
                  
                  # Retrieve the student object using email (which is the PK of the Student table)
                  student = Student.objects.get(email=student_data['username'])
                  
                  # Iterate over each task the student has completed
                  for task_data in student_data['tasks']:  # Here task_data is from the form data
                     print(f"Task: {task_data['taskId']}")
                     
                     # Convert task_number to string to match task_id_map keys
                     task_number_str = str(task_data['taskId'])
                     
                     # Retrieve the actual task id from the task_id_map using the string key
                     task_id = task_id_map.get(task_number_str)
                     
                     if not task_id:
                           # If task_id does not exist in task_id_map, raise an error
                           raise ValueError(f"Task with task_number {task_data['task_number']} does not exist in task_id_map.")
                     
                     # Fetch the actual task using the task_id
                     task = EmbeddedTask.objects.get(embedded_task_id=task_id)  # Use the correct task_id here
                     
                     # Create the StudentTaskMapping object
                     StudentTaskMapping.objects.create(
                           student=student,  # This should be the actual student object, not just the email
                           task=task,
                           score=task_data.get('manualScore', None),  # Assuming the score is available in 'manualScore'
                           total_possible_score=task_data.get('possiblePoints', None)  # Assuming possiblePoints is available
                     )
               
               return Response(instrument_serializer.data, status=status.HTTP_201_CREATED)
      
      except Exception as e:
         return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EvaluationInstrumentDetail(generics.RetrieveUpdateDestroyAPIView):
   """
   A view for retrieving, updating, and deleting a specific Evaluation Instrument instance.
   """
   queryset = EvaluationInstrument.objects.all()  # Define queryset for the view
   serializer_class = EvaluationInstrumentSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   lookup_field = "pk"  # Use the primary key to find the instance
   
   def get_queryset(self):
      return EvaluationInstrument.objects.all()
   
   def perform_update(self, request, serializer):
      """
      This method is called when an update (PUT) request is made.
      It allows us to add custom behavior during the update (e.g., adding more info).
      """
      if not request.user.is_superuser:  # Checks for superuser status
         return Response({"error": "Only superusers can create new Evaluation Instruments."}, status=status.HTTP_403_FORBIDDEN)
      serializer.save()
   
   def destroy(self, request, *args, **kwargs):
      """
      Handles DELETE requests with optional pre-deletion logic.
      """
      instance = self.get_object()
      
      # Custom logic before deletion (uncomment if needed)
      # if not request.user.is_superuser:
      #     return Response({"error": "Only superusers can delete Evaluation Instruments."}, status=status.HTTP_403_FORBIDDEN)
      
      instance.delete()
      return Response(status=status.HTTP_204_NO_CONTENT)

class EvaluationInstrumentPerformance(generics.RetrieveAPIView):
   """
   This view retrieves the performance of a specific Evaluation Instrument.
   It calculates:
   - Task performance (avg score per task)
   - CLO performance (avg score per CLO)
   - PLO performance (avg score per PLO)
   """
   queryset = EvaluationInstrument.objects.all()
   serializer_class = EvaluationInstrumentSerializer
   lookup_field = "pk"
   
   def get(self, request, *args, **kwargs):
      instrument_id = self.kwargs.get("pk")
      
      # Validate Evaluation Instrument
      try:
         evaluation_instrument = EvaluationInstrument.objects.get(pk=instrument_id)
      except EvaluationInstrument.DoesNotExist:
         raise NotFound(detail="Evaluation Instrument not found")
      
      # Generate performance report
      performance_data = self.generate_performance_report(evaluation_instrument)
      
      return Response(performance_data)
   
   def generate_task_performance(self, evaluation_instrument):
      """
      Computes the average score for each embedded task linked to the evaluation instrument.
      """
      embedded_tasks = EmbeddedTask.objects.filter(evaluation_instrument=evaluation_instrument)
      
      task_avg_scores = {}
      for task in embedded_tasks:
         # Calculate the normalized score (score / total_possible_score)
         avg_normalized_score = (
               StudentTaskMapping.objects
               .filter(task=task)
               .annotate(normalized_score=ExpressionWrapper(
                  (F("score") / F("total_possible_score")) * 100, output_field=FloatField() # Normalizes to 100 AND NOT TO 1!!1
               ))
               .aggregate(avg_score=Avg("normalized_score"))["avg_score"]
         )
         
         # Store the normalized average (default to 0 if None)
         task_avg_scores[task.embedded_task_id] = avg_normalized_score if avg_normalized_score is not None else 0
      
      return task_avg_scores
   
   def generate_clo_performance(self, evaluation_instrument):
      """
      Computes average score per CLO using tasks linked to the given Evaluation Instrument.
      """
      embedded_tasks = EmbeddedTask.objects.filter(evaluation_instrument=evaluation_instrument)
      
      # Get avg score per task
      task_avg_scores = self.generate_task_performance(evaluation_instrument)
      
      # Get Task-CLO mappings
      task_clo_mappings = TaskCLOMapping.objects.filter(task__in=embedded_tasks)
      
      # Aggregate scores by CLO
      clo_scores = defaultdict(list)
      for mapping in task_clo_mappings:
         clo_id = mapping.clo.clo_id
         avg_score = task_avg_scores.get(mapping.task.embedded_task_id, 0)
         clo_scores[clo_id].append(avg_score)
      
      # Compute final CLO performance
      final_clo_performance = {
         clo_id: sum(scores) / len(scores) if scores else 0
         for clo_id, scores in clo_scores.items()
      }
      
      return final_clo_performance
   
   def generate_plo_performance(self, evaluation_instrument):
      """
      Computes average score per PLO based on CLO performance.
      """
      clo_performance = self.generate_clo_performance(evaluation_instrument)
      
      clo_ids = clo_performance.keys()
      clo_plo_mappings = PLOCLOMapping.objects.filter(clo__clo_id__in=clo_ids)
      
      plo_scores = defaultdict(list)
      for mapping in clo_plo_mappings:
         plo_id = mapping.plo.plo_id
         clo_score = clo_performance.get(mapping.clo.clo_id, 0)
         plo_scores[plo_id].append(clo_score)
      
      final_plo_performance = {
         plo_id: sum(scores) / len(scores) if scores else 0
         for plo_id, scores in plo_scores.items()
      }
      
      return final_plo_performance
   
   def generate_overall_average_score(self, evaluation_instrument):
      """
      Computes the overall average score for the evaluation instrument.
      This is the average of all the task average scores.
      """
      task_performance = self.generate_task_performance(evaluation_instrument)
      
      # Calculate overall average score
      total_score = sum(task_performance.values())
      total_tasks = len(task_performance)
      
      if total_tasks > 0:
         overall_avg = total_score / total_tasks
      else:
         overall_avg = 0
      
      return overall_avg
   
   def generate_performance_report(self, evaluation_instrument):
      """
      Generates the complete performance report.
      Includes:
      - Tasks performance
      - CLO performance
      - PLO performance
      """
      task_performance = self.generate_task_performance(evaluation_instrument)
      clo_performance = self.generate_clo_performance(evaluation_instrument)
      plo_performance = self.generate_plo_performance(evaluation_instrument)
      overall_average_score = self.generate_overall_average_score(evaluation_instrument)
      
      return {
         "evaluation_instrument_id": evaluation_instrument.evaluation_instrument_id,
         "tasks": task_performance,
         "clo_performance": clo_performance,
         "plo_performance": plo_performance,
         "overall_average_score": overall_average_score
      }
# STOP - EvaluationInstrument



# START - EmbeddedTask
class EmbeddedTaskListCreate(generics.ListCreateAPIView):
   """
   API endpoint for listing all instances of and creating a new Embedded Task instance.
   """
   serializer_class = EmbeddedTaskSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   
   def get(self, request):
      embedded_tasks = EmbeddedTask.objects.all()
      serializer = EmbeddedTaskSerializer(embedded_tasks, many=True)
      return Response(serializer.data)
   
   def post(self, request):
      if not request.user.is_superuser:  # Checks for superuser status
            return Response({"error": "Only superusers can create new Embedded Tasks."}, status=status.HTTP_403_FORBIDDEN)
      serializer = EmbeddedTaskSerializer(data=request.data)
      if serializer.is_valid():  # Checks for valid serializer
         serializer.save()
         return Response(serializer.data, status=status.HTTP_201_CREATED)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EmbeddedTaskDetail(generics.RetrieveUpdateDestroyAPIView):
   """
   A view for retrieving, updating, and deleting a specific Embedded Task instance.
   """
   queryset = EmbeddedTask.objects.all()  # Define queryset for the view
   serializer_class = EmbeddedTaskSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   lookup_field = "pk"  # Use the primary key to find the instance
   
   def get_queryset(self, request):
      return EmbeddedTask.objects.all()
   
   def perform_update(self, request, serializer):
      """
      This method is called when an update (PUT) request is made.
      It allows us to add custom behavior during the update (e.g., adding more info).
      """
      if not request.user.is_superuser:  # Checks for superuser status
         return Response({"error": "Only superusers can create new Embedded Tasks."}, status=status.HTTP_403_FORBIDDEN)
      serializer.save()
   
   def perform_destroy(self, request, instance):
      """
      This method is called when a delete (DELETE) request is made.
      We can perform any custom logic before actually deleting the instance.
      """
      if not request.user.is_superuser:  # Checks for superuser status
            return Response({"error": "Only superusers can create new Embedded Tasks."}, status=status.HTTP_403_FORBIDDEN)
      instance.delete()
# STOP - EmbeddedTask



# START - CourseLearningObjective
class CourseLearningObjectiveListCreate(generics.ListCreateAPIView):
   """
   API endpoint for listing all instances of and creating a new Course Learning Objective instance.
   """
   serializer_class = CourseLearningObjectiveSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   
   def get(self, request):
      course_learning_objectives = CourseLearningObjective.objects.all()
      serializer = CourseLearningObjectiveSerializer(course_learning_objectives, many=True)
      return Response(serializer.data)
   
   def post(self, request):
      if not request.user.is_superuser:  # Checks for superuser status
            return Response({"error": "Only superusers can create new Course Learning Objectives."}, status=status.HTTP_403_FORBIDDEN)
      serializer = CourseLearningObjectiveSerializer(data=request.data)
      if serializer.is_valid():  # Checks for valid serializer
         serializer.save()
         return Response(serializer.data, status=status.HTTP_201_CREATED)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CourseLearningObjectiveDetail(generics.RetrieveUpdateDestroyAPIView):
   """
   A view for retrieving, updating, and deleting a specific Embedded Task instance.
   """
   queryset = CourseLearningObjective.objects.all()  # Define queryset for the view
   serializer_class = CourseLearningObjectiveSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   lookup_field = "pk"  # Use the primary key to find the instance
   
   def get_queryset(self, request):
      return CourseLearningObjective.objects.all()
   
   def perform_update(self, request, serializer):
      """
      This method is called when an update (PUT) request is made.
      It allows us to add custom behavior during the update (e.g., adding more info).
      """
      if not request.user.is_superuser:  # Checks for superuser status
         return Response({"error": "Only superusers can create new Course Learning Objectives."}, status=status.HTTP_403_FORBIDDEN)
      serializer.save()
   
   def perform_destroy(self, request, instance):
      """
      This method is called when a delete (DELETE) request is made.
      We can perform any custom logic before actually deleting the instance.
      """
      if not request.user.is_superuser:  # Checks for superuser status
            return Response({"error": "Only superusers can create new Course Learning Objectives."}, status=status.HTTP_403_FORBIDDEN)
      instance.delete()
# STOP - CourseLearningObjective



# START - TaskCLOMapping
class TaskCLOMappingListCreate(generics.ListCreateAPIView):
   """
   API endpoint for listing all instances of and creating a new Task CLO Mapping instance.
   """
   serializer_class = TaskCLOMappingSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   
   def get(self, request):
      task_CLO_mappings = TaskCLOMapping.objects.all()
      serializer = TaskCLOMappingSerializer(task_CLO_mappings, many=True)
      return Response(serializer.data)
   
   def post(self, request):
      serializer = CourseLearningObjectiveSerializer(data=request.data)
      if serializer.is_valid():  # Checks for valid serializer
         serializer.save()
         return Response(serializer.data, status=status.HTTP_201_CREATED)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TaskCLOMappingDetail(generics.RetrieveUpdateDestroyAPIView):
   """
   A view for retrieving, updating, and deleting a specific Task CLO Mapping instance.
   """
   queryset = TaskCLOMapping.objects.all()  # Define queryset for the view
   serializer_class = TaskCLOMappingSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   lookup_field = "pk"  # Use the primary key to find the instance
   
   def get_queryset(self, request):
      return TaskCLOMapping.objects.all()
   
   def perform_update(self, serializer):
      """
      This method is called when an update (PUT) request is made.
      It allows us to add custom behavior during the update (e.g., adding more info).
      """
      serializer.save()
   
   def perform_destroy(self, instance):
      """
      This method is called when a delete (DELETE) request is made.
      We can perform any custom logic before actually deleting the instance.
      """
      instance.delete()
# STOP - TaskCLOMapping



# START - PLOCLOMapping
class PLOCLOMappingListCreate(generics.ListCreateAPIView):
   """
   API endpoint for listing all instances of and creating a new PLO CLO Mapping instance.
   """
   serializer_class = PLOCLOMappingSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   
   def get(self, request):
      plo_clo_mappings = PLOCLOMapping.objects.all()
      serializer = PLOCLOMappingSerializer(plo_clo_mappings, many=True)
      return Response(serializer.data)
   
   def post(self, request):
      if not request.user.is_superuser:  # Checks for superuser status
         return Response({"error": "Only superusers can create new Course Learning Objectives."}, status=status.HTTP_403_FORBIDDEN)
      serializer = PLOCLOMappingSerializer(data=request.data)
      if serializer.is_valid():  # Checks for valid serializer
         serializer.save()
         return Response(serializer.data, status=status.HTTP_201_CREATED)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PLOCLOMappingDetail(generics.RetrieveUpdateDestroyAPIView):
   """
   A view for retrieving, updating, and deleting a specific PLO CLO Mapping instance.
   """
   queryset = PLOCLOMapping.objects.all()  # Define queryset for the view
   serializer_class = PLOCLOMappingSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   lookup_field = "pk"  # Use the primary key to find the instance
   
   def get_queryset(self, request):
      return PLOCLOMapping.objects.all()
   
   def perform_update(self, request, serializer):
      """
      This method is called when an update (PUT) request is made.
      It allows us to add custom behavior during the update (e.g., adding more info).
      """
      if not request.user.is_superuser:  # Checks for superuser status
         return Response({"error": "Only superusers can create new Course Learning Objectives."}, status=status.HTTP_403_FORBIDDEN)
      serializer.save()
   
   def perform_destroy(self, request, instance):
      """
      This method is called when a delete (DELETE) request is made.
      We can perform any custom logic before actually deleting the instance.
      """
      if not request.user.is_superuser:  # Checks for superuser status
         return Response({"error": "Only superusers can create new Course Learning Objectives."}, status=status.HTTP_403_FORBIDDEN)
      instance.delete()
# STOP - PLOCLOMapping



# START - Student
class StudentListCreate(generics.ListCreateAPIView):
   """
   API endpoint for listing all instances of and creating a new Student instance.
   """
   serializer_class = StudentSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   
   def get(self, request):
      students = Student.objects.all()
      serializer = StudentSerializer(students, many=True)
      return Response(serializer.data)
   
   def post(self, request):
      if not request.user.is_superuser:  # Checks for superuser status
         return Response({"error": "Only superusers can create new Students."}, status=status.HTTP_403_FORBIDDEN)
      serializer = StudentSerializer(data=request.data)
      if serializer.is_valid():  # Checks for valid serializer
         serializer.save()
         return Response(serializer.data, status=status.HTTP_201_CREATED)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class StudentDetail(generics.RetrieveUpdateDestroyAPIView):
   """
   A view for retrieving, updating, and deleting a specific Student instance.
   """
   queryset = Student.objects.all()  # Define queryset for the view
   serializer_class = StudentSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   lookup_field = "pk"  # Use the primary key to find the instance
   
   def get_queryset(self, request):
      return Student.objects.all()
   
   def perform_update(self, request, serializer):
      """
      This method is called when an update (PUT) request is made.
      It allows us to add custom behavior during the update (e.g., adding more info).
      """
      if not request.user.is_superuser:  # Checks for superuser status
         return Response({"error": "Only superusers can create new Students."}, status=status.HTTP_403_FORBIDDEN)
      serializer.save()
   
   def perform_destroy(self, request, instance):
      """
      This method is called when a delete (DELETE) request is made.
      We can perform any custom logic before actually deleting the instance.
      """
      if not request.user.is_superuser:  # Checks for superuser status
         return Response({"error": "Only superusers can create new Students."}, status=status.HTTP_403_FORBIDDEN)
      instance.delete()
# STOP - Student



# START - StudentTaskMapping
class StudentTaskMappingListCreate(generics.ListCreateAPIView):
   """
   API endpoint for listing all instances of and creating a new Student Task Mapping instance.
   """
   serializer_class = StudentTaskMappingSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   
   def get(self, request):
      student_task_mappings = StudentTaskMapping.objects.all()
      serializer = StudentSerializer(student_task_mappings, many=True)
      return Response(serializer.data)
   
   def post(self, request):
      if not request.user.is_superuser:  # Checks for superuser status
         return Response({"error": "Only superusers can create new Student Task Mappings."}, status=status.HTTP_403_FORBIDDEN)
      serializer = StudentTaskMappingSerializer(data=request.data)
      if serializer.is_valid():  # Checks for valid serializer
         serializer.save()
         return Response(serializer.data, status=status.HTTP_201_CREATED)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class StudentTaskMappingDetail(generics.RetrieveUpdateDestroyAPIView):
   """
   A view for retrieving, updating, and deleting a specific Student Task Mapping instance.
   """
   queryset = StudentTaskMapping.objects.all()  # Define queryset for the view
   serializer_class = StudentTaskMappingSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   lookup_field = "pk"  # Use the primary key to find the instance
   
   def get_queryset(self, request):
      return StudentTaskMapping.objects.all()
   
   def perform_update(self, request, serializer):
      """
      This method is called when an update (PUT) request is made.
      It allows us to add custom behavior during the update (e.g., adding more info).
      """
      if not request.user.is_superuser:  # Checks for superuser status
         return Response({"error": "Only superusers can create new Student Task Mapping."}, status=status.HTTP_403_FORBIDDEN)
      serializer.save()
   
   def perform_destroy(self, request, instance):
      """
      This method is called when a delete (DELETE) request is made.
      We can perform any custom logic before actually deleting the instance.
      """
      if not request.user.is_superuser:  # Checks for superuser status
         return Response({"error": "Only superusers can create new Student Task Mapping."}, status=status.HTTP_403_FORBIDDEN)
      instance.delete()
# STOP - StudentTaskMapping
