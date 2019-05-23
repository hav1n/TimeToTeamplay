var http = require('http');
var fs = require('fs');
var url = require('url');
var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;

    console.log(queryData);
    if(pathname === '/')
    {
      if(_url == '/'){
        _url = '/index.html';
      }
      else{
        _url = `/${queryData.id}/${queryData.page}`;
      }
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
app.listen(8000);
