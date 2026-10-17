function onLoad() {
	
	// Getting project_id from URL
	var url = this.location.href || top.window.location.href;
	var projectIDParam = url.split('project.sys_id%3D')[1] || url.split('project%3D')[1];
	var project_id = projectIDParam.substring(0, 32);
	if(project_id !== '')
		g_form.setValue('project', project_id);
}
