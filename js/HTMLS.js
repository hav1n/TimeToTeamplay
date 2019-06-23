var fs = require('fs')

module.exports = {
  //base HTML
  HTML_base:function(title, body){
    return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <link rel="stylesheet" href="/css/${title}.css">
        <title>TTT - Time To Teamplay</title>
      </head>
      <body>
        ${body}
      </body>
    </html>
    `
  },
  //main page HTML
  HTML_main:function(body, id){
    return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <link rel="stylesheet" href="/css/table.css">
        <title>TTT - Time To Teamplay</title>
        <script type="text/javascript">
          var u_id="${id}";
        </script>
      </head>
      <body>
        ${body}
      </body>
    </html>
    `
  },

  HTML_table:function(body, id, page, pid, available){
    return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <link rel="stylesheet" href="/css/table.css">
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
        <script src="/javascript/table.js"></script>
        <title>TTT - Time To Teamplay</title>
        <script type="text/javascript">
          var u_page="${page}";
          var id="${pid}";
          var available="${available}";
          var ids = available.split(',');
        </script>
      </head>
      <body>
        <h1>${id}'s Timetable "${page}"</h1>
        ${body}
        <script>
          openPage = function(url) {
            location.href = url+"/"+id;
          }
        </script>
        <p>
          <a href="javascript:openPage('/table/update')">update</a>
          <a href="javascript:openPage('/table/delete')">delete</a>
        </p>
      </body>
    </html>
    `
  },

  HTML_update:function(body, page, able, pid){
    return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <link rel="stylesheet" href="/css/update.css">
        <title>TTT - Time To Teamplay</title>
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
        <script src="/javascript/update.js"></script>
        <script type="text/javascript">
          var u_page="${page}";
          var available="${able}";
          var pid="${pid}";
          function initialize(){
            document.getElementById('user_title').value=u_page;
          }
        </script>
      </head>
      <body onload="initialize()">
        ${body}
      </body>
    </html>
    `
  },

  HTML_event:function(body, id, page, pid, select, size){
    return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <link rel="stylesheet" href="/css/event.css">
        <title>TTT - Time To Teamplay</title>
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
        <script src="/javascript/event.js"></script>
        <script type="text/javascript">
        $(function(){
          var id="${pid}";
          var size=${size}+1;
          for(i=0;i<size;i++)
          {
            var now_id = '#sp'+String(i);
            var table_class = '.hl'+String(i);
            var alpha = i/size;
            var rgbaCol = 'rgba(124,133,255,'+alpha+')';
            console.log(rgbaCol);
  	        $(now_id).css("background-color",colors[Math.round(i*3/(size-1))]);
            $(table_class).css("background-color",colors[Math.round(i*3/(size-1))]);
          }
        });
        </script>
      </head>
      <body>
        <h1>${id}'s event "${page}"</h1>
        <p><h3>input ${pid} to join</h3></p>
        <p><h2>Participants : ${body}</h2></p>
        ${select}
        <script>
          openPage = function(url) {
            location.href = url+"/"+id;
          }
        </script>
        <p>
          <a href="javascript:openPage('/event/delete/${page}')">delete</a>
        </p>
      </body>
    </html>
    `
  },

  HTML_create:function(title, body){
    return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <link rel="stylesheet" href="/css/${title}.css">
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js" type="text/javascript"></script>
        <script src="/javascript/${title}.js"></script>
        <title>TTT - Time To Teamplay</title>
      </head>
      <body>
        ${body}
      </body>
    </html>
    `
  },

  tableList:function(filelist){
    var list = `<ul>`
    var i = 0
    if(filelist!=undefined){
      while(i < filelist.length){
        list = list + `<li><a href="/table/User/${filelist[i].id}">${filelist[i].title}</a></li>`
        i = i + 1
      }
      list = list+'</ul>'
      return list
    }
    return list
  },

  eventList:function(filelist,u_id){
    var list = `<ul>`
    var i = 0
    if(filelist!=undefined){
      while(i < filelist.length){
        if(filelist[i].part.includes(u_id)){
          list = list + `<li><a href="/event/User/${filelist[i].id}">${filelist[i].title}</a></li>`
        }
        i = i + 1
      }
      list = list+'</ul>'
      return list
    }
    return list
  }
}
