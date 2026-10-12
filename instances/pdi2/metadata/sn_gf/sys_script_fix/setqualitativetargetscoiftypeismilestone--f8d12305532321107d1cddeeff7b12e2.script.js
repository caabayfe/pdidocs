setQualitativeColumns();

function setQualitativeColumns() {
    var targetGr = new GlideRecord("sn_gf_goal_target");
    targetGr.addQuery('type', 'milestone');
    targetGr.addNullQuery('measure');
    targetGr.addNotNullQuery('percent_complete');
    targetGr.query();

    var unitSysId = '1ceb378c530b21107d1cddeeff7b12fe';
	var targetSysIdList = [];
    gs.info("Goals and Target data model changes: Starting");
    while (targetGr.next()) {
        targetGr.setValue('measure', unitSysId);
        targetGr.setValue('qualitative_base_value', 'yes');
		targetGr.setValue('qualitative_target_value', 'yes');
        targetGr.setValue('qualitative_actual_value', 'yes');
		if (targetGr.getValue('percent_complete') === '0') {
			targetGr.setValue('qualitative_actual_value', 'no');
		}
        targetGr.setWorkflow(false);
        gs.info("Target data model changes: Updating target record with sys id "+targetGr.getUniqueValue());
        targetGr.update();
		//also update the target progress associated to it
		targetSysIdList.push(targetGr.getUniqueValue());
    }

    gs.info("Goals and Target data model changes: Done updating target records");
	var targetProgressGr = new GlideRecord("sn_gf_goal_target_progress");
	targetProgressGr.addEncodedQuery('targetIN'+targetSysIdList.join());
	targetProgressGr.query();

    gs.info("Target Progress data model changes: Starting");
	while(targetProgressGr.next()) {
		targetProgressGr.setValue('qualitative_progress_value','yes');
		if (targetProgressGr.getValue('percent_complete') === '0') {
			targetProgressGr.setValue('qualitative_progress_value','no');
		}
		targetProgressGr.setWorkflow(false);
        gs.info("Target Progress data model changes: Updating target progress record with sys id "+targetProgressGr.getUniqueValue());
		targetProgressGr.update();
	}
    gs.info("Target Progress data model changes: Done updating target progress records");

}
