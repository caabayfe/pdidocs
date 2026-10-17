var gr = new GlideRecord("sys_trigger");
if (gr.get(current.job))
	gr.deleteRecord();
current.job = '';
