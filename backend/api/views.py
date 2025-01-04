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
# Create User View
# Allows for the creation of a user instance
class CreateUserView(generics.CreateAPIView):
   permission_classes = [AllowAny]  # Allows ANYONE, even unlogged-in users, to make a user account
   
   def post(self, request):
      print("Request data:", request.data)  # Check if the request data is coming in properly
      serializer = UserSerializer(data=request.data)
      if serializer.is_valid():
         serializer.save()
         return Response(serializer.data, status=status.HTTP_201_CREATED)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# User List Create
# View for listing users and creating them too (only accessible to authenticated users)
class UserListCreate(generics.ListCreateAPIView):
   queryset = User.objects.all()  # Get all users
   serializer_class = UserSerializer  # Specify the serializer to be used
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   #print(queryset) # FOR DEBUGGING ONLY

# User Detail View
# Allows for: Edit, Create, Specific instance retrieval
class UserDetail(generics.RetrieveUpdateDestroyAPIView):
   """
   A view for retrieving, updating, and deleting a specific user instance by ID or username.
   """
   queryset = User.objects.all()  # Define queryset for the view
   serializer_class = UserSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   
   def get_object(self):
      user_identifier = self.kwargs['user_identifier']  # Get the user identifier from the URL
      # Try to fetch the user by ID (integer)
      try:
         return get_object_or_404(User, pk=int(user_identifier))
      except ValueError:
         # If it's not an integer, try fetching by username
         return get_object_or_404(User, username=user_identifier)

   def perform_update(self, serializer):
      """
      Hash the password if it is being updated.
      """
      # Check if 'password' is in the update payload
      if 'password' in serializer.validated_data:
         # Hash the password
         serializer.validated_data['password'] = make_password(serializer.validated_data['password'])
      
      # Save the updated user
      serializer.save()

   def perform_destroy(self, instance):
      """
      This method is called when a DELETE request is made.
      We can perform any custom logic before actually deleting the user.
      """
      instance.delete()
      return Response(status=204)  # Return a 204 No Content response on successful deletion
# STOP - USERS



# START - LOGS
# Log List Create 
# Retrives all logs, also handles creating logs
class LogListCreate(APIView):
   def get(self, request):
      logs = Log.objects.all()
      serializer = LogSerializer(logs, many=True)
      return Response(serializer.data)

   def post(self, request):
      print(request.data)
      serializer = LogSerializer(data=request.data)
      if serializer.is_valid():
         serializer.save()
         return Response(serializer.data, status=status.HTTP_201_CREATED)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Log Detail View
# Allows for: Edit, Create, Specific instance retrieval
class LogDetail(generics.RetrieveUpdateDestroyAPIView):
   """
   A view for retrieving, updating, and deleting a specific log instance.
   """
   queryset = Log.objects.all()  # Define queryset for the view
   serializer_class = LogSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   lookup_field = "pk"  # Use the primary key to find the log instance

   def get_queryset(self):
      # Optionally, you could restrict the queryset to logs belonging to the current user
      return Log.objects.all()

   def perform_update(self, serializer):
      """
      This method is called when an update (PUT) request is made.
      It allows us to add custom behavior during the update (e.g., adding more info).
      """
      # If you want to perform additional checks or modifications before saving the log
      serializer.save()

   def perform_destroy(self, instance):
      """
      This method is called when a delete (DELETE) request is made.
      We can perform any custom logic before actually deleting the log.
      """
      instance.delete()
# STOP - LOGS


#
# ABET Related Views
#


# START - ABETVersion
# ABETVersion List Create 
# Retrives all ABETVersions, also handles creating ABETVersions
class ABETVersionListCreate(APIView):
   """
   A view for retrieving a list of all instances, or to create a new instance.
   """
   def get(self): # Return the list
      ABETVersions = ABETVersion.objects.all()
      serializer = ABETVersionSerializer(ABETVersions, many=True)
      return Response(serializer.data)

   def post(self, request): # Create the instance using the request
      print(request.data)
      serializer = ABETVersionSerializer(data=request.data)
      if serializer.is_valid():
         serializer.save()
         return Response(serializer.data, status=status.HTTP_201_CREATED)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ABETVersion Detail View
# Allows for: Edit, Create, Specific instance retrieval
class ABETVersionDetail(generics.RetrieveUpdateDestroyAPIView):
   """
   A view for retrieving, updating, and deleting a specific ABETVersion instance.
   """
   queryset = ABETVersion.objects.all()  # Define queryset for the view
   serializer_class = ABETVersionSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   lookup_field = "pk"  # Use the primary key to find the log instance

   def get_queryset(self):
      return ABETVersion.objects.all()

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
# STOP - ABETVersion



# START - ABETLearningObjective
# ABETLearningObjective List Create 
# Retrives all ABETLearningObjective, also handles creating ABETLearningObjective
class ABETLearningObjectiveListCreate(APIView):
   """
   A view for retrieving a list of all instances, or to create a new instance.
   """
   def get(self): # Return the list
      ABETLearningObjectives = ABETLearningObjective.objects.all()
      serializer = ABETLearningObjectiveSerializer(ABETLearningObjectives, many=True)
      return Response(serializer.data)

   def post(self, request): # Create the instance using the request
      print(request.data)
      serializer = ABETLearningObjectiveSerializer(data=request.data)
      if serializer.is_valid():
         serializer.save()
         return Response(serializer.data, status=status.HTTP_201_CREATED)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ABETLearningObjective Detail View
# Allows for: Edit, Create, Specific instance retrieval
class ABETLearningObjectiveDetail(generics.RetrieveUpdateDestroyAPIView):
   """
   A view for retrieving, updating, and deleting a specific ABETLearningObjective instance.
   """
   queryset = ABETLearningObjective.objects.all()  # Define queryset for the view
   serializer_class = ABETLearningObjectiveSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   lookup_field = "pk"  # Use the primary key to find the log instance

   def get_queryset(self):
      return ABETLearningObjective.objects.all()

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
# STOP - ABETLearningObjective



# START - Course
# Course List Create 
# Retrives all Courses, also handles creating Courses
class CourseListCreate(APIView):
   """
   A view for retrieving a list of all instances, or to create a new instance.
   """
   def get(self): # Return the list
      Courses = Course.objects.all()
      serializer = CourseSerializer(Courses, many=True)
      return Response(serializer.data)

   def post(self, request): # Create the instance using the request
      print(request.data)
      serializer = CourseSerializer(data=request.data)
      if serializer.is_valid():
         serializer.save()
         return Response(serializer.data, status=status.HTTP_201_CREATED)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Course Detail View
# Allows for: Edit, Create, Specific instance retrieval
class CourseDetail(generics.RetrieveUpdateDestroyAPIView):
   """
   A view for retrieving, updating, and deleting a specific Course instance.
   """
   queryset = Course.objects.all()  # Define queryset for the view
   serializer_class = CourseSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   lookup_field = "pk"  # Use the primary key to find the Course instance

   def get_queryset(self):
      return Course.objects.all()

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
# STOP - Course



# START - Semester
# Semester List Create 
# Retrives all Semesters, also handles creating Semesters
class SemesterListCreate(APIView):
   """
   A view for retrieving a list of all instances, or to create a new instance.
   """
   def get(self): # Return the list
      Semesters = Semester.objects.all()
      serializer = SemesterSerializer(Semesters, many=True)
      return Response(serializer.data)

   def post(self, request): # Create the instance using the request
      print(request.data)
      serializer = SemesterSerializer(data=request.data)
      if serializer.is_valid():
         serializer.save()
         return Response(serializer.data, status=status.HTTP_201_CREATED)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Semester Detail View
# Allows for: Edit, Create, Specific instance retrieval
class SemesterDetail(generics.RetrieveUpdateDestroyAPIView):
   """
   A view for retrieving, updating, and deleting a specific Semester instance.
   """
   queryset = Semester.objects.all()  # Define queryset for the view
   serializer_class = SemesterSerializer
   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view
   lookup_field = "pk"  # Use the primary key to find the Course instance

   def get_queryset(self):
      return Semester.objects.all()

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
# STOP - Semester



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
