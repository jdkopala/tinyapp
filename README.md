# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["This is an example of a users index of tinyURLs"](https://github.com/jdkopala/tinyapp/commit/099aa140aa876f5ae303d75a7d38c15a9cc79188#diff-b44eccb960046340ba334bc7e5f9e9abfbff52ca501697ad54f4f39dc1d2eb72)
!["The TinyAPP registration page"](https://github.com/jdkopala/tinyapp/commit/099aa140aa876f5ae303d75a7d38c15a9cc79188#diff-f589718f825e32e209fecac22addd01bc3adbfeda06ba78b02674f7f5a26c584)

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