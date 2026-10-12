response.sendRedirect(buildURL(table_name, field_name));

function buildURL(table_name, field_name) {
	var url = 'slushbucket_choice.do?'
		+ 'sysparm_referring_url=' + table_name + '.do'
		+ '&sysparm_ref=' + table_name + "." + field_name
		+ '&sysparm_form=sys_choice'
		+ '&sysparm_dependent=';
	
	return url;
}
