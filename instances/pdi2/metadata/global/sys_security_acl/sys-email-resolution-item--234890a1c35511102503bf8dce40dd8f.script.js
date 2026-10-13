answer = true;
if (current.email) {
	var gr = new GlideRecord("sys_email");	
	answer = gr.get(current.email) ? gr.canDelete() : false;
}
