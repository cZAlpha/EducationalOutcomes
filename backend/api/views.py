from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.contrib.auth.hashers import make_password

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
      return User.objects.filter(id=user.id)  # Regular users see only themselves
   
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
         return get_object_or_404(User, username=user_identifier)  # Try by username
   
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
   
   def get(self):
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
   
   def get_queryset(self):
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
   
   def get(self):
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
   
   def get_queryset(self):
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
   
   def get(self):
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
   
   def get_queryset(self):
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
   
   def get(self):
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
   
   def get(self):
      courses = Course.objects.all()
      serializer = CourseSerializer(courses, many=True)
      return Response(serializer.data)
   
   def post(self, request):
      if not request.user.is_superuser:  # Checks for superuser status
            return Response({"error": "Only superusers can create new Courses."}, status=status.HTTP_403_FORBIDDEN)
      serializer = CourseSerializer(data=request.data)
      if serializer.is_valid():  # Checks for valid serializer
         serializer.save()
         return Response(serializer.data, status=status.HTTP_201_CREATED)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
   
   def get(self):
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
   
   def get(self):
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
   
   def get_queryset(self):
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



# NOTE: 
# Anything below this has not been touched, and needs to be worked on.


# START - Section
# Section List Create 
# Retrives all Sections, also handles creating Sections
class SectionListCreate(APIView):
   """
   A view for retrieving a list of all instances, or to create a new instance.
   """
   def get(self): # Return the list
      Sections = Section.objects.all()
      serializer = SectionSerializer(Sections, many=True)
      return Response(serializer.data)

   def post(self, request): # Create the instance using the request
      print(request.data)
      serializer = SemesterSerializer(data=request.data)
      if serializer.is_valid():
         serializer.save()
         return Response(serializer.data, status=status.HTTP_201_CREATED)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Section Detail View
# Allows for: Edit, Create, Specific instance retrieval
class SectionDetail(generics.RetrieveUpdateDestroyAPIView):
   """
   A view for retrieving, updating, and deleting a specific Section instance.
   """
   queryset = Section.objects.all()  # Define queryset for the view
   serializer_class = SectionSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   lookup_field = "pk"  # Use the primary key to find the Course instance

   def get_queryset(self):
      return Section.objects.all()

   def perform_update(self, serializer):
      """
      This method is called when an update (PUT) request is made.
      It allows us to add custom behavior during the update (e.g., adding more info).
      """
      serializer.save()

   def perform_destroy(self, instance):
      """
      This method is called when a delete (DELETE) request is made.
      We can perform any custom logic before actually deleting the log.
      """
      instance.delete()
# STOP - Section



# START - AssignmentTemplate
# AssignmentTemplate List Create 
# Retrives all AssignmentTemplates, also handles creating AssignmentTemplates
class AssignmentTemplateListCreate(APIView):
   """
   A view for retrieving a list of all instances, or to create a new instance.
   """
   def get(self): # Return the list
      AssignmentTemplates = AssignmentTemplate.objects.all()
      serializer = AssignmentTemplateSerializer(AssignmentTemplates, many=True)
      return Response(serializer.data)

   def post(self, request): # Create the instance using the request
      print(request.data)
      serializer = AssignmentTemplateSerializer(data=request.data)
      if serializer.is_valid():
         serializer.save()
         return Response(serializer.data, status=status.HTTP_201_CREATED)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# AssignmentTemplate Detail View
# Allows for: Edit, Create, Specific instance retrieval
class AssignmentTemplateDetail(generics.RetrieveUpdateDestroyAPIView):
   """
   A view for retrieving, updating, and deleting a specific AssignmentTemplate instance.
   """
   queryset = AssignmentTemplate.objects.all()  # Define queryset for the view
   serializer_class = AssignmentTemplateSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   lookup_field = "pk"  # Use the primary key to find the Course instance

   def get_queryset(self):
      return AssignmentTemplate.objects.all()

   def perform_update(self, serializer):
      """
      This method is called when an update (PUT) request is made.
      It allows us to add custom behavior during the update (e.g., adding more info).
      """
      serializer.save()

   def perform_destroy(self, instance):
      """
      This method is called when a delete (DELETE) request is made.
      We can perform any custom logic before actually deleting the log.
      """
      instance.delete()
# STOP - AssignmentTemplate



# START - Assignment
# Assignment List Create 
# Retrives all Assignments, also handles creating Assignments
class AssignmentListCreate(APIView):
   """
   A view for retrieving a list of all instances, or to create a new instance.
   """
   def get(self): # Return the list
      Assignments = Assignment.objects.all()
      serializer = AssignmentSerializer(Assignments, many=True)
      return Response(serializer.data)

   def post(self, request): # Create the instance using the request
      print(request.data)
      serializer = AssignmentSerializer(data=request.data)
      if serializer.is_valid():
         serializer.save()
         return Response(serializer.data, status=status.HTTP_201_CREATED)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Assignment Detail View
# Allows for: Edit, Create, Specific instance retrieval
class AssignmentDetail(generics.RetrieveUpdateDestroyAPIView):
   """
   A view for retrieving, updating, and deleting a specific Assignment instance.
   """
   queryset = Assignment.objects.all()  # Define queryset for the view
   serializer_class = AssignmentSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   lookup_field = "pk"  # Use the primary key to find the Course instance

   def get_queryset(self):
      return Assignment.objects.all()

   def perform_update(self, serializer):
      """
      This method is called when an update (PUT) request is made.
      It allows us to add custom behavior during the update (e.g., adding more info).
      """
      serializer.save()

   def perform_destroy(self, instance):
      """
      This method is called when a delete (DELETE) request is made.
      We can perform any custom logic before actually deleting the log.
      """
      instance.delete()
# STOP - Assignment



# START - AssignmentQuestion
# AssignmentQuestion List Create 
# Retrives all AssignmentQuestions, also handles creating AssignmentQuestions
class AssignmentQuestionListCreate(APIView):
   """
   A view for retrieving a list of all instances, or to create a new instance.
   """
   def get(self): # Return the list
      AssignmentQuestions = AssignmentQuestion.objects.all()
      serializer = AssignmentQuestionSerializer(AssignmentQuestions, many=True)
      return Response(serializer.data)

   def post(self, request): # Create the instance using the request
      print(request.data)
      serializer = AssignmentQuestionSerializer(data=request.data)
      if serializer.is_valid():
         serializer.save()
         return Response(serializer.data, status=status.HTTP_201_CREATED)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# AssignmentQuestion Detail View
# Allows for: Edit, Create, Specific instance retrieval
class AssignmentQuestionDetail(generics.RetrieveUpdateDestroyAPIView):
   """
   A view for retrieving, updating, and deleting a specific AssignmentQuestion instance.
   """
   queryset = AssignmentQuestion.objects.all()  # Define queryset for the view
   serializer_class = AssignmentQuestionSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   lookup_field = "pk"  # Use the primary key to find the Course instance

   def get_queryset(self):
      return AssignmentQuestion.objects.all()

   def perform_update(self, serializer):
      """
      This method is called when an update (PUT) request is made.
      It allows us to add custom behavior during the update (e.g., adding more info).
      """
      serializer.save()

   def perform_destroy(self, instance):
      """
      This method is called when a delete (DELETE) request is made.
      We can perform any custom logic before actually deleting the log.
      """
      instance.delete()
# STOP - AssignmentQuestion



# START - AssignmentQuestionMapping
# AssignmentQuestionMapping List Create 
# Retrives all AssignmentQuestionMappings, also handles creating AssignmentQuestionMappings
class AssignmentQuestionMappingListCreate(APIView):
   """
   A view for retrieving a list of all instances, or to create a new instance.
   """
   def get(self): # Return the list
      AssignmentQuestionMappings = AssignmentQuestionMapping.objects.all()
      serializer = AssignmentQuestionMappingSerializer(AssignmentQuestionMappings, many=True)
      return Response(serializer.data)

   def post(self, request): # Create the instance using the request
      print(request.data)
      serializer = AssignmentQuestionMappingSerializer(data=request.data)
      if serializer.is_valid():
         serializer.save()
         return Response(serializer.data, status=status.HTTP_201_CREATED)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# AssignmentQuestionMapping Detail View
# Allows for: Edit, Create, Specific instance retrieval
class AssignmentQuestionMappingDetail(generics.RetrieveUpdateDestroyAPIView):
   """
   A view for retrieving, updating, and deleting a specific AssignmentQuestionMapping instance.
   """
   queryset = AssignmentQuestionMapping.objects.all()  # Define queryset for the view
   serializer_class = AssignmentQuestionMappingSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   lookup_field = "pk"  # Use the primary key to find the Course instance

   def get_queryset(self):
      return AssignmentQuestionMapping.objects.all()

   def perform_update(self, serializer):
      """
      This method is called when an update (PUT) request is made.
      It allows us to add custom behavior during the update (e.g., adding more info).
      """
      serializer.save()

   def perform_destroy(self, instance):
      """
      This method is called when a delete (DELETE) request is made.
      We can perform any custom logic before actually deleting the log.
      """
      instance.delete()
# STOP - AssignmentQuestionMapping
