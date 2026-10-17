var classifierGrVer = new GlideRecord('discovery_classifier_probe');
var classifierGrConf = new GlideRecord('discovery_classifier_probe');

classifierGrVer.get('name','SSHCommand-PostgreSQL - Version');
classifierGrConf.get('name','SSHCommand-PostgreSQL - Configuration');

if (classifierGrConf.active || classifierGrVer.active)
{

	// Incase at least one probe related classifier conditions is true - run the below probe classification script before executing probe
	// otherwise this script will be overidden and pattern will be executed instead
	var matches = parameters.match(/-p (\d+)/);

	if (matches)
		current.tcp_port = matches[1];
	else if (JSUtil.notNil(g_process.listening_on)) {
		matches = g_process.listening_on.match(/:(\d+):/);	// take the first port in the case of multiple
		current.tcp_port = matches[1];
	}

	var multi_switch_pattern = /-D\s+(.+)\s-/;
	var single_switch_pattern = /-D\s+(.+)/;
	// The parameters might contain multiple command line switches. Thus, attempting to match the parameters with second command line switch pattern match first. If that was not the case, then falling back to use the single command line switch pattern match.
	matches = parameters.match(multi_switch_pattern);
	if( JSUtil.nil(matches)) {
		matches = parameters.match(single_switch_pattern);
	}

	// The following regex is looking for something along the lines of "config_file=_some_path/postgresql.conf"
	var config_match = parameters.match(/config_file[=|\s](.+)/);

	if (matches) {
		current.config_directory = '' + matches[1];

		// for PostrgreSQL - Configuration
		var config_file = current.config_directory + '/postgresql.conf';
		if(config_match)
			config_file = config_match[1];
		current.config_file = config_file;
			g_probe_parameters['pgsql_conf_file'] = config_file;
	} else
		g_sensor.warn('Could not detect configuration file path from running process.  PostgreSQL - Configuration probe will not be triggered.');
}
