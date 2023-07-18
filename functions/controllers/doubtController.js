const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { v4: uuidv4 } = require("uuid");

const db = getFirestore();
const Redis = require("ioredis");

const client = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

const addDoubt = async (req, res, next) => {
  const {
    author_id,
    author_name,
    author_photo_url,
    author_college,
    author_year,
    heading,
    description,
    net_votes,
    tags,
    keywords,
    isAnonymous
  } = req.body;

  if(!keywords || keywords.length===0){
    return res.status(400).send({message:"ENTER KEYWORDS"});
  }

  try {
    let myuuid = uuidv4();
    const timestamp = Timestamp.now().toDate();
    const req_body = {
      doubt_id: myuuid,
      author_id,
      author_name,
      author_photo_url,
      author_college,
      author_year,
      heading,
      description,
      net_votes,
      tags,
      keywords,
      count_answers: 0,
      created_on: timestamp,
      isAnonymous
    };

    const collectionRef = db.collection("AllDoubts");
    // console.log(collectionRef);
    const docRef = collectionRef.doc(myuuid);
    await docRef.set(req_body);

    const pipeline = client.pipeline();

    const lowerCaseKeywords = keywords.map((word) => word.toLowerCase());

    lowerCaseKeywords.forEach((jsonKey) => {
      pipeline.exists(jsonKey);
    });

    const existsResults = await pipeline.exec();

    existsResults.forEach((result, index) => {
      const jsonKey = lowerCaseKeywords[index];
      const pathExist = result[1];
      if (pathExist) {
        pipeline.call("JSON.ARRAPPEND", jsonKey, "$", JSON.stringify(req_body));
      } else {
        pipeline.call("JSON.SET", jsonKey, "$", JSON.stringify([req_body]));
      }
    });

    await pipeline.exec();
    res.status(200).send(JSON.stringify(req_body));
  } catch (error) {
    res.status(400).send(error.message);
    console.log(req.body);
  }
};

module.exports = { addDoubt };
