/*create.js*/
var days = ["","Mon","Tue","Wed","Thu","Fri"];
var times = ["9AM","10AM","11AM","12PM","1PM","2PM","3PM","4PM","5PM","6PM"];
var day_len = 5;
var time_div = 4;

function sendPost(action, params) {
	var form = document.createElement('form');
	form.setAttribute('method', 'post');
	form.setAttribute('action', action);
	document.charset = "utf-8";
	for(var key in params){
		var hiddenField = document.createElement('input');
		hiddenField.setAttribute('type', 'hidden');
		hiddenField.setAttribute('name', key);
		hiddenField.setAttribute('value', params[key]);
		form.appendChild(hiddenField);
	}
	document.body.appendChild(form);
	form.submit();
}

$(function () {
  var isMouseDown = false, isHighlighted;
  var from, to, from_k, to_k, from_time, to_time;
  $("td")
  .mousedown(function () {
    isMouseDown = true;
    from = $(this).attr('id');
    to = $(this).attr('id');
    $(this).toggleClass("highlighted");
    isHighlighted = $(this).hasClass("highlighted");
    return false; // prevent text selection
  })
  .mouseover(function () {
    if (isMouseDown) {
      to = $(this).attr('id');
      from_k = from[5]>to[5]?to[5]:from[5];
      to_k = from[5]>to[5]?from[5]:to[5];
      from_time = Number(from[3]+from[4]);
      to_time = Number(to[3]+to[4]);
      if(from_time>to_time){
        temp = from_time;
        from_time = to_time;
        to_time = temp;
      }
      for(k=Number(from_k); k<=Number(to_k) ; k++)
      {
        for(i=from_time;i<=to_time;i++)
        {
          if(i%10===4){
            i+=5;
            continue;
          }
          var sel_id = "#td_";
          if(i===0)sel_id += "00";
          else sel_id += i>=10 ? i.toString() : "0"+ i.toString();
          sel_id += k.toString();
          $(sel_id).toggleClass("highlighted", isHighlighted);
        }
      }
    }
  })
  .mouseup(function (){
    to = $(this).attr('id');
    isMouseDown = false;
  })
  .bind("selectstart", function () {
    return false;
  })

  $(document)
  .mouseup(function () {
    isMouseDown = false;
  })

  $('[type="submit"]')
  .click(function(){
    var action = 'create_table';
    var params = {};
    var td = $('td');
    params['title'] = $('input[name="title"]').val();
    if(params['title'] === ""){
      alert('Please Input Title');
      return;
    }
    for (i = 0; i < td.length; i++) {
      var id = $(td[i]).attr('id');
      if($(td[i]).attr('class') === "highlighted"){
        params[id] = true;
      }
    }
    sendPost(action, params);
  });
});
