function redirectToCloneRequest() {
	var url = 'clone_instance.do?sys_id=-1&sysparm_view=clone_request&sysparm_stack=clone_instance_list.do&sysparm_query=profile=' + g_form.getUniqueValue();
	window.location.href = url;
}
