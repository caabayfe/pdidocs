
function restart(){
	var userResponse = confirm("Are you sure you want to restart flow with the same inputs ?");

	if(userResponse) {
		var ga = new GlideAjax('RestartFlow');
		ga.addParam('sysparm_name','restartFlow');
		var id =  g_form.getUniqueValue();
		ga.addParam('sysparm_sys_id', id); 
		ga.getXML(function(res){}); 
	}
}
