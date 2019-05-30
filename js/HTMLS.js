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
        <link rel="stylesheet" href="?id=css&page=${title}.css">
        <title>TTT - Time To Teamplay</title>
      </head>
      <body>
        ${body}
      </body>
    </html>
    `;
  },

  HTML2:function(body, id, page){
    return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>TTT - Time To Teamplay</title>
        <script type="text/javascript">
          var u_id="${id}";
          var u_page="${page}";
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
            location.href = url+"/"+u_page;
          }
        </script>
        <p>
          <a href="javascript:openPage('/update')">update</a>
          <a href="javascript:openPage('/delete')">delete</a>
        </p>
      </body>
    </html>
    `;
  },

  HTML3:function(body, id, page, able, old){
    return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>TTT - Time To Teamplay</title>
        <script type="text/javascript">
          var u_id="${id}";
          var u_page="${page}";
          var u_able="${able}";
          var u_old="${old}";
          function initialize(){
            document.getElementById('user_id').value=u_id;
            document.getElementById('user_title').value=u_page;
            document.getElementById('user_able').value=u_able;
            document.getElementById('user_title_old').value=u_old;
          }
        </script>
      </head>
      <body onload="initialize()">
        ${body}
      </body>
    </html>
    `;
  },

  List:function(filelist){
    var list = '<ul>';
    var i = 0;
    if(filelist!=undefined){
      while(i < filelist.length){
        list = list + `<li><a href="/User_Data/${filelist[i]}">${filelist[i]}</a></li>`;
        i = i + 1;
      }
      list = list+'</ul>';
      return list;
    }
    return "";
  }
}
