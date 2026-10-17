var matches = name.match(/^\S+\s+(\S+).*$/);
if (matches)
    current.name = matches[1] + '@' + g_sensor.deviceGR.name;
    
current.oracle_home = command.substring(0, command.indexOf('bin/tnslsnr') - 1);
g_probe_parameters.listener = matches ? matches[1] : 'LISTENER';
g_probe_parameters.oracle_home = current.oracle_home;
