var classifierGrPshell = new GlideRecord('discovery_classifier_probe');
var classifierGrSsh = new GlideRecord('discovery_classifier_probe');

classifierGrPshell.get('name','Powershell-Windows - Weblogic - Find con');
classifierGrSsh.get('name','SSHCommand-Linux - Weblogic - Find confi');
// naming script, input vars are command, name, parameters, set answer

if(classifierGrPshell.active || classifierGrSsh.active)
{
	// Incase at least one probe related classifier conditions is true - run the below probe classification script before executing probe
	// otherwise this script will be overidden and pattern will be executed instead
	_parseCommmandParams();
}

function _parseCommmandParams() {

	// First, parse parameters string var to produce allParamPairs array-of-arrays for use by extractParam().
	//   allParamPairs[n][0] = param name and value + trailing whitespace
	//   allParamPairs[n][1] = param name and value
	//   allParamPairs[n][2] = param name
	//   allParamPairs[n][3] = param value
	// Plug regex string into regex101.com for full explanation of how it works!
	var allParamPairs = [];
	var regex = /((\/{0,1}-{0,2}[a-zA-Z0-9_.]+)(?:[=:]("[^"]+"|'[^']+'|[^\s"]+))?)(?:\s+|$)/g;
	var match;
	while (!!(match = regex.exec(parameters))) {
		allParamPairs.push(match);
	}

	if (JSUtil.notNil(g_process.listening_on))
		current.tcp_port = g_process.listening_on;

	g_probe_parameters['server'] = extractParam('-Dweblogic.Name');
	current.name = g_probe_parameters['server'] + '@' + g_sensor.deviceGR.name;

	if (type == 'unix') {
		// Attempt to find config.xml via parameters
		var config = extractParam("-Dweblogic.ConfigFile");
		var root = extractParam("-Dweblogic.RootDirectory");
		// Try parent process if cannot find config.xml via parameters
		g_probe_parameters['ppid'] = g_process.ppid;
		// Set to undefined originally so we can correctly process this case in the probe parameter
		g_probe_parameters['config'] = "undefined";

		if (JSUtil.notNil(root))
			g_probe_parameters['config'] = JSUtil.notNil(config) ? root + "/config/" + config : root + "/config/config.xml";

	}

	// From: http://docs.oracle.com/cd/E13222_01/wls/docs90/admin_ref/weblogicServer.html
	if (type == 'windows') {
		g_probe_parameters['config'] = extractParam("-Dweblogic.ConfigFile");
		g_probe_parameters['root'] = extractParam("-Dweblogic.RootDirectory");
		g_probe_parameters['home'] = extractParam("-Dplatform.home");
	}

	// Return value for the specified paramName.  paramName must include any leading /, -, or  --.
	// If param value is enclosed within "" or '', the quotes are stripped from the return value.
	// If cannot find param name, returns undefined.
	function extractParam(paramName) {
		var val;
		for (var k = 0; k < allParamPairs.length; k++) {
			if (paramName == allParamPairs[k][2]) {
				val = allParamPairs[k][3];
				// strip any begin/end quotes
				if (val.length  >= 2 && (val[0] == "'" || val[0] == '"'))
					val = val.substring(1, val.length - 1);

				break;
			}
		}
		return val;
	}
}
