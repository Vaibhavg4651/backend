const { v4: uuidv4 } = require("uuid");
const { getStorage } = require("firebase-admin/storage");

exports.upload = async (location, name, buffer, mimetype) => {
  const uuid = uuidv4();
  const bucket = getStorage().bucket();
  const file = bucket.file(`${location}/${name}`);
  try{
    const uploadData = await file.save(buffer, {
      contentType: mimetype,
      firebaseStorageDownloadTokens: uuid,
    }); 
    const url = `https://firebasestorage.googleapis.com/v0/b/${process.env.FIREBASE_PROJECT_NAME}.appspot.com/o/${location}%2F${encodeURIComponent(
      name
    )}?alt=media&token=${uuid}`;
    return url;
  } catch(err){
    console.log('error in upload.js')
    return false;
  }
};
