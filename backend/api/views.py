from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from rest_framework import status, generics
from django.shortcuts import get_object_or_404
from django.contrib.auth.hashers import make_password
from django.db import transaction
from django.db.models import Avg
from collections import defaultdict

# User-made imports
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
                     return Response(clo_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
               
               # Step 3: Create CLO-PLO Mappings
               for mapping in mappings_data:
                  clo_designation = mapping.get("cloDesignation")  # Using the correct key 'cloDesignation'
                  plo_id = mapping.get("plo")  # Using the correct key 'plo'
                                 
                  if clo_designation not in clo_id_map or not plo_id:
                     return Response({"error": "Invalid CLO-PLO mapping data."}, status=status.HTTP_400_BAD_REQUEST)
                                 
                  mapping_data = {
                     "clo": clo_id_map[clo_designation],  # Use actual saved CLO ID
                     "plo": plo_id
                  }
                  mapping_serializer = PLOCLOMappingSerializer(data=mapping_data)
                  if mapping_serializer.is_valid():
                     mapping_serializer.save()
                  else:
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
   
   def perform_update(self, request, serializer):
      """
      This method is called when an update (PUT) request is made.
      It allows us to add custom behavior during the update (e.g., adding more info).
      """
      if not request.user.is_superuser:  # Checks for superuser status
         return Response({"error": "Only superusers can create new Courses."}, status=status.HTTP_403_FORBIDDEN)
      serializer.save()
   
   def perform_destroy(self, request, instance):
      """
      This method is called when a delete (DELETE) request is made.
      We can perform any custom logic before actually deleting the instance.
      """
      if not request.user.is_superuser:  # Checks for superuser status
            return Response({"error": "Only superusers can create new Courses."}, status=status.HTTP_403_FORBIDDEN)
      instance.delete()
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
         avg_score = (
            StudentTaskMapping.objects.filter(task=task)
            .aggregate(avg_score=Avg("score"))["avg_score"]
         )
         task_avg_scores[task.embedded_task_id] = avg_score if avg_score is not None else 0
      
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
      if not request.user.is_superuser:  # Checks for superuser status
            return Response({"error": "Only superusers can create new Evaluation Instruments."}, status=status.HTTP_403_FORBIDDEN)
      serializer = EvaluationInstrumentSerializer(data=request.data)
      if serializer.is_valid():  # Checks for valid serializer
         serializer.save()
         return Response(serializer.data, status=status.HTTP_201_CREATED)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
   
   def perform_destroy(self, request, instance):
      """
      This method is called when a delete (DELETE) request is made.
      We can perform any custom logic before actually deleting the instance.
      """
      if not request.user.is_superuser:  # Checks for superuser status
            return Response({"error": "Only superusers can create new Evaluation Instruments."}, status=status.HTTP_403_FORBIDDEN)
      instance.delete()

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
         avg_score = (
            StudentTaskMapping.objects.filter(task=task)
            .aggregate(avg_score=Avg("score"))["avg_score"]
         )
         task_avg_scores[task.embedded_task_id] = avg_score if avg_score is not None else 0
      
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
