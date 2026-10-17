// current contains the running process...
var kp = '' + current.parameters;

// strip the "-Xxxx" parameters, as they hold values that may change over a process's lifetime...
kp = kp.replace(/(\s|^)-X\S*(?=\s|$)/g, '');

// strip any debugger listener parameter, as they hold values that may change over a process's lifetime...
kp = kp.replace(/(\s|^)\S*transport=dt_\S*(?=\s|$)/g, '');

current.key_parameters = kp.trim();
