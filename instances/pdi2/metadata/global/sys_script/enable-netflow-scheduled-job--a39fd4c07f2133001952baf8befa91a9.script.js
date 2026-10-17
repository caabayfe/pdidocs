(function executeRule(current, previous /*null when async*/ ) {

	/*Enable Netflow scheduled job when a record is inserted to sa_flow_connector table*/
    var scriptGr = new GlideRecord('sysauto_script');
    scriptGr.addQuery('name', 'Flow Discovery Scheduler');
    scriptGr.query();
    if (scriptGr.next()) {
		var isActive = scriptGr.getValue('active');
		if (isActive === '0') {
			scriptGr.setValue('active', '1');
			scriptGr.update();
		}
    }

})(current, previous);
