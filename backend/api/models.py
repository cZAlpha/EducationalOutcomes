from django.db import models
from django.contrib.auth.models import User


# NOTE: This is where API-compatible database tables are defined
# Each class in this file dictates the creation of a Django 'Model', 
# this is just a fancy way to call a table, or an object within
# a relational database. The name of the class dictates the name of
# the table within the database. Each internal variable dictates a 
# column within the table. The thing you set the variables equal to
# dictates the datatype of that column. You can also override 
# functions to meet your needs like in the Note table's usage of
# overriding the Python equivalent of Java's toString method.


class Note(models.Model): # Note Table Object 
   title = models.CharField(max_length=100) 
   content = models.TextField(max_length=1000)
   created_at = models.DateTimeField(auto_now_add=True) # Sets the time that the note was created at
   author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes") # Defines who made the note using the User FK from the User table
      # The relationship between the author and the User is a ONE User can be the author to MANY notes (1 to Many)
   
   def __str__(self): # When trying to convert a given Note object to a string, return the title
      return self.title
