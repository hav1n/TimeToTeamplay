var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var args = process.argv;
var HTMLS = require('./js/HTMLS.js');

console.log(args[2]);
var app = http.createServer(function(request,response){
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  console.log(pathname)

  if(pathname === '/')
  {
    if(_url == '/' || queryData.id===undefined){
      fs.readFile(`./html/login.html`, 'utf8', function(err, body){
        var title = 'login';
        var template = HTMLS.HTML_CSS(title, body);
        response.writeHead(200);
        response.end(template);
      });
      _url = '/html/login.html';
      console.log(_url);
    }
    else{
      _url = `/${queryData.id}/${queryData.page}`;
      response.writeHead(200);
      console.log(_url);
      response.end(fs.readFileSync(__dirname+_url));
    }
  }
  else if(pathname==='/about' || pathname==='/create')
  {
    fs.readFile(`./html${pathname}.html`, 'utf8', function(err, body){
      var template = HTMLS.HTML(body,queryData.id);
      response.writeHead(200);
      response.end(template);
      _url='/html'+pathname+'.html';
      console.log(_url);
    });
  }
  else if(pathname==='/main')
  {
    console.log(queryData.id);
    try{
      fs.mkdirSync('User_Data/'+queryData.id);
      console.log(`${queryData.id} file created`);
    }catch(e){
      if(e.code!='EEXIST')throw e;
    }
    fs.readdir(`./User_Data/${queryData.id}`, function(error, filelist){
      console.log(filelist);
      fs.readFile(`html/main.html`, 'utf8', function(err, body){
        var id = queryData.id;
        body = body + HTMLS.List(filelist,id);
        var template = HTMLS.HTML(body,id);

        response.writeHead(200);
        response.end(template);
      });
    });
  }
  else if(pathname==='/create_table')
  {
    var body = '';
    request.on('data', function(data){
      body = body + data;
    });
    request.on('end', function(){
      var post = qs.parse(body);
      console.log(post);
      var user_id = post.id;
      var title = post.title;
      var available = post.available;
      fs.writeFile(`User_Data/${user_id}/${title}`,available,'utf8',function(err){
        response.writeHead(302,{Location: `/main?id=${user_id}`});
        response.end();
      })
    });
  }
  else if(pathname === '/User_Data')
  {
    _url = `/User_Data/${queryData.id}/${queryData.page}`;
    fs.readFile(`.${_url}`, 'utf8', function(err, body){
      var template = HTMLS.HTML2(body,queryData.id,queryData.page);
      response.writeHead(200);
      console.log(_url);
      response.end(template);
    });
  }
  else if(pathname === '/update')
  {
    fs.readFile(`html/update.html`, 'utf8', function(err, body){
      fs.readFile(`./User_Data/${queryData.id}/${queryData.page}`, 'utf8', function(err, body2){
        var template = HTMLS.HTML3(body,queryData.id,queryData.page,body2,queryData.page);
        response.writeHead(200);
        response.end(template);
      });
    });
  }
  else if(pathname === '/update_table')
  {
    var body = '';
    request.on('data', function(data){
      body = body + data;
    });
    request.on('end', function(){
      var post = qs.parse(body);
      console.log(post);
      var user_id = post.id;
      var title = post.title;
      var available = post.available;
      var old_title = post.title_old;
      `User_Data/${user_id}/${title}`
      fs.rename(`User_Data/${user_id}/${old_title}`, `User_Data/${user_id}/${title}`, function(error){
        fs.writeFile(`User_Data/${user_id}/${title}`, available, 'utf8', function(err){
          response.writeHead(302, {Location: `/main?id=${user_id}`});
          response.end();
        })
      });
    });
  }
  else if(pathname === '/delete')
  {
    fs.unlink(`User_Data/${queryData.id}/${queryData.page}`, function(error){
      response.writeHead(302, {Location: `/main?id=${queryData.id}`});
      response.end();
    })
  }
  else {
    response.writeHead(404);
    console.log(_url+" Not Found");
    response.end('404 Not found');
  }
});
if(args[2]!=undefined&&args[2]==='80')
{
  app.listen(80);
}
else {
  app.listen(8000);
}
