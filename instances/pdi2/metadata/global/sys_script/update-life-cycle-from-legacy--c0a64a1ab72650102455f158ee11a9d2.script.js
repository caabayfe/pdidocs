(function executeRule(current, previous /*null when async*/ ) {
	/**
	 * On Insert: Update Life Cycle values from Legacy values only if life cycle values are not provided. 
	 * On Update: Update Life Cycle values from Legacy values only if Legacy values have changed. 
	 */
    var updateFromLegacy = false;
	var util = new LifeCycleUtil();

	//Skip operation if class is explicitly listed for being skipped, see LifeCycleUtil script include
	//for property details
	if(util.isClassExcludedFromSync(current)){
		return;
	}
	
    if (current.operation() == "insert") {
        if (gs.nil(current.life_cycle_stage) || gs.nil(current.life_cycle_stage_status))
            updateFromLegacy = true;

    } else { //update
        // If life cycle values have changed no need to sync.
		// Note: In this case, we have other business rule that will end up updating legacy values from life cycle values.
        if (current.life_cycle_stage.changes() ||
            current.life_cycle_stage_status.changes())
            updateFromLegacy = false;
        else {
			// Note: Here irrespective of legacy fields have changed or not, we end up invoking synch logic.
            updateFromLegacy = true;
		}
    }

    if (updateFromLegacy == true) {

		var callingTable = current.sys_class_name + '';
		var shouldSkipCMDBSync = false;

		//This is added to allow CMDB Sync with the PI sync model so long as the LC stage is going to change, we try to
		//prevent stage status flip-flopping which can occur in the PI sync configuration
		if(current.operation() == "update" && util.isProductInstanceSyncActive()){	
			var intendedLCValues = util.findMatchingLifeCycleControl(callingTable, current, false);
			if(intendedLCValues.life_cycle_stage == current.life_cycle_stage){
				shouldSkipCMDBSync = true;
			}
		}

		if(!shouldSkipCMDBSync){
			util.updateFromLegacy(callingTable, current);
		}
    }

})(current, previous);
