from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.contrib.auth.hashers import make_password

# User-made imports
from .serializers import UserSerializer, LogSerializer # Import serializers
from .models import User, Log # Import models


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
