import { useState, useEffect } from "react";
import api from "../api";
import Note from "../components/Note"
import "../styles/Home.css"
import { Link } from 'react-router-dom';



function Home() {
   const [notes, setNotes] = useState([]);
   const [content, setContent] = useState("");
   const [title, setTitle] = useState("");

   useEffect(() => {
      getNotes();
   }, []);

   const getNotes = () => { // Getter function for notes
      api
         .get("/api/notes/") // GET request to /api/notes
         .then((res) => res.data) // Grab returned JSON data, set internal data variable to the aforementioned return data
         .then((data) => { 
               setNotes(data); // Use the returned data to set the note information on the screen through the setNotes function
               console.log(data); // DELETE BEFORE PROD!!! Logs that data in the console
         })
         .catch((err) => alert(err)); // CHANGE BEFORE PROD!!! If there was an error, alert the user with the error 
   };

   const deleteNote = (id) => { // Delete function for notes
      api
         .delete(`/api/notes/delete/${id}/`) // Posts a DELETE request to /api/notes/delete/id/ where id is the id of that given note in the DB
         .then((res) => {
            // NOTE: Visually change the way that the result of the DELETE request is handled, it shouldn't use the alert() function, but should look better to the user
               if (res.status === 204) alert("Note deleted!"); // If the resulting status of the DELETE api call was 204, alert the user that the note was deleted
               else alert("Failed to delete note."); // If there was an issue deleting the note in the DB (if the id was not found in most cases), throw an error
               getNotes(); // Use the getNotes function to refresh the notes on the page
         })
         .catch((error) => alert(error)); // CHANGE BEFORE PROD!!! If there was an error, alert the user with the error
   };

   const createNote = (e) => { // Create function for notes
      e.preventDefault(); // No idea what this does
      api
         .post("/api/notes/", { content, title }) // Posts a CREATE request to /api/notes/ with the content and title of the note
         .then((res) => { 
            // NOTE: Visually change the way that the result of the DELETE request is handled, it shouldn't use the alert() function, but should look better to the user
               if (res.status === 201) alert("Note created!"); // If the result status was 201, alert the user to the creation of the note
               else alert("Failed to make note."); // If the creation failed, alert the user to the failure of the creation
               getNotes(); // Refresh the notes on the screen
         })
         .catch((err) => alert(err));
   };

   return (
      <div>
         <nav>
            <Link to="/logout">
               <button>Log out</button>
            </Link>
         </nav>
         <div>
               <h2>Notes</h2>
               {notes.map((note) => (
                  <Note note={note} onDelete={deleteNote} key={note.id} />
               ))}
         </div>
         <h2>Create a Note</h2>
         <form onSubmit={createNote}>
               <label htmlFor="title">Title:</label>
               <br />
               <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  onChange={(e) => setTitle(e.target.value)}
                  value={title}
               />
               <label htmlFor="content">Content:</label>
               <br />
               <textarea
                  id="content"
                  name="content"
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
               ></textarea>
               <br />
               <input type="submit" value="Submit"></input>
         </form>
      </div>
   );
}

export default Home;