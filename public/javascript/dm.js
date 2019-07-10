$(function() {
  $("body").on({
    click: function(e) {
      let id = e.currentTarget.value;
      $("#main").append('<div class="chatroom" id="'+ id + '"><h3>' + id + '</h3></div>');
      let recv = db.get('messages').filter({receiver:user_id}).value();
      let send = db.get('messages').filter({receiver:user_id}).value();
      $("#" + id).html(recv);
    }
  }, ".chatlist");
});
