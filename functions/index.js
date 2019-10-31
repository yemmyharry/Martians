const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const uuidv5 = require("uuid5");

admin.initializeApp();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post("/", (req, res) => {
  const users = req.body;

  return admin
    .database()
    .ref("/users")
    .push(users)
    .then(() => res.status(200).send("successful"))
    .catch(err => {
      console.error(err);
      return res.status(500).send("failed");
    });
});

app.get("/", (req, res) => {
  return admin
    .database()
    .ref("/users")
    .on(
      "value",
      snapshot => {
        return res.status(200).send(
          Object.entries(snapshot.val()).map(article => {
            return Object.assign({}, { id: article[0] }, article[1]);
          })
        );
      },
      error => {
        res.status(error.code).json({
          message: `Something went wrong. ${error.message}`
        });
      }
    );
});

// const getUsersFromDatabase = res => {
//   const database = admin.database().ref("/users");
//   let users
//   return database.on(
//     "value",
//     snapshot => {
//       return res.status(200).send(snapshot.val());
//     },
//     error => {
//       res.status(error.code).json({
//         message: `Something went wrong. ${error.message}`
//       });
//     }
//   );
// };

exports.users = functions.https.onRequest(app);

// const postId = admin
//   .database()
//   .ref("/users")
//   .push().key;

exports.addUserId = functions.database
  .ref("/users/{usersId}")
  .onCreate((snapshot, context) => {
    const pushId = context.params.usersId;
    // const NAMESPACE = `256eeca98fa1348090565a`;
    const uuid = uuidv5(
      `https://update-table-b7e83.firebaseapp.com/${pushId}`,
      uuidv5.URL
    );

    return snapshot.ref.update({ userId: uuid });
    // return snapshot.ref.parent.child("userid").update({ userId });
  });

// exports.getUsers = functions.https.onRequest((req, res) => {
//   return cors(req, res, () => {
//     if (req.method !== "GET") {
//       return res.status(401).json({
//         message: "Not allowed"
//       });
//     }
//     getUsersFromDatabase(res);
//   });
// });
