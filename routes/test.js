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
    PythonShell.run("generate_pmdl.py", options, async function(err, data){
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
          // res.download(file, function(error){
          //   deleteAllAudiofilesAndPmdlFile()
          // })
          try{
            let result = await process(res)
          }catch(error){
            console.log("res.download Error : ",error)
          }
          deleteAllAudiofilesAndPmdlFile()
          // downloadPmdlAndBackgroundProcessing(res)
        }
        
        console.log(data)
    })
});

function errorSender(res, errorMessage){
  res.send(errorMessage)
}

function process(res){
  return new Promise(function(reso, reje){
    const file = 'hotword.pmdl'
    res.download(file, function(error){
      if(error){
        reje(error)
        console.log("error")
      }
      else {
        reso("ok")
        console.log("ok")
      }
    })
  })
}

// process(res)
// .then((result)=>{deleteAllAudiofilesAndPmdlFile()})
// .catch((error)=>{deleteAllAudiofilesAndPmdlFile()})

// try{
//   let result = await process(res)
// } catch(error){

// }
// deleteAllAudiofilesAndPmdlFile()


function downloadPmdlAndBackgroundProcessing(res){
  try{
    const file = 'hotword.pmdl'
    res.download(file, function(error){
      deleteAllAudiofilesAndPmdlFile()
    })
    // res.download??? promise??? callback??? ?????????????????? ?????????,
    // ?????? ????????? flow ????????? ????????? ???????????????. ??????
    // res.download ????????? callback??? ???????????????.
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
      fs.unlinkSync('hotword.pmdl')
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