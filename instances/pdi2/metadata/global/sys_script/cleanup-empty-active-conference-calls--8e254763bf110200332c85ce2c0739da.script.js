(function executeRule(current, previous /*undefined when async or display*/ ) {
    // inactive conference calls that still have a code should be cleaned up
    var intervalDurationMinutes = (new NotifyUtil()).getEmptyConferenceExpiryAge();
    var db = new NotifyDatabase();

    // find all active conference calls
    var gdt = new GlideDateTime();
    gdt.addSeconds(-(intervalDurationMinutes * 60));
    var cc = new GlideRecord('notify_conference_call');
    cc.addQuery("sys_created_on", "<=", gdt);
    cc.addActiveQuery();
    cc.query();
    // iterate over conference calls
    while (cc.next()) {
        // check if there are active participants
        if (db.canMakeConferenceCallInActive(cc)) {
            // no participants, cleanup conference call
            db.setConferenceCallActiveState(cc, false);
        }
    }
    // find all inactive conference calls that still have a code
    cc = new GlideRecord('notify_conference_call');
    cc.addQuery("sys_created_on", "<=", gdt);
    cc.addInactiveQuery();
    cc.addNotNullQuery('code');
    cc.setValue('code', 'NULL');
    cc.updateMultiple();
})(current, typeof previous != 'undefined' ? previous : null);
