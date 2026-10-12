var DependentCIHelper = Class.create();

DependentCIHelper.prototype = {
    initialize: function() {},

    CMDB_TABLE: 'cmdb_ci',
    LEDGER_TABLE: 'cmdb_dependent_ci_ledger',
	EOL_LEDGER_TABLE: 'cmdb_ci_end_of_life_ledger',
    COL_ID: 'sys_id',
    COL_CLASS_NAME: 'sys_class_name',
    COL_CMDB_CI: 'cmdb_ci',
    COL_STATE: 'state',
    COL_ACTION: 'action',
    NEW_STATE: '1',
	READY_STATE: '3',
    DELETE_ACTION: 'Delete',

    // determine if given ci exists, if yes then return sys_class_name else null
    getClassName: function(cmdbCi) {
        var gr = new GlideRecord(this.CMDB_TABLE);
        gr.addQuery(this.COL_ID, cmdbCi);
        gr.query();
        if (gr.next())
            return gr.getValue(this.COL_CLASS_NAME);

        return null;
    },

    //use CMDBMetadata class(cached) to get CMDB class dependent flag
    isDependentClass: function(className) {
        var jsonStr = SNC.CmdbMetadataScriptableApi.getIdentificationRules(className);
        if (gs.nil(jsonStr))
            return false;
        var jsonObj = JSON.parse(jsonStr);
        //for a given class if there is no identification rule defined then return false - (corner case)
        return (jsonObj ? !jsonObj['independent'] : false);
    },

    //given a Ci, Add it to the ledger if its sys class != null & it is dependent
    queueDependentCi: function(cmdbCi) {
        var className = this.getClassName(cmdbCi);
        if (!gs.nil(className) && this.isDependentClass(className)) {
            var gr = new GlideRecord(this.LEDGER_TABLE);
            gr.initialize();
            gr.setValue(this.COL_CMDB_CI, cmdbCi);
            gr.setValue(this.COL_STATE, this.NEW_STATE);
            gr.setValue(this.COL_ACTION, this.DELETE_ACTION);
            gr.insert();
        }
    },
	
    addOrphanCIToLedger: function(cmdbCi) {
            var gr = new GlideRecord(this.LEDGER_TABLE);
            gr.initialize();
            gr.setValue(this.COL_CMDB_CI, cmdbCi);
            gr.setValue(this.COL_STATE, this.READY_STATE);
            gr.setValue(this.COL_ACTION, this.DELETE_ACTION);
            gr.insert();
    },

	checkAndAddToEOLLedger: function(ci, className, useLazyInsert) {
		var jsonStr = SNC.CmdbMetadataScriptableApi.getDownstreamDependencyInfo(className);
        if (gs.nil(jsonStr))
            return;
		
		var jsonObj = JSON.parse(jsonStr);
		if (Object.keys(jsonObj).length === 0)
			return;
		
		var gr = new GlideRecord(this.EOL_LEDGER_TABLE);
		gr.addQuery(this.COL_CMDB_CI, ci);
		gr.setLimit(1);
		gr.query();
		// insert into EOL table only if there's no existing ledger entry for the CI
		if (!gr.hasNext()) {
			gr.initialize();
			gr.setValue(this.COL_CMDB_CI, ci);
			gr.setValue(this.COL_STATE, this.NEW_STATE);
			if(useLazyInsert){
				gr.insertLazy();
			} else {
				gr.insert();
			}
		}
        
	},
	
    type: 'DependentCIHelper'
};
