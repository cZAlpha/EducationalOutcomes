from rest_framework import serializers # Import the REST framework serializer
from .models import User, UserRole, Log # Import custom models
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
