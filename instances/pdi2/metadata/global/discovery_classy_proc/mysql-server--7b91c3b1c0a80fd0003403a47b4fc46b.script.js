var classifierGrConf = new GlideRecord('discovery_classifier_probe');
var classifierGrVer = new GlideRecord('discovery_classifier_probe');
var classifierGrConfW = new GlideRecord('discovery_classifier_probe');
var classifierGrVerW= new GlideRecord('discovery_classifier_probe');
 
classifierGrConf.get('738560a7df1221001e02a3cf6bf26393');
classifierGrVer.get('844b7fb1df5221001e02a3cf6bf2638e');
classifierGrConfW.get('6110729b0a0a0a6f00c762116b704203');
classifierGrVerW.get('613760ee0a0a0a6f019876a225c538de');
 
if (classifierGrConf.active || 
	classifierGrVer.active ||
    classifierGrConfW.active ||
    classifierGrVerW.active)

{              
	// Incase at least one probe related classifier conditions is true - run the below probe classification script before executing probe
	// otherwise this script will be overidden and pattern wil be executed instead
	var matches = parameters.match(/--port=(\d+)/);
	if (matches)
		current.tcp_port = matches[1];
	else if (JSUtil.notNil(g_process.listening_on))
		current.tcp_port = g_process.listening_on;

	/*Logic:
	From process parameters first try to read value of --defaults-extra-file and then --defaults-file if value exist.
	if the paths is relative, and --basedir value is provided then combine relative path with base path to get fullpath.
	Note: Below RegEx does not work if path contains dash(-) and It works only if config files has .ini or .cnf extension.
	 */

	if(type == 'windows') {
		g_probe_parameters['commandVal'] = command;

		var configFilePath = "";
		var matches = null;
		var path = null;

		matches = parameters.match(/--defaults-extra-file=("?[\w\.\s:%\/\\]+[ini|cnf]"?)/);
		if (matches)
			path = matches[1];
		else {
			matches = parameters.match(/--defaults-file=("?[\w\.\s:%\/\\]+[ini|cnf]"?)/);
			if (matches)
				path = matches[1];
		}
		if (JSUtil.notNil(path)) {
			path = path.replace(/"/g, '');
			var fullPathPatternMatch = path.match(/([a-zA-z]:[\\\/])|(%[\w]+%[\\\/])/);
			if(fullPathPatternMatch){
				configFilePath = path;
			} else {
				var basedirMatches = parameters.match(/--basedir=("?[\w\.\s:%\/\\]+"?)/);
				if (basedirMatches) {
					var basedirPath = basedirMatches[1].replace(/"/g, '');
					configFilePath = basedirPath + '\\' + path;
				} else {
					configFilePath = path;
				}
			}
		} else {
			configFilePath = '';
		}

		g_probe_parameters['configFilePathVal'] = configFilePath;
		if (gs.nil(configFilePath))
			g_sensor.warn("Value for configFilePath is empty. Invocation of Probe 'WMIRunner-Windows - MySQL Configuration' will be skipped.");
	}
}
