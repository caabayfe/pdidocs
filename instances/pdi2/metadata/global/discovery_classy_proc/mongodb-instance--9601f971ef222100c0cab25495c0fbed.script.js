var port_matches = parameters.match(/--port(=|\s+)(\d+)/); 
current.tcp_port = "";
var port_set = false;
if ((port_matches) && (port_matches[1]) && (port_matches[2])) {
    port_set = true;
    current.tcp_port = port_matches[2];
}


// --config /etc/mongod.conf
// --config=/etc/mongod.conf
// -f /etc/mongod.conf
// -f /mongo db/etc/mongod.conf


// find configuration file, if there are any using similar logic as in "PsOutputParser"
// this is more challenging than it might appear, as all of the following are possible:
//    (--config=|--config |-f )/usr/conf/xxx -a
//                                                            ^-next parameter
//    (--config=|--config |-f )/usr/conf/xxx /usr/bin/yyy -a
//                                                           ^- next parameter
//    (--config=|--config |-f )/usr/bin abc/xxx -a
//                                                                 ^- next parameter
//    (--config=|--config |-f )/usr/bin/xxx yyy -a
//                                                                 ^- next parameter
//    (--config=|--config |-f )/usr/bin/xxx yyy ccc -a
//                                                                      ^- next parameter	

var answer  = "";
var path = undefined;

var config_matches = parameters.match(/--config[=|\s](.+)/);
if (config_matches)
    path = config_matches[1];
else {
    config_matches = parameters.match(/-f\s(.+)/);
    if (config_matches)
        path = config_matches[1];
}

if (path != undefined) {
    var parts = path.split(' ');
    var j;
    for (j = 1; j < parts.length; j++) {
          var c = parts[j].charAt(0);
                
           // if this part starts with something we can tell is a parameter, run with it...
           if ((c == '-') || (c == '/'))
               break;
    }
    path = parts.slice(0, j).join(' ');
    path.trim();
    if (path.indexOf(" ") > -1)
        path ='"'+path+'"';
    answer = path;
}

if (answer != "") {
	g_probe_parameters['filename'] = answer;
	g_probe_parameters['port_set'] = port_set;
} else
	g_sensor.warn("Cannot find valid config filepath. Invocation of Probe 'Unix - MongoDB Configuration' will be skipped.");
