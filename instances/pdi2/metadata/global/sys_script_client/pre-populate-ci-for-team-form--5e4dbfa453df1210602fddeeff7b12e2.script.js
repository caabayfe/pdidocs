function onLoad() {
   //Type appropriate comment here, and begin script below
   var ci = getParameterValue('sysparm_ci');
   if(ci){
		g_form.setValue('ci', ci);
   }
}

function getParameterValue(name) {
	var url = document.URL.parseQuery();
    if (url[name]) {
        return decodeURI(url[name]);
    }
}
