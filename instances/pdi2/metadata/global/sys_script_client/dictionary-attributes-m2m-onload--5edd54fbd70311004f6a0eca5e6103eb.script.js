function onLoad() {
  g_form.setReadOnly('schema', true);
  // fix for empty display name on collections
  g_form.getReference('schema', setDisplayValueForTable);
}

function setDisplayValueForTable(gr) {
	if (gr.internal_type == 'collection')
		g_form.setValue('schema', gr.sys_id, gr.name);
}
