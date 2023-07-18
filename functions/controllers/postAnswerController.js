const { Timestamp, getFirestore } = require("firebase-admin/firestore");
const db = getFirestore();
const { v4: uuidv4 } = require("uuid");

const postAnswer = async (req, res, next) => {
  const {
    doubt_id,
    description,
    author_id,
    author_name,
    author_photo_url,
    author_year,
    author_college,
    isAnonymous
  } = req.body;
  try {
    let myuuid = uuidv4();

    parentDocRef = db.doc(`AllDoubts/` + doubt_id);
    const subcollectionRef = parentDocRef.collection("Answer");
    const req_body = {
      doubt_id,
      answer_id: myuuid,
      description,
      author_id,
      author_name,
      author_photo_url,
      author_year,
      author_college,
      net_votes: 0,
      created_on: Timestamp.now(),
      isAnonymous
    };
    subcollectionRef
      .doc(myuuid)
      .set(req_body)
      .then((docRef) => {
        console.log("Document written with ID: ", myuuid);
        const collectionRef = db.collection("AllDoubts").doc(doubt_id);
        const notcollectionRef = db.collection("notifications");
        collectionRef.get().then((doc) => {
          if (doc.exists) {
            const counterValue = doc.data().count_answers;
            const doubt_heading = doc.data().heading;
            const doubt_author_id = doc.data().author_id;
            const updatedValue = counterValue + 1;

            // Update the counter field in the document
            collectionRef
              .update({ count_answers: updatedValue })
              .then(() => {
                console.log("Counter updated successfully!");
              })
              .catch((error) => {
                console.error("Error updating counter:", error);
              });

            notcollectionRef.add({
                doubt_id: doubt_id,
                doubt_heading: doubt_heading,
                answer_description: description,
                doubt_author_id: doubt_author_id,
                answer_author_id: author_id,
                answer_author_name: author_name,
                answer_id: myuuid,
                author_photo_url: author_photo_url,
                type:"postAnswer",
                is_read: false,
                created_on: Timestamp.now()
              })
              .then(() => {
                console.log("notification done");
              })
              .catch((error) => {
                console.log(error);
              });
          }
        });
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
      });

    res.status(200).send(JSON.stringify(req_body));
  } catch (error) {
    res.status(400).send(error.message);
    console.log(req.body);
  }
};

module.exports = { postAnswer };

