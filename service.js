var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var args = process.argv;

function templateHTML(body, id){
  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>TTT - Time To Teamplay</title>
      <script type="text/javascript">
        var u_id="${id}";
        function input_id(){
          document.getElementById('user_id').value=u_id;
        }
      </script>
    </head>
    <body onload="input_id()">
      ${body}
    </body>
  </html>
  `;
}

function templateHTML_CSS(title, body){
  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8">
      <link rel="stylesheet" href="?id=css&page=${title}.css">
      <title>TTT - Time To Teamplay</title>
    </head>
    <body>
      ${body}
    </body>
  </html>
  `;
}

function templateList(filelist, id){
  var list = '<ul>';
  var i = 0;
  if(filelist!=undefined){
    while(i < filelist.length){
      list = list + `<li><a href="/User_Data?id=${id}&page=${filelist[i]}">${filelist[i]}</a></li>`;
      i = i + 1;
    }
    list = list+'</ul>';
    return list;
  }
  return "";
}

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
        var template = templateHTML_CSS(title, body);
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
      var template = templateHTML(body,queryData.id);
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
      console.log(e);
      if(e.code!='EEXIST')throw e;
    }
    fs.readdir(`./User_Data/${queryData.id}`, function(error, filelist){
      console.log(filelist);
      fs.readFile(`html/main.html`, 'utf8', function(err, body){
        var id = queryData.id;
        body = body + templateList(filelist,id);
        var template = templateHTML(body,id);

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
      console.log(body);
      var post = qs.parse(body);
      console.log(post);
      var user_id = post.id;
      var title = post.title;
      var available = post.available;
      fs.writeFile(`User_Data/${user_id}/${title}`,available,'utf8',function(err){
        response.writeHead(302,{Location: `/User_Data?id=${user_id}&page=${title}`});
        response.end('Success');
      })
    });
  }
  else if(pathname === '/User_Data')
  {
    _url = `/User_Data/${queryData.id}/${queryData.page}`;
    response.writeHead(200);
    console.log(_url);
    response.end(fs.readFileSync(__dirname+_url));
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
