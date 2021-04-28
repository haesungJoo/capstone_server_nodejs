const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path')
const fs = require('fs')
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
    var errorMessage = "";
    PythonShell.run("generate_pmdl.py", options, function(err, data){
        // if(err) throw err;
        if(err){
          console.log("err.traceback : ",err.traceback)
          if(err.traceback.indexOf("IOError")>-1){
            console.log("There is IOError")
            errorMessage = "IOError"
          } else if(err.traceback.indexOf("Hotword is too short")>-1){
            console.log("There is Hotword is too short")
            errorMessage = "ShortError"
          }
        }

        if(errorMessage != ""){
          deleteAllAudiofilesAndPmdlFile()
          errorSender(res, errorMessage)
        }else{
          console.log("here")
          downloadPmdlAndBackgroundProcessing(res).then(()=>{
              console.log("??")
              deleteAllAudiofilesAndPmdlFile()
            }
          );
        }
        
        console.log(data)
    })
});

function errorSender(res, errorMessage){
  res.send(errorMessage)
}

async function downloadPmdlAndBackgroundProcessing(res){
  try{
    const file = 'hotword.pmdl'
    res.download(file); 
    // res.download 자체가 비동기여서 await로 동기화 할 수 가 없는듯 하다?
    // 결정적인 문제는, file을 보내야 하는데, deleteAllAudiofilesAndPmdlFile로 모두 삭제하는 것 때문임으로
    // 밑의 코드에서 보다싶이, 임시방안으로 setTimeout으로 약간 늦춰서 파일을 삭제하여준다.
  }catch(error){
    console.log("error for downloading hotword.pmdl : ",error)
  }
}

function deleteAllAudiofilesAndPmdlFile(){
  try{
    if(fs.existsSync('public/media/record1.wav')){
      fs.unlinkSync('public/media/record1.wav')
    }
    if(fs.existsSync('public/media/record2.wav')){
      fs.unlinkSync('public/media/record2.wav')
    }
    if(fs.existsSync('public/media/record3.wav')){
      fs.unlinkSync('public/media/record3.wav')
    }
  }catch(error){
    console.log("error for records : ",error)
  }

  try{
    if(fs.existsSync('hotword.pmdl')){
      setTimeout(()=>{fs.unlinkSync('hotword.pmdl')},1500)
      // 
    }
  }catch(error){
    console.log("error for deleting hotword.pmdl : ",error)
  }
}


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