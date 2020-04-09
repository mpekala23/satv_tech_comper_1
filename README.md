## Welcome to Student Corps!

### Setup

I have publicly hosted the website here for your convenience: www.fingoldin.com:3000

You will need Node.js, as well as Mongodb. Install a mongodb server locally, with a database named 'uc' that contains two collections: 'progressbars' and 'users'. Then create an admin account by running 'node register.js [username] [password]'. You may need to change the mongodb connection url in register.js and main.js. Having installed all this, simply run 'npm start' in this directory.

### Code

My main code resides in `main.js`, `register.js`, `public/static/js/progress.js`, and `public/static/css/edit.css`.

All other files are mostly modified versions of those on the actual UC website, as well as some photoshopped pictures using resources found online or on the UC website.

### Content

All included pages have been modified to be comical.

The main content page is the progress page, where you can view items concerning the SC's progress towards various goals. 

In addition, link throughout the website (including social media, and emails) have been changed to point to pages with important information.

### Editing

The progress page is where admins would edit the progress bars and items, using a built-in inline editing interface. To access this, click 'Login' (a little link found at the very bottom of each page on the website), and login using your admin credentials. It will automatically redirect you to the progress bars page, where an option to edit the content will pop up. Proceed to click that button and make your changes, and then press 'Save changes' to apply them.
To make change, simply click on the add or remove buttons, or click on existing blocks of text or progress bar values to edit them.

