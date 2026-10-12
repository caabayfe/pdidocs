if (cancel_or_submit === "submit") {
	new TransferOrderLineTemplateTaskAPI().copyDefaultTemplateTasks(cmdb_model_category);
    response.sendRedirect("alm_custom_template_task_list.do" );
} else {
    var urlOnStack = GlideSession.get().getStack().bottom();
    response.sendRedirect(urlOnStack);
}
