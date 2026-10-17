current.type = 'Apache';

// Create a new object to process parameters
var discoUtil = new ProcessParamParser(parameters);

// If Apache2 is running on Ubuntu or Debian, the result of ps command for apache will be like 
// PID  TTY      STAT   TIME  COMMAND
// 1669 ?        S      0:02  /usr/sbin/apache2 -k start
// However to find the version and other configuration info we need to run "apache2ctl" command. 
if (command.endsWith('apache2'))
	g_probe_parameters['httpd_command'] = 'apache2ctl';
else
	g_probe_parameters['httpd_command'] = command;

// Get the data directory and configuration paths using -d and -f options
var httpdDir = discoUtil.getParameterByOption('d');
var httpdCfg = discoUtil.getParameterByOption('f');

// If the paths contain white space wrap them in double quotes
httpdDir = discoUtil.putDoubleQuotes(httpdDir);
httpdCfg = discoUtil.putDoubleQuotes(httpdCfg); 

// Set the probe parameters
g_probe_parameters['httpd_dir'] = httpdDir;
g_probe_parameters['httpd_cfg'] = httpdCfg;



	
