var gr = GlideRecord("sys_dictionary_override");
gr.addQuery("display_override", true);
gr.addQuery("name", current.name);
gr.query();
if (gr.next() && gr.sys_id != current.sys_id){
	current.setAbortAction(true);
	var error = 'There is already a display value override for this table';
	current.display_override.setError(error);
}
