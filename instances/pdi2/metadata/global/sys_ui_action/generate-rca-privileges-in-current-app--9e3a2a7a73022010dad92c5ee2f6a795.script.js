var gr = new GlideRecord('sys_restricted_caller_access');
gr.addQuery('source_scope',current.getUniqueValue());
// status == ALLOWED
gr.addQuery("status", "2");
gr.query();

while (gr.next())
	SNC.RCAScriptUtils.createRCAInSourceScope(gr);
