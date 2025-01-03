from django.db import models
from django.conf import settings  # Use this to refer to the custom User model
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


# NOTE: This is where API-compatible database tables are defined
# Each class in this file dictates the creation of a Django 'Model', 
# this is just a fancy way to call a table, or an object within
# a relational database. The name of the class dictates the name of
# the table within the database. Each internal variable dictates a 
# column within the table. The thing you set the variables equal to
# dictates the datatype of that column. You can also override 
# functions to meet your needs like in the Note table's usage of
# overriding the Python equivalent of Java's toString method.


class UserManager(BaseUserManager):
   def create_user(self, username, email, password=None, **extra_fields):
      if not email:
         raise ValueError('The Email field must be set')
      email = self.normalize_email(email)
      user = self.model(username=username, email=email, **extra_fields)
      extra_fields.setdefault('is_active', True)

      user.set_password(password)
      user.save(using=self._db)
      return user

   def create_superuser(self, username, email, password=None, **extra_fields):
      extra_fields.setdefault('is_active', True)
      extra_fields.setdefault('is_staff', True)
      extra_fields.setdefault('is_superuser', True)
      return self.create_user(username, email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
   username = models.CharField(max_length=150, unique=True)
   email = models.EmailField(unique=True, null=False)  # Email field added here
   role = models.ForeignKey('UserRole', on_delete=models.SET_NULL, null=True, blank=True)
   date_joined = models.DateTimeField(auto_now_add=True)

   # Custom related_name to avoid conflict with default User model
   groups = models.ManyToManyField(
      'auth.Group',
      related_name='api_user_set',  # Custom related_name to avoid collision
      blank=True
   )
   user_permissions = models.ManyToManyField(
      'auth.Permission',
      related_name='api_user_permissions_set',  # Custom related_name to avoid collision
      blank=True
   )

   objects = UserManager()

   USERNAME_FIELD = 'username'  # Update this to 'email' to allow login via email
   REQUIRED_FIELDS = ['email']  # 'email' is required for creating a user

   def __str__(self):
      return self.username


class UserRole(models.Model):
   ROLE_CHOICES = [ # These role choices are in order of power, admins can read and write anything, users can only read and write to certian fields and clients are READ ONLY for most things
      ('Admin', 'Admin'),
      ('User', 'User'),
      ('Client', 'Client')
   ]
   role_name = models.CharField(max_length=50, unique=True, choices=ROLE_CHOICES)
   role_description = models.TextField(blank=True)
   permissions = models.CharField(max_length=50, choices=ROLE_CHOICES)

   def __str__(self):
      return self.role_name


class Log(models.Model):
   ACTION_CHOICES = [ # Log action types
      ('CREATE', 'Create'),
      ('UPDATE', 'Update'),
      ('DELETE', 'Delete'),
      ('LOGIN', 'Login'),
      ('LOGOUT', 'Logout'),
      ('ERROR', 'Error'),
   ]

   user = models.ForeignKey( # The user who caused the log
      settings.AUTH_USER_MODEL,
      on_delete=models.SET_NULL,
      null=True,
      blank=True,
      related_name="logs"
   )
   action = models.CharField(max_length=50, choices=ACTION_CHOICES) # The action the log is logging
   timestamp = models.DateTimeField(auto_now_add=True) # The time the log took place
   description = models.TextField(blank=True) # The description of the log, usually blank
   
   def __str__(self):
      return f"{self.user} - {self.action} - {self.timestamp}"
