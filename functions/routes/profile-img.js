const express = require("express");
const multer = require("multer");
const { uploadController } = require("../controllers/profileImgController");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 600 * 1024, // 600KB
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed.'));
    }
  }
});

const multerMiddleware = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if(err && err.code==='LIMIT_FILE_SIZE'){
      return res.status(400).send({ message: "File Larger than 600KB" });
    }
    else if (err) 
      return res.status(400).send({ message: err.message });
    next();
  });
};

router.patch("/", multerMiddleware, uploadController);

module.exports = {
  routes: router,
};
