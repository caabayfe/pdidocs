var ModifyColumnsForCMDBDataSourceLastUpdate = Class.create();
ModifyColumnsForCMDBDataSourceLastUpdate.prototype = {
    initialize: function() {},

    modifyDictionary: function() {
        gs.log("Modifying the cmdb_datasource_last_update class column types");
        var gr = new GlideRecord('sys_dictionary');
        gr.addQuery('name', 'cmdb_datasource_last_update');
        gr.addQuery('element', 'class');
        gr.query();
        while (gr.next()) {
            //Removing the calculation value;
            gr.setValue('calculation', '');
            gr.setValue('internal_type', 'table_name');
            gr.setValue('virtual', 0);
            gr.setValue('dependent_on_field', '');
            gr.setValue('use_dependent_field', 'NULL');
            if (gr.update()) {
                gs.log("Done updating the class column of cmdb_datasource_last_update");
            } else {
                gs.logError("Failed to update the class column of cmdb_datasource_last_update" + gr.getLastErrorMessage());
            }
        }
        gs.info("Upgrade of columns class cmdb_datasource_last_update table is done");
    },

    copyValues: function() {
    	if (!GlideTableDescriptor.fieldExists('cmdb_datasource_last_update', 'record')) {
    		gs.error("Skipping copying values from cmdb_ci to record for cmdb_datasource_last_update as the record column is not present");
			return;
		}

        var maxCopyCount = 100000;
        gs.log("Starting to copy values from cmdb_ci to record for cmdb_datasource_last_update for "+ maxCopyCount + " values");
        var record = new GlideRecord('cmdb_datasource_last_update');
        record.addNullQuery('record');
        record.addNotNullQuery('cmdb_ci');
        record.setLimit(maxCopyCount);
        record.query();
        var count = record.getRowCount();
        gs.log("Total record count fetched " + count);
        while (record.next()) {
            record.setValue("record", record.getValue("cmdb_ci"));
            record.autoSysFields(false);
            record.update();
        }

        if (count >= maxCopyCount) {
            this.scheduleCopyValues();
        } else {
            gs.log("Finished copying values from the cmdb_ci to record and deactivating the daily scheduled job");
            var scheduledRecord = new GlideRecord('sysauto_script');
            // SysId of the daily scheduled job 'Copy values for cmdb_datasource_last_update'
            scheduledRecord.get('0b5ca1e0eb13111007d5a1c628522893');
            scheduledRecord.setValue('active', 'false');
            scheduledRecord.update();
        }
    },

    scheduleModifyDictionary: function() {
        if (!gs.hasRole('sn_cmdb_admin'))
            return;
        var script = "gs.include('ModifyColumnsForCMDBDataSourceLastUpdate');";
        script += "var c = new ModifyColumnsForCMDBDataSourceLastUpdate().modifyDictionary();";
        GlideRunScriptJob.scheduleScript(script);
    },

    scheduleCopyValues: function() {
        gs.log("Scheduling the job to copy values from cmdb_ci to record");
        var scheduledJob = new GlideRecord("sysauto_script");
        scheduledJob.get('0b5ca1e0eb13111007d5a1c628522893');
        if (scheduledJob.isValidRecord()) {
            SncTriggerSynchronizer.executeNow(scheduledJob);
            gs.log("Finished scheduling the copyValues job");
         }

    },
    type: 'ModifyColumnsForCMDBDataSourceLastUpdate'
};
