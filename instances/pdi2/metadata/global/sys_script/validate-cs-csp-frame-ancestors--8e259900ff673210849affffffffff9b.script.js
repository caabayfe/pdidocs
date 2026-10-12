(function executeRule(current, previous /*null when async*/) {
	var domain = /^(https?:\/\/)?(\*\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:[0-9]{1,5})?(\/.*)?/;
	var values = current.getValue('value').toLowerCase().split(' ');

	for (var i = 0; i < values.length; i++) {
		var value = values[i].trim();

		if (value !== "'self'" && value !== "'none'" && !domain.test(value)) {
       		gs.addErrorMessage(sn_i18n.Message.getMessage("csp_frame_ancestors_error", "Invalid value. The only valid values are 'none', 'self', or a domain (wildcards as subdomains allowed)."));
        	current.setAbortAction(true);
		}
	}
})(current, previous);
