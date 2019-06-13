var express = require('express')
var router = express.Router()
var HTMLS = require('../js/HTMLS.js')
var LIB = require('../js/lib.js')
var db = require('../js/db.js')
var fs = require('fs')
var shortid = require('shortid')

router.get('/', function(request, response){
  fs.readFile(`developer.json`, 'utf8', function(err, filecontents){
    var data = JSON.parse(filecontents)
    var main_developer = data.developers[0].id
    response.redirect(`/about/${main_developer}`)
  })
})


router.get('/hav1n', function(request, response){
  fs.readFile(`html/about.html`, 'utf8', function(err, body){
    if(err){
    }
    else{
      fs.readFile(`developer.json`, 'utf8', function(err, filecontents){
        if(err){
        }
        else{
          var data = JSON.parse(filecontents)
          console.log(data.developers[0])
          console.log(data.developers.length)
          var title = 'about'
          var template = HTMLS.HTML_base(title, body)
          response.send(template)
        }
      })
    }
  })
})

router.get('')



module.exports = router
