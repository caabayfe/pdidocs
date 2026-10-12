function onLoad() {
	setScript();
}

function setScript() {
	var script = g_form.getValue('title_script');

	var isMine = false;
	if (script == scriptTemplate.replace(/\r/g, ""))
		isMine = true;
	if (script == '')
		isMine = true;

	if (!isMine)
		return;

	script = scriptTemplate;

	g_form.setValue('title_script', script);
}

var scriptTemplate = "(function(urlParameters) {\r\n  /* Return a string from this function */\r\n  /* Access URL parameters from properties on the urlParameters object */\r\n  \r\n  return '';\r\n})();";
