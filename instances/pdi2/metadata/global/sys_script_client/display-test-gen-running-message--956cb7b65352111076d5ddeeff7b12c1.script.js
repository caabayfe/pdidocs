function onLoad() {
   //Type appropriate comment here, and begin script below
	var ga = new GlideAjax("ParallelTestDisplayMessages");
	ga.addParam('sysparm_name', 'isTestGenRunning');
	ga.getXMLAnswer(getResponse);
}

function getResponse(response){
	if (response === "true")
		getMessage("ATF_TG:test_suite_message_during_test_gen", function (message) {g_form.addInfoMessage(message);});
   
}
