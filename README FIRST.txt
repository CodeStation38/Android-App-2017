Previous requirements:

You can open most of the files in these projects with either Visual Studio Code or any other version of Visual Studio, Notepad, Notepad++ or the code editor you like.

--------------------------------------------------

WHAT'S THIS APPLICATION ABOUT?

The following applications were made with Visual Studio 2017.

Mobile App: It was used to register the user's cell phone, take photos, add a description, geographic coordinates and send this data to a database that managed them. Visual Studio tools for Cordova and JQuery Mobile were used. This was a hybrid mobile application which was compiled for Android.

Mobile app backend API: This API received the data from the mobile application and registered it in the database of the data center. It was an ASP.NET MVC Web API application.

MVC Web app Backoffice: This ASP.NET MVC Web API application managed the data stored in the data center database (Users, permissions, photos, CRUD operations, etc.)



--------------------------------------------------

HOW TO RUN IT LOCALLY?

You may not be able to run this application, since the backend was configured to run as an IIS Website and Visual Studio Tools for Cordova are no longer supported by Microsoft. The intention is to give you an idea about the work experience I have related to this technology. I wrote these examples in my free time. This was an end-to-end set of applications I built back on 2017. These examples do not belong to the companies I worked for, so there are no data privacy or copyright issues. 

--------------------------------------------------

Highlights:

    - Visual Studio Tools for Cordova, until 2017 was a great framework to build 
      hybrid mobile applications. It gave a lot of stability and reliability to the app, no matter the phone where it was running.

    - JQuery Mobile, helped me a lot to quickly build the screens of that app.
        Although it had its quircks and tweaks. I was glad it supported 
        GIF animations.

    - DataContext injection through BaseController class was a huge evolution in 
        understanding of applied Object Oriented Programming. It was a lot simpler
        and faster than implementing Castle Windsor, Spring.NET or Ninject.

    - Downloading and compiling Android plugins to run the app on different 
      Android versions took forever.

    - It was my first time creating a full CRM-like Web User Interface. It was 
      hard and rewarding at the same time.

    - It was my first time creating a "Photo-Gallery" for both Android and Web
      platforms.

    - Implementing SQlite for storing user and password as well as other temporary 
      data was an excellent idea. 
    