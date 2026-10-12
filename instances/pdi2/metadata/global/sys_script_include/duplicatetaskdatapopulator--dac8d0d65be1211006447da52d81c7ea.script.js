var DuplicateTaskDataPopulator = Class.create();
DuplicateTaskDataPopulator.prototype = {
    initialize: function() {},

    // Populate reconcile_duplicate_task_data from the attributes_json blob in the reconcile_duplicate_task table
    populateData: function() {

        var startTime = this._getLastRunTime();
        // If there is not previous run time, find the min sys_created_on such that attributes_blob is not null
        if (!startTime) {
            startTime = this._getMinSysCreatedOn();
            if (startTime) {
                // We need to query everything including the min sys_created_on
                startTime.addSeconds(-1);
            }
        }
        var endTime = new GlideDateTime();
        endTime.addSeconds(-1);

        var gr = GlideRecord('reconcile_duplicate_task');
        if (startTime) {
            gr.addQuery('sys_created_on', '>', startTime);
        }
        gr.addQuery('sys_created_on', '<=', endTime);

        gr.query();

        while (gr.next()) {
            var attributesJson = gr.getValue('attributes_blob');
            if (attributesJson) {
                this._populateTaskData(attributesJson, gr.getValue('sys_id'), gr.getValue('sys_domain'));
                // We no longer need the attributes_blob because the data is already denormalized into a separate table
                gr.setValue('attributes_blob', 'NULL');
                gr.update();
            }
        }

        this._setLastRunTime(endTime);
    },

    /**
     * Populate duplicate task data for the following categories:
     * 1. Identification Type
     * 2. Identifier Entry (Table and Rule)
     * 3. Criterion Attributes (Name and Value)
     * 4. Classes
     * 5. Relationship (Relation Type and Depends On)
     */
    _populateTaskData: function(json, taskId, domain) {
        try {
            var jsonObj = JSON.parse(json);
        } catch (error) {
            gs.error("Error parsing Attributes JSON Blob: " + json + " for task: " + taskId);
            return;
        }

        // Insert identification type
        this._insertTaskDataRow('identification_type', jsonObj.identification_type, jsonObj.identification_type, taskId, domain);

        // Insert identifier entry data
        var identifierEntryObj = jsonObj.identifier_entry;
        for (key in identifierEntryObj) {
            this._insertTaskDataRow('identifier_entry', key, identifierEntryObj[key], taskId, domain);
        }

        // Insert attributes data
        var attributesArr = jsonObj.criterion_attributes;
		for (attrIdx in attributesArr){
			for (key in attributesArr[attrIdx]) {
				this._insertTaskDataRow('attribute', key, attributesArr[attrIdx][key], taskId, domain);
			}
		}

        // Insert class names
        var classNamesObj = jsonObj.classes;
        for (var i = 0; i < classNamesObj.length; i++) {
            this._insertTaskDataRow('class', classNamesObj[i], classNamesObj[i], taskId, domain);
        }

        // Insert relationships
        var relationshipObj = jsonObj.relationship;
        for (key in relationshipObj) {
            this._insertTaskDataRow('relationship', key, relationshipObj[key], taskId, domain);
        }

        // Insert discovery source(s)
        var discoverySources = this._getDiscoverySourcesForTask(taskId);
        for (var key in discoverySources) {
            this._insertTaskDataRow('discovery_source', key, key, taskId, domain);
        }
    },

    /**
     * Create a record in the reconcile_duplicate_task_data with the given category, key and value
     */
    _insertTaskDataRow: function(category, key, value, taskId, domain) {
        var gr = new GlideRecord('reconcile_duplicate_task_data');
        gr.setValue('category', category);
        gr.setValue('key', key);
        gr.setValue('value', value);
        gr.setValue('task', taskId);
        gr.setValue('sys_domain', domain);

        gr.insert();
    },

    /**
     * Get the start time for this job run
     */
    _getLastRunTime: function() {
        var gr = this._getLastRunTimeContextRecord();
        return gr.next() ? gr.getValue('value') : null;
    },

    /**
     * Set the start time for next job run
     */
    _setLastRunTime: function(time) {
        if (!time)
            return;
        var gr = this._getLastRunTimeContextRecord();
        if (gr.next()) {
            gr.setValue('value', time);
            gr.update();
        } else {
            gr.setValue('key', 'duplicateTaskDataLastRunTime');
            gr.setValue('value', time);
            gr.insert();
        }
    },

    /**
     * Get the cmdb_job_context record for start time
     */
    _getLastRunTimeContextRecord: function() {
        var gr = new GlideRecord('cmdb_job_context');
        gr.addQuery('key', 'duplicateTaskDataLastRunTime');
        gr.setLimit(1);
        gr.query();
        return gr;
    },

    /**
     * Get the minimum value for sys_created_on where attributes_blob is not null
     */
    _getMinSysCreatedOn: function() {
        var ga = new GlideAggregate('reconcile_duplicate_task');
        ga.addAggregate('MIN', 'sys_created_on');
        ga.addNotNullQuery('attributes_blob');
        ga.query();
        return ga.next() ? new GlideDateTime(ga.getAggregate('MIN', 'sys_created_on')) : null;
    },

    _getDiscoverySourcesForTask: function(taskId) {
        var discoverySources = {};
        var gr = new GlideRecord('duplicate_audit_result');
        gr.addQuery('follow_on_task', taskId);
        gr.query();
        while (gr.next()) {
            discoverySources[gr.getValue('discovery_source_duplicate_ci')] = true;
        }
        return discoverySources;
    },

    type: 'DuplicateTaskDataPopulator'
};
