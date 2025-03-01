from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, generics
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
   
   def get_queryset(self, request):
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
   
   def get_object(self, request):
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
   
   def get_queryset(self, request):
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
   
   def get_queryset(self, request):
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
