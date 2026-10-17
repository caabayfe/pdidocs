(function executeRule(current, previous /*null when async*/) {
	var method = current.http_method.nil() ? '(empty)' : current.http_method.toString().toUpperCase();
	var path = current.path.nil() ? '(empty)' : current.path.toString();
	current.name = method + ' ' + path;
})(current, previous);
