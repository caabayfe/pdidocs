// Let's start the async job to populate kb_knowledge table with the meta description field
if (pm.isActive('com.snc.knowledge_serviceportal'))
	startAsyncPopulateMetaDescription();

function startAsyncPopulateMetaDescription(){
	var rec = new GlideRecord('sysauto_script');
	rec.get('name', 'Populate Meta Description on KB Articles');
	SncTriggerSynchronizer.executeNow(rec);
}
