from django.contrib.auth.models import User # Import default Django User model
from rest_framework import serializers # Import the REST framework serializer
from .models import Note


# NOTE:
# - ALL MODELS MUST HAVE A SERIALIZER!!!!
# - Maps python objects (from Models.py) to corresponding JSON code
# - With our API, we will be using JSON, so we must serialize and deserialize information to make data flow correctly and efficiently


class UserSerializer(serializers.ModelSerializer):
   class Meta: # Metadata
      model = User # Sets the model to the default User model from Django
      fields = ["id", "username", "password"] # Information we will use when handling user stuff
      extra_kwargs = {"password": {"write_only": True}} # Tells Django to accept a password when making a new user but not to return the password if you're just signing in, as it would not be needed

      def create(self, validated_data): # Internal method used to create a new user
         user = User.objects.create_user(**validated_data)
         return user


class NoteSerializer(serializers.ModelSerializer):
   class Meta:
      model = Note
      fields = ["id", "title", "content", "created_at", "author"]
      extra_kwargs = {"author": {"read_only": True}} # We should be able to read who the author was BUT NOT set the author is
