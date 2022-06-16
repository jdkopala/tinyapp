const urlsForUser = (id, urlDatabase) => {
  let filterData = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userId === id) {
      filterData[url] = {
        longURL: urlDatabase[url].longURL,
        userId: id
      }
    }
  }
  return filterData;
};

const checkUserEmails = (userEmail, users) => {
  for (let u in users) {
    if (userEmail === users[u].email) {
      return users[u];
    }
  }
  return null;
};

const generateRandomString = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let string = '';
  for (let i = 0; i < 6; i++) {
    string += chars[Math.floor(Math.random() * chars.length)];
  }
  return string;
};

module.exports = { urlsForUser, checkUserEmails, generateRandomString }