//changed for tcm. Drive responsibility based on the attached task record
if (!pm.isActive('com.snc.best_practice.incident.london')) {
	var contactRespGr = new GlideRecord('contact_responsibility');
	contactRespGr.setWorkflow(false);
	contactRespGr.query();
	while (contactRespGr.next()) {
		contactRespGr.setValue('table', 'incident');
		contactRespGr.setValue('global', false);
		contactRespGr.update();
	}
}
