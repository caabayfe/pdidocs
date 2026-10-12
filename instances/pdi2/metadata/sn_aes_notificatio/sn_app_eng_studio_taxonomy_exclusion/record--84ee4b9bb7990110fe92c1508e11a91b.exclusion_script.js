(function(current) {
	return !current.canWrite() || current.getValue('type') !== 'email' || current.getValue('sys_version') !== '2';
})(current);
