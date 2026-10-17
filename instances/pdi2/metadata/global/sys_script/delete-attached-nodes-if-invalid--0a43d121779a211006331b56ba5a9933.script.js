(function executeRule(current, previous /*null when async*/) {
		if(current.relation_type != 'CHILD'){
            var grActivityDefRec = new GlideRecord('promin_activity_def');
            grActivityDefRec.addQuery('attached_entity', current.getValue('sys_id'));
			grActivityDefRec.addQuery('type', 'CHILD_ATTACHED');
            grActivityDefRec.query();
			while (grActivityDefRec.next()) {
                grActivityDefRec.deleteRecord(); 
            }
        }
		if(current.relation_type != 'REFERENCE'){
			var grActivityDef = new GlideRecord('promin_activity_def');
            grActivityDef.addQuery('entity', current.getValue('sys_id'));
			grActivityDef.addQuery("type", 'PARENT_ATTACHED');
            grActivityDef.query();
            while (grActivityDef.next()) {
                grActivityDef.deleteRecord();
            }
		}

})(current, previous);
