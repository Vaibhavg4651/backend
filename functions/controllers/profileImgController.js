const { getFirestore } = require("firebase-admin/firestore");
const { upload } = require("../utils/upload");
const db = getFirestore();

exports.uploadController = async (req, res) => {
  if(!req.body.id){
    return res.status(400).send({Error:"Missig ID"})
  }
  try {
    const collectionRef = db.collection("users");
    const docRef = collectionRef.doc(req.body.id);
    const doc = await docRef.get();
    if(!doc.exists){
      return res.status(400).send({Error:"User Doesn't Exist"})
    }

    const url = await upload(
      "profile",
      req.body.id,
      req.file.buffer,
      req.file.mimetype
    );

    if (!url) {
      return res.status(400).send({ Error: "Error Uploading" });
    }

    const updated = await docRef.update({
      photoUrl: url,
    });
    if(!updated){
      return res.status(400).send({Error:"Error Updating Database but image uploaded successfully",url:url})
    }
    
    res.status(200).send({message:"Successfully Updated",url:url});
  } catch (err) {
    res.status(400).send({ Error: "Error Updating Profile Picture" });
  }
};
