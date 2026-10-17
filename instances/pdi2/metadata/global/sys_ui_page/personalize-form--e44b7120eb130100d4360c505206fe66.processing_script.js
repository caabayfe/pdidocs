response.sendRedirect(buildSlushbucketURL(table_name));

function buildSlushbucketURL(tableName) {
	var url = 'slushbucket.do?'
	+ 'sysparm_referring_url=' + tableName + '.do'
	+ '&sysparm_form=section'
	+ '&sysparm_list=' + getSectionID(tableName);
	
	return url;
}

function getSectionID(tableName) {
	var gr = new GlideRecord('sys_ui_form_section');
	gr.addQuery('sys_ui_form.view', 'Default view');
	gr.addQuery('sys_ui_form.name', tableName);
	gr.addQuery('position', 0);
	gr.query();
	if (gr.next())
		return gr.sys_ui_section;
	
	var gr = new GlideRecord('sys_ui_section');
	gr.addQuery('name', tableName);
	gr.addQuery('view', 'Default view');
	gr.query();
	if (gr.next())
		return gr.sys_id;
	
	var ss = new GlideSysSection(tableName);
	var sections = ss.getSections();
	if (sections != null && sections.next())
		return sections.sys_id;
	
	return GlideSysForm.generateDefaultForm(tableName);
}
