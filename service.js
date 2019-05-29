const express = require('express')
const app = express()
var args = process.argv
var fs = require('fs')
var HTMLS = require('./js/HTMLS.js')
var qs = require('querystring')
var bodyParser = require('body-parser')
var compression = require('compression')

app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(compression())

var num = 0;
app.use(function (request, response, next) {
    var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress
    var method = request.method
    var url = request.url

    console.log((++num) + ". IP " + ip + " " + method + " " + url)
    next()
})

app.get('/', function(request, response){
  fs.readFile(`./html/login.html`, 'utf8', function(err, body){
    var title = 'login'
    var template = HTMLS.HTML_login(title, body)
    response.send(template)
  })
})

app.get('/about', function(request, response){
  fs.readFile(`./html/about.html`, 'utf8', function(err, body){
    var title = 'about'
    var template = HTMLS.HTML_about(title, body)
    response.send(template)
  })
  _url='/html/about.html'
})

app.post('/main', function(request, response){
  var post = request.body
  var user_id = post.id
  try{
    fs.mkdirSync('User_Data/'+user_id);
    console.log(`${user_id} file created`)
  }catch(e){
    if(e.code!='EEXIST')throw e
  }
  fs.readdir(`./User_Data/${user_id}`, function(error, filelist){
    fs.readFile(`html/main.html`, 'utf8', function(err, body){
      body = body + HTMLS.List(filelist,user_id)
      var template = HTMLS.HTML(body,user_id)
      response.send(template)
    })
  })
})

app.get('/main/:userid', function(request, response){
  var user_id = request.params.userid
  try{
    fs.mkdirSync('User_Data/'+user_id);
    console.log(`${user_id} file created`)
  }catch(e){
    if(e.code!='EEXIST')throw e
  }
  fs.readdir(`./User_Data/${user_id}`, function(error, filelist){
    fs.readFile(`html/main.html`, 'utf8', function(err, body){
      body = body + HTMLS.List(filelist,user_id)
      var template = HTMLS.HTML(body,user_id)
      response.send(template)
    })
  })
})

app.get('/User_Data/:userid/:page', function(request, response){
  var user_id = request.params.userid
  var page = request.params.page
  _url = `/User_Data/${user_id}/${page}`;
  fs.readFile(`.${_url}`, 'utf8', function(err, body){
    var template = HTMLS.HTML2(body,user_id,page)
    response.send(template)
  })
})

app.get('/create/:userid', function(request, response){
  var user_id = request.params.userid
  fs.readFile(`./html/create.html`, 'utf8', function(err, body){
    var template = HTMLS.HTML(body,user_id);
    response.send(template);
  });
})

app.post('/create_table', function(request, response){
  var post = request.body
  var user_id = post.id
  var title = post.title
  var available = post.available
  fs.writeFile(`User_Data/${user_id}/${title}`,available,'utf8',function(err){
    response.redirect(`/main/${user_id}`)
  })
})

app.get('/update/:userid/:page',function(request,response){
  var user_id = request.params.userid
  var page = request.params.page
  fs.readFile(`html/update.html`, 'utf8', function(err, body){
    fs.readFile(`./User_Data/${user_id}/${page}`, 'utf8', function(err, body2){
      var template = HTMLS.HTML3(body,user_id,page,body2,page)
      response.send(template)
    })
  })
})

app.post('/update_table',function(request,response){
  var post = request.body
  var user_id = post.id
  var title = post.title
  var available = post.available
  var old_title = post.title_old
  fs.rename(`User_Data/${user_id}/${old_title}`, `User_Data/${user_id}/${title}`, function(error){
    fs.writeFile(`User_Data/${user_id}/${title}`, available, 'utf8', function(err){
      response.redirect(`/main/${user_id}`)
    })
  })
})

app.get('/delete/:userid/:page', function(request, response){
  var user_id = request.params.userid
  var page = request.params.page
  fs.unlink(`User_Data/${user_id}/${page}`, function(error){
    response.redirect(`/main/${user_id}`)
  })
})

if(args[2]!=undefined&&args[2]==='80')
{
  app.listen(80, () => console.log('[+]App Listening on port 80'))
}
else {
  app.listen(8000, () => console.log('[+]App Listening on port 8000'))
}
