var PIPluginPostCloneOperations = Class.create();
PIPluginPostCloneOperations.prototype = {
    initialize: function() {
		this.SYS_PROP_NAME = "glide.platform_ml.post_clone.training_schedules_deactivated";
	},

    deactivate: function() {
        this.deactivateMLTrainingRequestSchedules();
    },
	
	reactivate: function() {
        this.reactivateMLTrainingRequestSchedules();
    },

    /**
     * @param {bool} dryRunMode - Runs in DryRun mode
     */
    setDryRunMode: function(dryRunMode) {
        this._dryRun = dryRunMode;
    },
	
	setSysPropWithSysIds: function(tableName, encQuery) {
		var gr = new GlideRecord(tableName);
        gr.addEncodedQuery(encQuery);
        gr.query();
		var sysIds = [];
		while(gr.next()) {
			sysIds.push(gr.getUniqueValue());
		}
		if(sysIds.length > 0) {
			gs.setProperty(this.SYS_PROP_NAME, sysIds.toString());
		}
		gs.info("Setting System Prop Value:" + sysIds.toString());
	},
	
	getSysIdsFromSysProp: function() {
		return gs.getProperty(this.SYS_PROP_NAME);
	},

    getRecordCount: function(tableName, encQuery) {
        var ga = new GlideAggregate(tableName);
        ga.addEncodedQuery(encQuery);
        ga.addAggregate('COUNT');
        ga.query();

        return ga.next() ? parseInt(ga.getAggregate('COUNT')) : 0;
    },

    deactivateMLTrainingRequestSchedules: function() {
        var tableName = 'ml_training_request_schedule';
        var encQuery = 'active=true';
		this.setSysPropWithSysIds(tableName, encQuery);
        var recordCount = this.getRecordCount(tableName, encQuery);
       
        if (!this._dryRun) {
            var glideRecord = new GlideRecord(tableName);
            glideRecord.addEncodedQuery(encQuery);
            glideRecord.setValue('active', false);
            glideRecord.updateMultiple();
        }

        var delimiter = '\n------------------------\n';
        var message = this._dryRun ? '!! DRY RUN !!\n' : '';
        gs.info(sn_i18n.Message.getMessage("pi-plugin-post-clone-operations-script", "{delimiter} {message} Deactivate {recordCount} records from {tableName} {delimiter}", {
            delimiter: delimiter,
            message: message,
            recordCount: recordCount,
            tableName: tableName
        }));

    },
	
	reactivateMLTrainingRequestSchedules: function() {
        var tableName = 'ml_training_request_schedule';
        var encQuery = 'active=false^sys_idIN' + this.getSysIdsFromSysProp();
        var recordCount = this.getRecordCount(tableName, encQuery);
       
        if (!this._dryRun) {
            var glideRecord = new GlideRecord(tableName);
            glideRecord.addEncodedQuery(encQuery);
            glideRecord.setValue('active', true);
            glideRecord.updateMultiple();
            gs.setProperty(this.SYS_PROP_NAME, '');
        }

        var delimiter = '\n------------------------\n';
        var message = this._dryRun ? '!! DRY RUN !!\n' : '';
        gs.info(sn_i18n.Message.getMessage("pi-plugin-post-clone-operations-script", "{delimiter} {message} Reactivate {recordCount} records from {tableName} {delimiter}", {
            delimiter: delimiter,
            message: message,
            recordCount: recordCount,
            tableName: tableName
        }));

    },
	
};
