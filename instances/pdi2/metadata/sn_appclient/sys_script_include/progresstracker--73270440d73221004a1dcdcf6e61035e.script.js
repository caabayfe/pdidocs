var ProgressTracker = Class.create();
ProgressTracker.prototype = {

	initialize: function() {
	},
	
	getStatus: function(execId) {
		var status = this.getProgress(execId);
		return new global.JSON().encode(status);
	},

	getProgress: function(execId) {
		// gs.info("ProgressTracker: " + execId);
		var pgr = new GlideRecord('sys_execution_tracker');
		pgr.get(execId);
		return this.getStatusLayer(pgr);
	},

	getStatusLayer: function(gr) {
		// gs.info("getStatusLayer: " + gr.name.toString());
		var obj = {};
		obj.name = gr.name.toString();
		obj.state = gr.state.toString();
		obj.message = gr.message.toString();
		obj.sys_id = gr.sys_id.toString();
		obj.percent_complete = gr.percent_complete.toString();
		var updated_on = new GlideDateTime();
		updated_on.setDisplayValue(gr.sys_updated_on.getDisplayValue());
		obj.updated_on = updated_on.getNumericValue();

		obj.results = [];

		var pgr = new GlideRecord("sys_execution_tracker");
		pgr.addQuery("parent", gr.sys_id);
		pgr.addQuery("state",'1');
		pgr.orderBy("order");

		pgr.query();
		while (pgr.next()) {
			obj.results.push(this.getStatusLayer(pgr));
		}
		return obj;
	},

	isComplete : function(trackerId){
        var trackers = trackerId.split(",");
        var pw = new GlideRecord("sys_progress_worker");
        pw.addQuery("sys_id", "IN", trackers);
        pw.query();

        while(pw.next()) {
			if(pw.getValue("state") != "complete")
				return false;
		}

        return true;
    },

	getExecutionTime: function(trackerId) {
		var trackers = trackerId.split(",");
		var pw = new GlideRecord("sys_progress_worker");
		pw.addQuery("sys_id", "IN", trackers);
		pw.query();

		var obj = {};
		while (pw.next()) {
			if (pw.getValue("name") == "Checking store app updates")
				obj.storeUpdatesTime = new GlideDateTime(pw.getValue("total_execute_time")).getNumericValue();
			else if (pw.getValue("name") == "Update plugin cache")
				obj.pluginUpdatesTime = new GlideDateTime(pw.getValue("total_execute_time")).getNumericValue();
		}

		return obj;
	},

	getBatchInstallStatus: function(batchId) {
		var batchAppsPayload = [];
		var installationPlanGr = new GlideRecord("sys_batch_install_plan");
		installationPlanGr.get(batchId);
		if (installationPlanGr.isValidRecord()) {
			var batchItemGr = new GlideRecord("sys_batch_install_item");
			batchItemGr.addQuery("batch_install_plan.sys_id", installationPlanGr.getUniqueValue());
			batchItemGr.query();
			while(batchItemGr.next()) {
			        var batchItem = this._getBatchInstallItem(batchItemGr);
			        batchAppsPayload.push(batchItem);
			}
		}
		return batchAppsPayload;
	},

	getExecutionTrackerId: function(batchName) {
		var trackerGr = new GlideRecord("sys_execution_tracker");
		trackerGr.addQuery("name", batchName);
		trackerGr.addQuery("state", "IN", "0,1");
		trackerGr.addNullQuery("parent");
		trackerGr.query();
		if(!trackerGr.next())
			return null;

		return trackerGr.sys_id.toString();
	},

	getPendingBatchInstalls: function() {
		var pendingBatch = {};
		var batchInstallItems = new GlideRecord("sys_batch_install_item");
		batchInstallItems.addQuery("state" ,"IN", "ready,in_progress");
		batchInstallItems.orderByDesc("sys_updated_on");
		batchInstallItems.query();
		if(!batchInstallItems.next())
			return pendingBatch;

		pendingBatch.batch_installation_id = batchInstallItems.batch_install_plan.sys_id.toString();
		var batchExecName = batchInstallItems.batch_install_plan.name.toString();
		pendingBatch.execution_tracker_id = this.getExecutionTrackerId(batchExecName);
		pendingBatch.name = batchExecName;

		return pendingBatch;
	},
    
    getPendingBatchInstallations: function() {
        var list = [];
        var batchInstallItems = new GlideRecord("sys_batch_install_item");
        batchInstallItems.addQuery("state", "IN", "ready,in_progress");
        batchInstallItems.orderByDesc("sys_updated_on");
        batchInstallItems.query();
        while (batchInstallItems.next()) {
            var pendingBatch = this._getBatchInstallItem(batchInstallItems);
            pendingBatch.batch_installation_id = batchInstallItems.batch_install_plan.sys_id.toString();
            var batchExecName = batchInstallItems.batch_install_plan.name.toString();
            pendingBatch.execution_tracker_id = this.getExecutionTrackerId(batchExecName);
            pendingBatch.name = batchExecName;
            list.push(pendingBatch);
        }
        return list;
    },
    
    _getBatchInstallItem: function(batchItemGr) {
        var batch = {};
        batch.id = batchItemGr.getValue("id");
        batch.state = batchItemGr.getValue("state");
        batch.status_message = batchItemGr.getValue("status_message");
        batch.type = batchItemGr.getValue("type");
        batch.version = batchItemGr.getValue("version");
        batch.notes = batchItemGr.getValue("notes");
        batch.demo_data = batchItemGr.getValue("demo_data");
        batch.name = batchItemGr.getValue("name") || batchItemGr.getValue("id");
        return batch;
    },

    getAllQueuedInstallations: function(params, apiUtil) {
        var limit = CommonUtils.getLimit(params.queryParams);
        var offset = CommonUtils.getOffset(params.queryParams);
        this.getInProgressInstallations(); //sync latest updates from execution tracker
        var gr = new GlideRecord(Constants.TABLE_PROGRESS_TRACKER);
        var state = params.queryParams[Constants.STATE];
        this._addStateFilter(gr, state);
        gr.orderByDesc("sys_created_on");
        gr.chooseWindow(offset, offset + limit);
        gr.query();
        var progressTrackerRecordsCount = gr.getRowCount();
		var scheduledItemsRecordCount = 0;
        
        var installtions = [];
        while (gr.next()) {
            var progressTracker = this._getProgressTrackerInfo(gr);
            installtions.push(progressTracker);
        }

        if (state=='' || state.indexOf('scheduled') != -1 || state.indexOf('all') != -1) {
            var schedluedItems = new GlideRecord('sys_installation_schedule');
            schedluedItems.addEncodedQuery("state=ready^additional_args!=NULL^comments=NULL");
            schedluedItems.orderByDesc("sys_created_on");
            schedluedItems.chooseWindow(offset, offset + limit);
            schedluedItems.query();
            scheduledItemsRecordCount = schedluedItems.getRowCount();
            var scheduledInstalltions = [];
            while (schedluedItems.next()) {
                var ScheduledTracker = this._getScheduledItemsForActivityLog(schedluedItems);
                scheduledInstalltions.push(ScheduledTracker);
            }
            installtions = installtions.concat(scheduledInstalltions);
        }
		apiUtil.addTotalCountHeader(progressTrackerRecordsCount + scheduledItemsRecordCount);
        var sortedInstallations = this.sortInstallationsByCreatedDate(installtions);
        return sortedInstallations;
    },

    sortInstallationsByCreatedDate: function(installtions) {
        var result = installtions.sort(function(a, b) {
            var installationA = a.created_on;
            var installationB = b.created_on;
            if (installationA > installationB) {
                return -1;
            }
            if (installationA < installationB) {
                return 1;
            }
            return 0;
        });
		return result;
    },    

    getQueuedInstallationByTrackerId: function(trackerId) {
        var gr = new GlideRecord(Constants.TABLE_PROGRESS_TRACKER);
        gr.addQuery("tracker_id", trackerId);
        gr.query();
        var tracker = {};
        if (gr.next()) {
            if(gr.state <= 1){
                var map = this._getExecutionTrackerByIds(trackerId);
                this._updateProgressTracker(map[trackerId], gr);
            }
            tracker = this._getProgressTrackerInfo(gr);
        }
        return tracker;
    },

    _addStateFilter: function(gr, state) {
        if (state!='' && state.indexOf('all') == -1) {
            var states = state.split(',');
            var res = [];
            for (i = 0; i < states.length; i++) {
                if (states[i] == "progress")
                    res = res.concat(['0', '1']);
                if (states[i] == "completed")
                    res = res.concat(['2']);
                if (states[i] == "failed")
                    res = res.concat(['3', '4']);
            }
            gr.addQuery(Constants.STATE, "IN", res);
        }
    },

    getInProgressInstallations: function() {
        var trackerIds = this._getInProgressTrackerIds();
        if (trackerIds.length == 0)
            return [];
        var map = this._getExecutionTrackerByIds(trackerIds);
        return this._updateAndGetStatus(trackerIds, map);
    },

    getInProgressInstallationByAppId: function(appId) {
        var trackerId = this._getInProgressTrackerIdByAppId(appId);
        var progressTracker = {};
        if (trackerId) {
            var gr = new GlideRecord("sys_execution_tracker");
            gr.get(trackerId);
            if(gr.isValidRecord()){
                var executionTracker = this._getExecutionTrackerInfo(gr);
                progressTracker = this._updateAppAndGetStatus(executionTracker);
            }
        }
        return progressTracker.state < 2 ? progressTracker : {};
    },

    _isExecutionTrackerIdValid: function(trackerId) {
        var gr = new GlideRecord("sys_execution_tracker");
        gr.get(trackerId);
        return gr.isValidRecord();
    },

    _getExecutionTrackerByIds: function(trackerIds) {
        var gr = new GlideRecord("sys_execution_tracker");
        gr.addQuery("sys_id", "IN", trackerIds);
        gr.query();
        var map = {};
        while (gr.next()) {
            var tracker = this._getExecutionTrackerInfo(gr);
            map[tracker.id] = tracker;
        }
        return map;
    },

    _getExecutionTrackerInfo: function(gr) {
        var tracker = {};
        tracker.id = gr.getValue("sys_id");
        tracker.message = gr.getValue("message");
        tracker.detail_message = gr.getValue("detail_message");
        tracker.percent_complete = gr.getValue("percent_complete");
        tracker.state = gr.getValue("state");
        tracker.start_time = gr.getValue("start_time");
        tracker.completion_time = gr.getValue("completion_time");
        return tracker;
    },

    _getInProgressTrackerIds: function() {
        var gr = new GlideRecord(Constants.TABLE_PROGRESS_TRACKER);
        gr.addEncodedQuery("state=0^ORstate=1");
        gr.orderByDesc("sys_created_on");
        gr.query();
        var list = [];
        while (gr.next()) {
            var trackerID = gr.getValue("tracker_id");
            if(this._isExecutionTrackerIdValid(trackerID))
                list.push(trackerID);
            else{
                // Cleaning invalid tracker 
                gr.deleteRecord();
            }
        }
        return list;
    },

    _getInProgressTrackerIdByAppId: function(appId) {
        var gr = new GlideRecord(Constants.TABLE_PROGRESS_TRACKER);
        gr.addEncodedQuery("state=0^ORstate=1^app_id=" + appId);
        gr.orderBy("sys_created_on");
        gr.query();
        if (gr.next()) {
            return gr.getValue("tracker_id");
        }
        return null;
    },

    _updateAndGetStatus: function(trackerIds, map) {
        var gr = new GlideRecord(Constants.TABLE_PROGRESS_TRACKER);
        gr.addQuery("tracker_id", "IN", trackerIds);
        gr.query();
        var pendingInstallations = [];
        while (gr.next()) {
            var trackerId = gr.getValue("tracker_id");
            var tracker = map[trackerId];
            this._updateProgressTracker(tracker, gr);
            if (tracker.state < 2)
                pendingInstallations.push(this._getProgressTrackerInfo(gr));
        }
        return pendingInstallations;
    },

    _updateAppAndGetStatus: function(tracker) {
        var gr = new GlideRecord(Constants.TABLE_PROGRESS_TRACKER);
        gr.addQuery("tracker_id", tracker.id);
        gr.query();
        var progressTracker = {};
        if (gr.next()) {
            this._updateProgressTracker(tracker, gr);
            progressTracker = this._getProgressTrackerInfo(gr);
        }
        return progressTracker;
    },

    _updateProgressTracker: function(tracker, gr) {
        if(!tracker) return;
        gr.setValue("state", tracker.state);
        gr.setValue("message", tracker.message);
        gr.setValue("detail_message", tracker.detail_message);
        gr.setValue("percent_complete", tracker.percent_complete);
        gr.setValue("start_time", tracker.start_time);
        gr.setValue("completion_time", tracker.completion_time);
        gr.update();
    },

    _getProgressTrackerInfo: function(gr) {
        var tracker = {};
        tracker.id = gr.getValue("tracker_id");
        tracker.name = gr.getValue("name");
        tracker.app_id = gr.getValue("app_id");
        tracker.type = gr.getValue("type");
        tracker.mode = gr.getValue("mode");
        tracker.message = gr.getValue("message");
        tracker.detail_message = gr.getValue("detail_message");
        tracker.percent_complete = gr.getValue("percent_complete");
        tracker.state = gr.getValue("state");
        tracker.start_time = gr.getValue("start_time");
        tracker.completion_time = gr.getValue("completion_time");
        tracker.created_by = gr.getValue("sys_created_by");
        tracker.created_on = this._getNumericValueFromDate(gr.getValue("sys_created_on"));
        return tracker;
    },

	_getNumericValueFromDate: function(date){
		var gdt = new GlideDateTime(date);
		return JSON.parse(gdt.getNumericValue());
	},

    _getScheduledItemsForActivityLog: function(gr) {
        var tracker = {};
        var args = JSON.parse(gr.getValue("additional_args"));
        tracker.name = args.name;
        tracker.app_id = args.id;
        tracker.type = args.type;
        tracker.mode = 'schedule';
        tracker.message = 'schedule';
        tracker.state = '5';
        tracker.start_time = gr.getDisplayValue("start_time");
        tracker.completion_time = gr.getDisplayValue("end_time");
        tracker.created_by = gr.getValue("sys_created_by");
        tracker.created_on = this._getNumericValueFromDate(gr.getValue("sys_created_on"));
        return tracker;
    },

    type: 'ProgressTracker'
};
