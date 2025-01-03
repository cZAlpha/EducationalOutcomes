# React Django Webapp Template V2


# Purpose
### The purpose of this application is to provide a starting point for enterprise-level web applications. This template only includes the absolute minimum as far as models:
- Users (admin, regular users, and client users)
- User roles (permission roles)
- Logs (logging actions)

<br>
#### These two models allow for logging into an authorization-protected dashboard.
<br>

<br>
#### IMPORTANT NOTE: The user roles model exists but the actual entries into the corresponding database table have not been implemented. Once you copy this template, you MUST use Django's manage.py shell to enter these roles into the database ('admin', and 'user' are the only required roles but more may be added and used like 'client', etc.). ALSO: Automatic logging has not been implemented on purpose. You must add log events to all wanted actions, though the model does exist in this template and so does the api route.
<br>

# Initial Setup Required
1. ### Must have Python 3.11.9 & corresponding Python Virtual Environment called 'env' within the parent directory.
2. ### Must have Node.js installed.
<br>

# Installing Required Python Packages for Local Development
1. Install Python version 3.11.9 (and assign it to your PATH in environment variables if on Windows, if not already done automatically)
2. Ensure you are in main git directory (same level as your virtual environment)
3. If you don't already have a Python 3.11.9 virtual environment, perform the following command to instantiate it: 
<br>
`python -m venv env`
<br>
This will instantiate a Python virtual environment called 'env'. DO NOT NAME IS 'venv', NAME IT 'env'.
<br>
4. Now that you have a Python virtual environment, you must activate it before installing packages. 
<br>
For UNIX OS': `source env/bin/activate`
<br>
And this command for Windows OS:
`.\env\Scripts\activate`
<br><br>

5. Perform the following command to install all required Python packages: 
<br>
`pip install -r requirements.txt`
<br><br>



# Installing Required Node Packages for Local Development
1. Ensure you have Node.js downloaded AND installed. On Windows, ensure that it is added to the PATH Environment Variables. On UNIX, this should be automatically handled.
<br><br>
2. Change directory into the 'frontend' directory and perform the following command:
`npm install`
<br><br>
3. This should automatically download all required Node JS packages. 
<br><br>

# Starting up Local Development Server
1. Ensure you are on the desired git branch (typically you should make a new branch for every feature).
<br><br>
2. Open a terminal on VS code (or other terminal)
<br><br>
3. Hit the split terminal button on VS code so that you have two terminal windows that are side by side
<br><br>
### Frontend Server
4. On the left terminal, change directory into the 'frontend' directory and perform the following command:
<br><br>
`npm run dev`
<br><br>
This will, in turn, start up the Node JS development server. Use the provided local network link to view the output of the Node JS frontend server.
<br><br>
### Backend Server
5. On the right aforementioned terminal window, change directories into the 'backend' directory. Ensure that the python virtual environment is activated (if not, use steps listed in previous sections to activate it). Then, perform the following command to startup the backend Django server:
<br><br>
`python manage.py runserver`
<br><br>


# Tutorial Used
https://www.youtube.com/watch?v=c-QsfbznSXI&t=3487s
