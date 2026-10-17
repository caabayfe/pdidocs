var intervalDurationMinutes = (new NotifyUtil()).getEmptyConferenceExpiryAge();
var gdt = new GlideDateTime();
gdt.addSeconds(-(intervalDurationMinutes*60));
var db = new NotifyDatabase();
var gr = new GlideRecord('notify_conference_call');
gr.addActiveQuery();
gr.addQuery("sys_created_on", "<=", gdt);
gr.query();
while(gr.next()){
	if(db.canMakeConferenceCallInActive(gr)){
		db.setConferenceCallActiveState(gr, false);
	}
}
