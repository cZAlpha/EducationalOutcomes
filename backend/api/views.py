from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
# User-made imports
from .serializers import UserSerializer, NoteSerializer
from .models import Note


class CreateUserView(generics.CreateAPIView):
   queryset = User.objects.all() # lists all different objects when we are creating a new user (to ensure we aren't making the same user again)
   serializer_class = UserSerializer # Use the UserSerializer class
   permission_classes = [AllowAny] # Allow anyone to call this view, even if they aren't signed in


class NoteListCreate(generics.ListCreateAPIView): # Database function that allows for the creation of a note
   serializer_class = NoteSerializer # set the serializer to be used
   permission_classes = [IsAuthenticated] # Only allow this view to be accessed when the user is authenticated already

   def get_queryset(self): 
      user = self.request.user # Define the current user
      return Note.objects.filter(author=user) # Get only notes pertaining to the currently logged in uer

   def perform_create(self, serializer): # Overriding the create method for notes
      if serializer.is_valid(): # If creation succeeded
         serializer.save(author=self.request.user) # Save the new note and specify the author to be the current user
      else: # If the creation failed
         print(serializer.errors) # Print the errors


class NoteDelete(generics.DestroyAPIView): # Database function that allows for the deletion of a given note
   serializer_class = NoteSerializer
   permission_classes = [IsAuthenticated]

   def get_queryset(self): 
      user = self.request.user # Define the current user
      return Note.objects.filter(author=user) # Get only notes pertaining to the currently logged in uer
