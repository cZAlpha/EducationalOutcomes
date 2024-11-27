from django.db import models
from django.contrib.auth.models import User


class Note(models.Model):
   title = models.CharField(max_length=100) 
   content = models.TextField(max_length=1000)
   created_at = models.DateTimeField(auto_now_add=True) # Sets the time that the note was created at
   author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes") # Defines who made the note using the User FK from the User table
      # The relationship between the author and the User is a ONE User can be the author to MANY notes (1 to Many)
   
   def __str__(self): # When trying to convert a given Note object to a string, return the title
      return self.title
