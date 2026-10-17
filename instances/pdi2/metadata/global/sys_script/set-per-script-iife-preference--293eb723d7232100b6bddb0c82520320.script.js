function onBefore(current,previous) {
	
	var script = current.getValue("script");
	var scopeName = current.sys_scope.scope;
	var scriptName = current.getValue("script_name");

	current.use_scoped_format = matchesUIScriptIIFEPattern(script,scopeName,scriptName)
	
	function matchesUIScriptIIFEPattern(script, scopeName, scriptName) {
		if ("global" == scopeName)
			return rc;

		var rc = true;
		var requiredStart =  "var"+scopeName+"="+scopeName+"||{};"+scopeName+"."+scriptName+"=(function(){\"usestrict\";";
		var requiredEnd = "})();";

		script = removeWhitespace(script);
	
		if (!script.startsWith(requiredStart))
			rc = false;

		if (!script.endsWith(requiredEnd))
			rc = false;

		return rc;
	}

	/* remove any whitespace including comments whether "C" style or double slash to end of line */
	function removeWhitespace(code) {
    	var multiline = /\/\*(.|[\r\n])*?\*\//g;
    	var singleline = /\/\/.*/g;
		var spaces = /\s*/g;
		var newlines = /[\r\n]*/g;

		code = code.replace(multiline,""); 
    	code = code.replace(singleline,"");
		code = code.replace(spaces,"");
		code = code.replace(newlines,"");
		
    	return code;
	}
}
onBefore(current,previous);
