var params = parameters.trim();
var discoUtil = new ProcessParamParser(params);
g_probe_parameters['hp_command'] = command;

var haproxyDir = discoUtil.getParameterByOption('D');
var haproxyCfg = discoUtil.getParameterByOption('f');

if (JSUtil.nil(haproxyCfg))
	haproxyCfg = '/etc/haproxy/haproxy.cfg';
if (JSUtil.nil(haproxyDir))
	haproxyDir = '/etc/haproxy';

haproxyCfg = discoUtil.getCompletePath(haproxyCfg,haproxyDir);
// If the config path contains some white spaces, we wrap the path in double quotes.
haproxyCfg = discoUtil.putDoubleQuotes(haproxyCfg);

current.config_file = haproxyCfg;
g_probe_parameters['hp_cfg'] = haproxyCfg;
