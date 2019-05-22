var http = require('http');
var fs = require('fs');
var url = require('url');
var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    console.log(queryData);
    if(_url == '/'){
      _url = '/index.html';
    }
    else if(_url == '/favicon.ico'){
      return response.writeHead(404);
      response.end();
      return;
    }
    else{
      _url = `/${queryData.id}/${queryData.page}`;
    }
    response.writeHead(200);
    console.log(_url);
    response.end(fs.readFileSync(__dirname+_url));
});
app.listen(8000);
