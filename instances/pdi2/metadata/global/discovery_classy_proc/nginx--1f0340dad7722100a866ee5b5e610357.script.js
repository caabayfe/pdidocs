current.type = "Nginx";
var discoUtil = new ProcessParamParser(parameters);

// Command for nginx is the first parameter
var cmd = discoUtil.getParameterByIndex(0);
if (cmd.indexOf('-') == 0)
	cmd = 'nginx';

g_probe_parameters['nginx_command'] = cmd;
          

var nginxDir = '';

// Find optional process start source
// If one is set the the command from the first paramater is the path for the config
var processStartSrc = discoUtil.getParameterByOption('p');
if (!JSUtil.nil(processStartSrc) && !JSUtil.nil(cmd))
	nginxDir = cmd;
else {
	// Find data Directory for nginx, the option for this path is -d or -D
	// If it is not defined we set it as a default value
	nginxDir = discoUtil.getParameterByOption('d');
	if (JSUtil.nil(nginxDir))
		nginxDir = discoUtil.getParameterByOption('D');

	if (JSUtil.nil(nginxDir))
		nginxDir = '/etc/nginx';
}

// Find Configuration path
// If no path is found we set as a default value
var nginxCfg = discoUtil.getParameterByOption('c');
if (JSUtil.nil(nginxCfg))
	nginxCfg = '/etc/nginx/nginx.conf';

if (!JSUtil.nil(nginxDir) && nginxDir[nginxDir.length - 1] == '/')
	nginxDir = nginxDir.substring(0, nginxDir.length - 1);

nginxCfg = discoUtil.getCompletePath(nginxCfg,nginxDir);
nginxCfg = discoUtil.putDoubleQuotes(nginxCfg);

g_probe_parameters['nginx_cfg'] = nginxCfg;
