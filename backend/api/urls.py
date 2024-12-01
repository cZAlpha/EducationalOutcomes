# API App urls.py

from django.urls import path
from . import views


urlpatterns = [
   path("notes/", views.NoteListCreate.as_view(), name="note-list"), # Route that gets notes (and allows for creation of them)
   path("notes/delete/<int:pk>/", views.NoteDelete.as_view(), name="delete-note"), # Route that dictates the deletion of a note
]
