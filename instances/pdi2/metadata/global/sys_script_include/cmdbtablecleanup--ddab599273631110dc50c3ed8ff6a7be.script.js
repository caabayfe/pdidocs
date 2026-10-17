var CMDBTableCleanup = Class.create();

CMDBTableCleanup.prototype = {
    initialize: function(limitProperty, tableToClean, targetColumnName, 
		targetClassColumn, jobContextName) {

		this.SOFT_DELETE_SUPPORTED_TABLES = ["sys_object_source"];
		
		this.limit = 10000;
		var limit = gs.getProperty(limitProperty);
		// if the sys property contains a valid limit value, set it to the limit
		if ( !isNaN(limit) && limit > 0) {
			this.limit = limit;
		}
		this.tableToClean = tableToClean;
		this.targetColumnName = targetColumnName;
		this.targetClassColumn = targetClassColumn;
		this.jobContextName = jobContextName;
		this.sysId = 'sys_id';
		this.category = 'cmdb_health_score';
		this.handleSoftDeleted = (this.SOFT_DELETE_SUPPORTED_TABLES.indexOf(this.tableToClean) !== -1)? true: false;
    },
    
    //delete records from this.tableToClean if the target record no longer exists
    cleanRecords: function () {
		var prevIterationSysId = this._getLastIterationId();
		var gr = new GlideRecord(this.tableToClean);
		gr.orderBy(this.sysId);
		
		//Add where clause to fetch the next batch
		if (prevIterationSysId) {
			gr.addQuery(this.sysId, '>', prevIterationSysId);
		}
		gr.setLimit(this.limit);
		gr.setCategory(this.category);
		gr.query();

		var targetSysId = "";
		var lastReadSysId = "";
		var targetTableMap = {};
		var visitedTargetSysIds = {};
		var softDeletedSysIds = [];
		var count = 0;
		while (gr.next()) {
			targetSysId = gr.getValue(this.targetColumnName);
			if(!targetSysId)
				targetSysId = 'NULL';
			
			var targetTable = this._getTargetTable(gr);
			
			if (this.handleSoftDeleted && this._isSoftDeleted(targetTable))
				softDeletedSysIds.push(gr.getValue(this.sysId));
			else {
				// get the absolute base in case we do a class switch for cmdb CI's
				targetTable = GlideDBObjectManager.getAbsoluteBase(targetTable);
				if(!targetTableMap[targetTable]) {
					targetTableMap[targetTable] = [];
					targetTableMap[targetTable].push(targetSysId);
					visitedTargetSysIds[targetSysId] = true;
				} else if (!visitedTargetSysIds[targetSysId]){
					targetTableMap[targetTable].push(targetSysId);
					visitedTargetSysIds[targetSysId] = true;
				}
			}

			count++;
			lastReadSysId = gr.getValue(this.sysId);

			//Find and delete once we have seen 10k targetSysIds
			//resets the map so that we won't consume more memory.
			if(count == 10000) {
				this._findAndDeleteInvalidTargetSysIds(targetTableMap, softDeletedSysIds, count);
				targetTableMap = {};
				visitedTargetSysIds = {};
				softDeletedSysIds = [];
				count = 0;
			}
		}
		
		//process the leftover target sys ids
		this._findAndDeleteInvalidTargetSysIds(targetTableMap, softDeletedSysIds, count);

		if (this._isEndOfTable(lastReadSysId)) {
			this._setLastIterationId('');
			gs.log("CMDBTableCleanup: " + this.tableToClean + ", reached end of the table. Resetting the loop.");
		} else {
			this._setLastIterationId(lastReadSysId);
		}
	},

	_findAndDeleteInvalidTargetSysIds: function(targetTableMap, softDeletedSysIds, rowsReadCount) {
		var batchSize = 100;
		var invalidTargetSysIds = this._findInvalidTargetSysIds(batchSize, targetTableMap);
		//gs.log("CMDBTableCleanup: " + this.tableToClean + ", Rows read: " + rowsReadCount + ", Invalid target_sysid(s) in this run: " + invalidTargetSysIds.length);	
		for (var j = 0; j * batchSize < invalidTargetSysIds.length; j++) {
			this._deleteRecords(invalidTargetSysIds.slice(j * batchSize, (j + 1) * batchSize), this.targetColumnName);
		}
		// delete rows from this.tableToClean for sys_id(s) in softDeletedSysIds
		//gs.log("CMDBTableCleanup: " + this.tableToClean + ", Rows read: " + rowsReadCount + ", Invalid sysid(s) in this run: " + softDeletedSysIds.length);
		for (var k = 0; k * batchSize < softDeletedSysIds.length; k++) {
			this._deleteRecords(softDeletedSysIds.slice(k * batchSize, (k + 1) * batchSize), this.sysId);
		}
	},

	_findInvalidTargetSysIds: function(batchSize, targetTableMap) {
		var arrayUtil = new ArrayUtil();
		var invalidTargetSysIds = [];
		
		//find invalidTargetSysIds by querying target tables in batches
		for (var key in targetTableMap) {
			//handle the case where target table was deleted
			if(!gs.tableExists(key) || GlideArchiveTable.isArchive(key)) {
				invalidTargetSysIds = invalidTargetSysIds.concat(targetTableMap[key]);
				continue;
			}
			var targetSysIds = targetTableMap[key];
			var validTargetSysIds = [];

			for (var i = 0; i * batchSize < targetSysIds.length; i++) {
				var targetGr = new GlideRecord(key);
				targetGr.addQuery("sys_id", "IN", targetSysIds.slice(i * batchSize, (i + 1) * batchSize));
				targetGr.setCategory(this.category);
				targetGr.query();
				while(targetGr.next())
					validTargetSysIds.push(targetGr.getValue("sys_id"));
			}
	
			invalidTargetSysIds = invalidTargetSysIds.concat(arrayUtil.diff(targetSysIds, validTargetSysIds));
		}

		return invalidTargetSysIds;
	},

	_deleteRecords: function(deleteIds, queryColumnName) {
		var gr = new GlideRecord(this.tableToClean);
		gr.addQuery(queryColumnName, 'IN', deleteIds);
		gr.deleteMultiple();
	},

	_getLastIterationId: function() {
		var gr = this._getContextRecord();
		gr.next();
		return gr.getRowCount() == 1 ? gr.getValue('value') : '';
	},

	_getTargetTable: function(tableToCleanGr){
		var targetTable = tableToCleanGr.getValue(this.targetClassColumn);

		if(!targetTable && this.tableToClean == "cmdb_datasource_last_update"){
			return "cmdb_ci";
		}

		return targetTable;
	},

	_setLastIterationId: function(sysId) {
		var gr = this._getContextRecord();
		if (gr.hasNext()) {
			while (gr.next()) {
				gr.setValue('value', sysId);
				gr.update();
			}
		} else {
			gr.setValue('key', this.jobContextName);
			gr.setValue('value', sysId);
			gr.insert();
		}
	},

	_getContextRecord: function() {
		var gr = new GlideRecord('cmdb_job_context');
		gr.addQuery('key', this.jobContextName);
		gr.query();
		return gr;
	},

	_isEndOfTable: function(sysId) {
		var gr = new GlideRecord(this.tableToClean);
		gr.addQuery(this.sysId, '>', sysId);
		gr.orderBy(this.sysId);
		gr.setLimit(1);
		gr.setCategory(this.category);
		gr.query();
		return !gr.hasNext();
	},

	_isSoftDeleted: function(targetTable){

		if (!targetTable || targetTable == "NULL")
			return true;

		return false;
	},

    type: 'CMDBTableCleanup'
};
