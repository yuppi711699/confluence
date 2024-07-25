require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const url = require("url");
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.listen(process.env.PORT, () => {
  console.log(`Sample app listening on port ${process.env.PORT} <br/> localhost:${process.env.PORT}/install`);
});
app.get("/install", (req, res) => {
  const payload = {
   audience: "api.atlassian.com",
   client_id: process.env.CLIENT_ID,
  //  scope: "offline_access read:me ",
   scope: "offline_access read:me read:board-scope:jira-software read:project:jira",
   redirect_uri: process.env.CALLBACK_URL,
   state: process.env.CLIENT_SECRET,
   response_type: "code",
   prompt: "consent",
 };
 const params = new url.URLSearchParams(payload);
 res.redirect(`${process.env.AUTHORIZATION_URL}?${params.toString()}`); 
});


app.get("/oauth/callback", async (req, res) => {
  console.log("/oauth/callback")
  const payload = {
    grant_type: "authorization_code",
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    redirect_uri: process.env.CALLBACK_URL,
    code: req.query.code,
  };
  console.log('apiResponse')
  const apiResponse = await axios.post(
    process.env.TOKEN_URL, 
    new url.URLSearchParams(payload).toString()
  );

  let accessToken = apiResponse.data.access_token;
  let refreshToken = apiResponse.data.refresh_token;
  res.sendStatus(200);
  console.log('accessToken')

console.log('start boards')

const boards = await axios.get(`${process.env.DOMAIN_URL}/rest/agile/1.0/board`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/json'
  }
})
  .then(response => {
    console.log(
      `Response: ${response.status} ${response.statusText}`
    );
    return response.text();
  })
  .then(text => console.log(text))
  .catch(err => console.error(err))
  .finally(()=> console.log('end boards'))

  console.log(boards)
});