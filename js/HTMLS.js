module.exports = {
  HTML:function(body, id){
    return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>TTT - Time To Teamplay</title>
        <script type="text/javascript">
          var u_id="${id}";
          function initialize(){
            document.getElementById('user_id').value=u_id;
          }
        </script>
      </head>
      <body onload="initialize()">
        ${body}
      </body>
    </html>
    `;
  },

  HTML_login:function(title, body){
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
    `;
  },

  HTML_about:function(title, body){
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
    `;
  },

  HTML2:function(body, id, page, pid){
    return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>TTT - Time To Teamplay</title>
        <script type="text/javascript">
          var u_id="${id}";
          var u_page="${page}";
          var id="${pid}";
          function input_id(){
            document.getElementById('user_id').value=u_id;
          }
        </script>
      </head>
      <body onload="input_id()">
        <h1>${id}'s Timeline "${page}"</h1>
        <p><h2>${body}</h2></p>
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
    `;
  },

  HTML3:function(body, page, able, pid){
    return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>TTT - Time To Teamplay</title>
        <script type="text/javascript">
          var u_page="${page}";
          var u_able="${able}";
          var pid="${pid}";
          function initialize(){
            document.getElementById('user_title').value=u_page;
            document.getElementById('user_able').value=u_able;
            document.getElementById('pid').value=pid;
          }
        </script>
      </head>
      <body onload="initialize()">
        ${body}
      </body>
    </html>
    `;
  },

  HTML4:function(body, id, page, pid, select){
    return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>TTT - Time To Teamplay</title>
        <script type="text/javascript">
          var u_id="${id}";
          var u_page="${page}";
          var id="${pid}";
          function input_id(){
            document.getElementById('user_id').value=u_id;
          }
        </script>
      </head>
      <body onload="input_id()">
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
          <a href="javascript:openPage('/event/delete')">delete</a>
        </p>
      </body>
    </html>
    `;
  },

  tableList:function(filelist){
    var list = `<p><u>TABLES</u></p><ul>`
    var i = 0
    if(filelist!=undefined){
      while(i < filelist.length){
        list = list + `<li><a href="/table/User/${filelist[i].id}">${filelist[i].title}</a></li>`
        i = i + 1
      }
      list = list+'</ul>'
      return list
    }
    return ""
  },

  eventList:function(filelist,u_id){
    var list = `<p><u>EVENTS</u></p>`
    var i = 0
    if(filelist!=undefined){
      list = list + '<ul>'
      while(i < filelist.length){
        if(filelist[i].part.includes(u_id)){
          list = list + `<li><a href="/event/User/${filelist[i].id}">${filelist[i].title}</a></li>`
        }
        i = i + 1
      }
      list = list+'</ul>'
      return list
    }
    return ""
  }
}
