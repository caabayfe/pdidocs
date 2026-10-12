var FlowDesignerArtifactsCollector = Class.create();

FlowDesignerArtifactsCollector.prototype = {
    actionInstanceTable: 'sys_hub_action_instance',
    actionInstanceTableV2: 'sys_hub_action_instance_v2',
    popularTable: 'sys_hub_popular_artifacts',
    artifactsType: {
        ACTION: 'ACTION',
        FLOW: 'FLOW',
        SUBFLOW: 'SUBFLOW'
    },
    fields: { // columns on popular table
        InternalName: 'internal_name',
        Type: 'type',
        CountDate: 'count_date',
        UseCount: 'use_count',
        ApplicationScope: 'application_scope'
    },
    /*
     * Initialize
     */
    initialize: function() {},
    /* 
	 * query sys_hub_action_instance for the last number of days from today (countDays)  
     * and count the number of usage grouped by action type.  This data is stored in 
     * sys_hub_popular_artifacts
     */
    mostPopularAction: function(countDays) {
		if (typeof countDays !== 'number') return;
		
        var today = new Date();
        for (i = 0; i < countDays; i++) {
            //*--- set query date
            var startDateStr = this._toUTCDate(today);
			if (startDateStr === '') continue;
			
            // set date to query: YYYY-MM-DD@javascript:gs.dateGenerate('YYYY-MM-DD','start')@javascript:gs.dateGenerate('YYYY-MM-DD','end')
            var dateQueryStr = startDateStr + "@javascript:gs.dateGenerate('" + startDateStr + "','start')@javascript:gs.dateGenerate('" + startDateStr +
                "','end')";

            var list = {};
			this._gatherActionCount(this.actionInstanceTable, dateQueryStr, list);
			this._gatherActionCount(this.actionInstanceTableV2, dateQueryStr, list);
           


            //*--- write to data table
            // clean up: if there is already data for this date, lets clear it up
            var collector = new GlideRecord(this.popularTable);
            var collectorDateStr = "count_dateON" + dateQueryStr;
            collector.addEncodedQuery(collectorDateStr);
            collector.query();
            if (collector.getRowCount() > 0) {
				gs.info("Count Date: " + startDateStr + " removed " + collector.getRowCount() + " old records."); 
                collector.deleteMultiple();
			} else 
				gs.info("Count Date: " + startDateStr + " - no action used"); 

            var countDate = new GlideDateTime(startDateStr + " 00:00:00");
            for (var key in list) {
                var item = list[key];
                // internal_name, count_date, use_count, type
                collector.initialize();
                collector.setValue(this.fields.CountDate, countDate);
                collector.setValue(this.fields.UseCount, item['count']);
                collector.setValue(this.fields.InternalName, item['internal_name']);
                collector.setValue(this.fields.Type, this.artifactsType.ACTION);
                collector.setValue(this.fields.ApplicationScope, item['sys_scope']);
                collector.insert();

                gs.info("inserted count date[" + countDate.getDate() + "] internal_name[" + item['name'] + "] count[" + item['count'] + "]");
            } //end for

            today.setDate(today.getDate() - 1);
        }

    },

	_gatherActionCount: function(tableName, dateQueryStr, list) {
		//*--- set query for action instance
		var groupByCol = 'action_type.internal_name';
		var instance = new GlideRecord(tableName);
		var instanceDateStr = "flow.sys_class_name=sys_hub_flow^sys_created_onON" + dateQueryStr + "^ORsys_updated_onON" + dateQueryStr;
		instance.addEncodedQuery(instanceDateStr);
		instance.groupBy(groupByCol);
		instance.query();

        //*--- aggregate data grouped by action internal name for this date
        while (instance.next()) {
            var name = instance.action_type.internal_name;
            if (typeof list[name] === 'undefined')
                list[name] = {
                    'count': 1,
                    'name': instance.action_type.name,
                    'internal_name': name,
                    'sys_scope': instance.sys_meta.sys_scope
                };
            else
                list[name]['count']++;
        } //end while
    },

    // get UTC date with format YYYY-MM-DD
    _toUTCDate: function(d) {
        if (d instanceof Date) {
            var dd = d.getUTCDate();
            var mm = d.getUTCMonth() + 1;
            var yy = d.getUTCFullYear();
            return yy + "-" + (mm < 10 ? "0" + mm : mm) + "-" + (dd < 10 ? "0" + dd : dd);
        }

        return '';
    },

    type: 'FlowDesignerArtifactsCollector'
};
