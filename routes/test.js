const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path')
let {PythonShell} = require('python-shell');

const uploadDest = 'public/media/';
const allowedMimeTypes = ['audio/*'];

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
  {name: 'audioFile3'},
]

let options = {
    mode: 'text',
    pythonPath: "/home/jhs/venv/snowboy/bin/python",
    scriptPath: "public/pythonScript/",
    // args: ['record1.wav', 'record2.wav', 'record3.wav', 'ko', 'hotword.pmdl']
    // args: ['-r1','record1.wav', '-r2','record2.wav','-r3','record3.wav', '-lang','en', '-n','hotword.pmdl'] 
    args: ['-r1','public/media/record1.wav', '-r2','public/media/record2.wav',
            '-r3','public/media/record3.wav', '-lang','ko', '-n','hotword.pmdl'] 
}

// '/test'
router.post('/', upload.fields(fields), function (req, res, next) {
    console.log('file-upload');
    res.send("test")
    PythonShell.run("generate_pmdl.py", options, function(err, data){
        if(err) throw err;
        console.log(data);
    })
});

let json = {'active':'true'}
let json_data = JSON.stringify(json)

router.get('/active', function (req, res, next) {
    res.send(json_data)
});

router.get('/download', function(req, res, next){
    const file = 'hotword.pmdl'
    res.download(file);
})

module.exports = router;
