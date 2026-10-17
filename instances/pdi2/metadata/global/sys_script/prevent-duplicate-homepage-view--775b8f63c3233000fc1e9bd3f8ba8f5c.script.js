var gr = new GlideRecord('sys_portal_page');
gr.addQuery("view", current.view);
gr.addQuery("sys_id", "!=", current.sys_id);
gr.query();
if (gr.next()) {
	gs.addInfoMessage(gs.getMessage("The view name '" + current.view + "' already exists. Choose another name."));
	current.setAbortAction(true);
}
