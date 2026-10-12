var loadingImg = '<img height="16" border="0" width="16" src="images/loading_anim2.gifx"/>';

function submit() {
 setMessages(loadingImg + "Running...");
 var g = $("submit_button");
 g.value = "Retrieving...";
 g.disabled = true;
 var ga = new GlideAjax('UIPage');
 ga.addParam('sysparm_name','ajaxTest');
 ga.getXMLAnswer(submitResponse);
}
  
function submitResponse(answer) {   
 setMessages(answer);
 var g = $("submit_button");
 g.disabled = false;
 g.value = "Do it";
 return false;
}

function setMessages(message) {
 var div = $("messages");
 div.innerHTML = message;
}
