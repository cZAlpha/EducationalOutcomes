# API App urls.py

from django.urls import path
from .views import *
from django.urls import path, re_path


urlpatterns = [
      # User object routing
   path("users/", UserListCreate.as_view(), name="user-list"), # Route that returns all users in the DB as a list
   re_path(r'^users/(?P<user_identifier>\w+)', UserDetail.as_view(), name='user-detail'),
   #path('users/<str:user_identifier>/', UserDetailView.as_view(), name='user-detail') # Route that can update, delete, or retrieve specific user instances
      # Log object routing
   path("logs/", LogListCreate.as_view(), name="log-list"), # Route that returns all logs
   path("logs/<int:pk>/", LogDetail.as_view(), name="log-detail"),  # Retrieve, update, or delete a log
      # Courses Routing
   path("courses/", CourseListCreate.as_view(), name="course-list"), # Route that returns all objects and can be used to create new instances
   path("courses/<int:pk>/", CourseDetail.as_view(), name="course-detail"),  # Retrieve, update, or delete
      # Semesters Routing
   path("semesters/", SemesterListCreate.as_view(), name="semester-list"), # Route that returns all objects and can be used to create new instances
   path("semesters/<int:pk>/", SemesterDetail.as_view(), name="semester-detail"),  # Retrieve, update, or delete
      # Sections Routing
   path("sections/", SectionListCreate.as_view(), name="section-list"), # Route that returns all objects and can be used to create new instances
   path("sections/<int:pk>/", SectionDetail.as_view(), name="section-detail"),  # Retrieve, update, or delete
]
