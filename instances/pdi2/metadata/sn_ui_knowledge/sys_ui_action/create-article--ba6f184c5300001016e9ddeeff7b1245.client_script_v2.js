function onClick(g_form) {
  var query = '^source='+ g_form.getUniqueValue();
	g_aw.openRecord("kb_knowledge","-1",{
		'query': query
	});
}
