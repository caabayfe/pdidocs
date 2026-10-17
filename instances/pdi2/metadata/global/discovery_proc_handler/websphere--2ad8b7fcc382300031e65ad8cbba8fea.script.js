// current contains the running process record...
var kp = '' + current.parameters;

// strip the " -Dwas.status.socket=..." parameter which can change when websphere is restarted
kp = kp.replace(/(\s|^)-Dwas.status.socket\S*(?=\s|$)/g, '');

current.key_parameters = kp.trim();
