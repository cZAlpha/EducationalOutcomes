# API App urls.py

from django.urls import path
from .views import *
from django.urls import path, re_path


urlpatterns = [
      # User routing
   path("users/", UserListCreate.as_view(), name="user-list"), # Route that returns all users in the DB as a list
   re_path(r'^users/(?P<user_identifier>\w+)', UserDetail.as_view(), name='user-detail'), # Route that can update, delete, or retrieve specific user instances (accepts strings, ints, or strings with ints too)
   #path('users/<str:user_identifier>/', UserDetailView.as_view(), name='user-detail') # OUTDATED ROUTE
      # Log routing
   path("logs/", LogListCreate.as_view(), name="log-list"), # Route that returns all logs
   path("logs/<int:pk>/", LogDetail.as_view(), name="log-detail"),  # Retrieve, update, or delete a log
      # Accreditation Organization routing
   path("accreditation-organizations/", AccreditationOrganizationListCreate.as_view(), name="accreditation-organization-list"),  # Route that returns all accreditation organizations
   path("accreditation-organizations/<int:pk>/", AccreditationOrganizationDetail.as_view(), name="accreditation-organization-detail"),  # Retrieve, update, or delete a specific accreditation organization
      # Accreditation Version routing
   path("accreditation-versions/", AccreditationVersionListCreate.as_view(), name="accreditation-version-list"),  # Route that returns all accreditation versions
   path("accreditation-versions/<int:pk>/", AccreditationVersionDetail.as_view(), name="accreditation-version-detail"),  # Retrieve, update, or delete a specific accreditation version
      # Program Learning Objective routing
   path("program-learning-objectives/", ProgramLearningObjectiveListCreate.as_view(), name="program-learning-objective-list"),  # Route that returns all program learning objectives
   path("program-learning-objectives/<int:pk>/", ProgramLearningObjectiveDetail.as_view(), name="program-learning-objective-detail"),  # Retrieve, update, or delete a specific program learning objective
      # Program routing
   path("programs/", ProgramListCreate.as_view(), name="program-list"),  # Route that returns all programs
   path("programs/<int:pk>/", ProgramDetail.as_view(), name="program-detail"),  # Retrieve, update, or delete a specific program
      # Courses routing
   path("courses/", CourseListCreate.as_view(), name="course-list"), # Route that returns all objects and can be used to create new instances
   path("courses/<int:pk>/", CourseDetail.as_view(), name="course-detail"),  # Retrieve, update, or delete
   path("courses/<int:pk>/performance/", CoursePerformance.as_view(), name="course-short-performance"),  # Retrieve, update, or delete
   path("courses/<int:pk>/performancereport/", CoursePerformanceReport.as_view(), name="course-performance"),  # Returns the PDF with all course performance for course performance reports
      # ProgramCourseMapping routing
   path("program-course-mappings/", ProgramCourseMappingListCreate.as_view(), name="program-course-mapping-list"),  # Route that returns all program-course mappings
   path("program-course-mappings/<int:pk>/", ProgramCourseMappingDetail.as_view(), name="program-course-mapping-detail"),  # Retrieve, update, or delete a specific program-course mapping      
      # Semesters routing
   path("semesters/", SemesterListCreate.as_view(), name="semester-list"), # Route that returns all objects and can be used to create new instances
   path("semesters/<int:pk>/", SemesterDetail.as_view(), name="semester-detail"),  # Retrieve, update, or delete
      # Sections routing
   path("sections/", SectionListCreate.as_view(), name="section-list"), # Route that returns all objects and can be used to create new instances
   path("sections/<int:pk>/", SectionDetail.as_view(), name="section-detail"),  # Retrieve, update, or delete
   path("sections/<int:pk>/performance/", SectionPerformance.as_view(), name="section-performance"),  # Retrieve, update, or delete
      # EvaluationType routing
   path("evaluation-types/", EvaluationTypeListCreate.as_view(), name="evaluation-type-list"),  # Route that returns all evaluation types
   path("evaluation-types/<int:pk>/", EvaluationTypeDetail.as_view(), name="evaluation-type-detail"),  # Retrieve, update, or delete a specific evaluation type
      # Evaluation Instrument routing
   path("evaluation-instruments/", EvaluationInstrumentListCreate.as_view(), name="evaluation-instrument-list"),  # Route that returns all evaluation instruments
   path("evaluation-instruments/<int:pk>/", EvaluationInstrumentDetail.as_view(), name="evaluation-instrument-detail"),  # Retrieve, update, or delete a specific evaluation instrument
   path("evaluation-instruments/<int:pk>/performance/", EvaluationInstrumentPerformance.as_view(), name="evaluation-instrument-detail"),  # Get performance indicators for a given evaluation instrument
      # Embedded Task routing
   path("embedded-tasks/", EmbeddedTaskListCreate.as_view(), name="embedded-task-list"),  # Route that returns all embedded tasks
   path("embedded-tasks/<int:pk>/", EmbeddedTaskDetail.as_view(), name="embedded-task-detail"),  # Retrieve, update, or delete a specific embedded task
      # Course Learning Objective routing
   path("course-learning-objectives/", CourseLearningObjectiveListCreate.as_view(), name="course-learning-objective-list"),  # Route that returns all course learning objectives
   path("course-learning-objectives/<int:pk>/", CourseLearningObjectiveDetail.as_view(), name="course-learning-objective-detail"),  # Retrieve, update, or delete a specific course learning objective
      # Task CLO Mapping routing
   path("task-clo-mappings/", TaskCLOMappingListCreate.as_view(), name="task-clo-mapping-list"),  # Route that returns all task CLO mappings
   path("task-clo-mappings/<int:pk>/", TaskCLOMappingDetail.as_view(), name="task-clo-mapping-detail"),  # Retrieve, update, or delete a specific task CLO mapping
      # PLO CLO Mapping routing
   path("plo-clo-mappings/", PLOCLOMappingListCreate.as_view(), name="plo-clo-mapping-list"),  # Route that returns all PLO CLO mappings
   path("plo-clo-mappings/<int:pk>/", PLOCLOMappingDetail.as_view(), name="plo-clo-mapping-detail"),  # Retrieve, update, or delete a specific PLO CLO mapping
      # Student routing
   path("students/", StudentListCreate.as_view(), name="student-list"),  # Route that returns all students
   path("students/<int:pk>/", StudentDetail.as_view(), name="student-detail"),  # Retrieve, update, or delete a specific student
      # StudentTaskMapping routing
   path("student-task-mappings/", StudentTaskMappingListCreate.as_view(), name="student-task-mapping-list"),  # Route that returns all student-task mappings
   path("student-task-mappings/<int:pk>/", StudentTaskMappingDetail.as_view(), name="student-task-mapping-detail"),  # Retrieve, update, or delete a specific student-task mapping
]
