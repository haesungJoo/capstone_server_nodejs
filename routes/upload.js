const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path')
let {PythonShell} = require('python-shell');


const uploadDest = 'public/media/';
const allowedMimeTypes = ['audio/*'];
// const allowedMimeTypes = ['audio/x-wav', 'audio/wav'];
const filter = function (req, file, cb) {
  if (!allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, false);
  }
   cb(null, true);
};

var storage = multer.diskStorage({
    destination: uploadDest,
    filename: function(req, file, cb){
        cb(null, file.originalname)
    }
})

var upload = multer({
  storage: storage,
  fileFilter: filter,
});

var fields = [ 
    {name: 'audioFile1'},
    {name: 'audioFile2'},
    {name: 'audioFile3'}
]

let options = {
    mode: 'text',
    pythonPath: "/home/jhs/venv/snowboy/bin/python",
    scriptPath: "public/media/",
    // args: ['record1.wav', 'record2.wav', 'record3.wav', 'ko', 'hotword.pmdl']
    // args: ['-r1','record1.wav', '-r2','record2.wav','-r3','record3.wav', '-lang','en', '-n','hotword.pmdl'] 
    args: ['-r1','public/media/record1.wav', '-r2','public/media/record2.wav',
            '-r3','public/media/record3.wav', '-lang','ko', '-n','hotword.pmdl'] 
}

// '/upload'
router.post('/', upload.fields(fields), function (req, res, next) {
  console.log('file-upload');

  PythonShell.run("generate_pmdl_origin.py", options, function(err, data){
      if(err) throw err;
      console.log(data);
  })
//   res.send("success")
//   console.log(req.files)
});

module.exports = router;
