const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { exec } = require("child_process");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const jwt_decode  = require("jwt-decode");

const app = express();

// support parsing of application/json type post data
app.use(bodyParser.json());
app.use(cors()); // const cookieParser = require('cookie-parser');

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/", (req, res) => {
  let key = req.body.key;
  console.log(key);

  if (key === "D0nt_L3ak_th15_k3y_t0_th3_r3publ1c") {
    let token = generateAccessToken();

    res.json({
      flag:
        "4446FC713F1D21585B441676F95A160AAC8522B92070386976D954D41076F26A==",
      token: token,
    });
    console.log(
      "4446FC713F1D21585B441676F95A160AAC8522B92070386976D954D41076F26A=="
    );
  } else {
    res.json("hmm.. are you trying to hack the empire");
  }
});

function generateAccessToken() {
  // expires after half and hour (1800 seconds = 30 minutes)
  return jwt.sign({ admin: false, authenticated: true }, "secret", {
    algorithm: "HS256",
  });
}

const Auth = (req, res, next) => {
  // Gather the jwt access token from the request header
  console.log(req.headers.authorization);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    idToken = req.headers.authorization.split("Bearer ")[1];

    jwt.verify(idToken, "secret", (err) => {
      console.log(err);

      var token = idToken;
      var decoded = jwt_decode(token);

      if(decoded.authenticated === false) {
        res.sendStatus(403)
      }

      if(decoded.iat > new Date()) {
        res.sendStatus(403)
      }

      console.log(decoded);

      if (err) return res.sendStatus(403);

      next(); // pass the execution off to whatever request the client intended
    });
  } else {
    console.error("No token found");
    return res.status(403).json({ error: "Unauthorized" });
  }
};

const isAdmin = (req, res, next) => {};

app.get("/starships", Auth, (req, res) => {
  axios
    .get("https://swapi.dev/api/starships/", { json: true })
    .then((result) => {
      return res.send(result.data);
    })
    .catch((err) => {
      return res.json(err);
    });
});

app.get("/vehicles", Auth, (req, res) => {
  axios
    .get("https://swapi.dev/api/vehicles/", { json: true })
    .then((result) => {
      console.log(result.data);
      return res.send(result.data);
    })
    .catch((err) => {
      return res.json(err);
    });
});

app.get("/planets", Auth, (req, res) => {
  axios
    .get("https://swapi.dev/api/planets/", { json: true })
    .then((result) => {
      console.log(result.data);
      return res.send(result.data);
    })
    .catch((err) => {
      return res.json(err);
    });
});

app.get("/admin", isAdmin, (req, res) => {
  let command = req.body.command;

  exec("ls", (error, stdout, stderr) => {
    if (error) {
      return res.json(error);
    }
    if (stdout) {
      return res.send(stdout);
    }
  });
});

app.get("/command", (req, res) => {
  let command = req.body.command;

  exec("ls", (error, stdout, stderr) => {
    if (error) {
      return res.json(error);
    }
    if (stdout) {
      return res.send(stdout);
    }
  });
});

app.listen(5000, () => {
  console.log(`CTF listening at http://localhost:5000`);
});
