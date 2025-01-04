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
      # ABET Versions Routing
   path("abetversions/", ABETVersionListCreate.as_view(), name="abet-version-list"), # Route that returns all objects and can be used to create new instances
   path("abetversions/<int:pk>/", ABETVersionDetail.as_view(), name="abet-version-detail"),  # Retrieve, update, or delete
      # ABET Learning Objectives Routing
   path("abetlearningobjectives/", ABETLearningObjectiveListCreate.as_view(), name="abet-learning-objective-list"), # Route that returns all objects and can be used to create new instances
   path("abetlearningobjectives/<int:pk>/", ABETLearningObjectiveDetail.as_view(), name="abet-learning-objective-detail"),  # Retrieve, update, or delete
      # Courses Routing
   path("courses/", CourseListCreate.as_view(), name="course-list"), # Route that returns all objects and can be used to create new instances
   path("courses/<int:pk>/", CourseDetail.as_view(), name="course-detail"),  # Retrieve, update, or delete
      # Semesters Routing
   path("semesters/", SemesterListCreate.as_view(), name="semester-list"), # Route that returns all objects and can be used to create new instances
   path("semesters/<int:pk>/", SemesterDetail.as_view(), name="semester-detail"),  # Retrieve, update, or delete
      # Sections Routing
   path("sections/", SectionListCreate.as_view(), name="section-list"), # Route that returns all objects and can be used to create new instances
   path("sections/<int:pk>/", SectionDetail.as_view(), name="section-detail"),  # Retrieve, update, or delete
      # Assignment Templates Routing
   path("assignmenttemplates/", AssignmentTemplateListCreate.as_view(), name="assignment-template-list"), # Route that returns all objects and can be used to create new instances
   path("assignmenttemplates/<int:pk>/", AssignmentTemplateDetail.as_view(), name="assignment-template-detail"),  # Retrieve, update, or delete
      # Assignments Routing
   path("assignments/", AssignmentListCreate.as_view(), name="assignment-list"), # Route that returns all objects and can be used to create new instances
   path("assignments/<int:pk>/", AssignmentDetail.as_view(), name="assignment-detail"),  # Retrieve, update, or delete
      # Assignments Routing
   path("assignments/", AssignmentListCreate.as_view(), name="assignment-list"), # Route that returns all objects and can be used to create new instances
   path("assignments/<int:pk>/", AssignmentDetail.as_view(), name="assignment-detail"),  # Retrieve, update, or delete
      # Assignment Questions Routing
   path("assignmentquestions/", AssignmentQuestionListCreate.as_view(), name="assignment-question-list"), # Route that returns all objects and can be used to create new instances
   path("assignmentquestions/<int:pk>/", AssignmentQuestionDetail.as_view(), name="assignment-question-detail"),  # Retrieve, update, or delete
      # Assignment Question Mappings Routing
   path("assignmentquestionsmappings/", AssignmentQuestionMappingListCreate.as_view(), name="assignment-question-mapping-list"), # Route that returns all objects and can be used to create new instances
   path("assignmentquestionsmappings/<int:pk>/", AssignmentQuestionMappingDetail.as_view(), name="assignment-question-mapping-detail"),  # Retrieve, update, or delete
]
