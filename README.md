# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["This is an example of a users index of tinyURLs"](https://github.com/jdkopala/tinyapp/blob/main/docs/urls_index.jpg?raw=true)
!["The TinyAPP registration page"](https://github.com/jdkopala/tinyapp/blob/main/docs/Registration_page.jpg?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session


## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

- Create a user account in the **REGISTER** page, or **LOGIN** if you've already created one.

- Use the **Create a new URL** link in the navbar to add a new tinyURL to your list

- At the URL index page, the **EDIT** button will show you the tinyURL with it's associated URL and provide a field to edit the associated URL.

- At the URL index page, the **DELETE** button will remove the tinyURL and it's associated URL from the users list.