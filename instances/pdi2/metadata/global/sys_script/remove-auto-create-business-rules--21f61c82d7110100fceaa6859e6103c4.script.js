var gr = new GlideRecord("sys_script");
if (current.business_rule) {
	gr.get(current.business_rule);
	gr.deleteRecord();
}

gr = new GlideRecord("sys_script");
if (current.delete_business_rule) {
	gr.get(current.delete_business_rule);
	gr.deleteRecord();
}
