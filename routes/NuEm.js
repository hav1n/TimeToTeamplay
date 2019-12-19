var express = require('express')
var router = express.Router()
var fs = require('fs')

router.get('/', function(request, response){
  fs.readFile(`public/NuEm/index.html`, 'utf8', function(err, body){
    response.send(body)
  })
})

router.post('/*',function(request, response){
  fs.readFile(`public/NuEm${request.url}`, 'utf8', function(err, body){
    if(err)console.log(err)
    {
      response.send('<h1>틀렸습니다! 뒤로가기를 눌러주세요.</h1>')
    }
    response.send(body)
  })
})

router.get('/*',function(request, response){
  fs.readFile(`public/NuEm${request.url}`, 'utf8', function(err, body){
    if(err)console.log(err)
    {
      response.send('<h1>틀렸습니다! 뒤로가기를 눌러주세요.</h1>')
    }
    response.send(body)
  })
})

module.exports = router
