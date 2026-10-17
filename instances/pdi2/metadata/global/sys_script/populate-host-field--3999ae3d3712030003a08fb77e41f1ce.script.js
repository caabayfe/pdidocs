function extractBetweenSlashes(url) {
	var hostname;

    if (url.indexOf("://") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    return hostname;
}

(function executeRule(current, previous /*null when async*/) {
	var host;
	
	if (current.sys_class_name == 'http_connection') {
		if (current.url_builder == 'true')
			return;
		
		host = extractBetweenSlashes(current.connection_url.trim());
		if (host.indexOf('@') != -1)
			host = host.split('@')[1];
		
		host = host.split('?')[0];
	} else if (current.sys_class_name == 'orch_jms_ds') {
		host = extractBetweenSlashes(current.provider_url.trim());
	} else {
		return;
	}
	
	current.host = host.split(':')[0];
})(current, previous);
