var CleanupOrphanJobUtil = Class.create();
CleanupOrphanJobUtil.prototype = {
	
    initialize: function() {
    },
	
	JOB_SYS_ID: '1fbfd45a73d1011026f6aa114df6a797',
	MARKER: 'marker',
	TOTAL_CI_COUNT: 'total_ci_count',
	ORPHAN_CI_COUNT: 'orphan_ci_count',
	FINISHED_STR: 'Finished',
	MARKER_SYS_ID: 'markerSysId',
	
	
	getBookmarkForTable: function(tableName) {
		var key = this.getKey(tableName);
		var gr = new GlideRecordSecure('cmdb_job_context');
		gr.addQuery('key', key);
		gr.query();
		
		if(gr.next())
			return gr.getValue('value');
		
		return '';
	},
	
	setBookmarkForTable: function(tableName, value) {
		var key = this.getKey(tableName);
		var gr = new GlideRecordSecure('cmdb_job_context');
		gr.addQuery('key', key);
		gr.query();
		
		if(gr.next()) {
			gr.setValue('key', key);
			gr.setValue('value', value);
			gr.update();
		} else {
			gr.setValue('key', key);
			gr.setValue('value', value);
			gr.insert();
		}
	},
	
	getKey: function(tableName) {
		return tableName + '_' + this.JOB_SYS_ID;
	},
	
	getTotalCiCount: function(tableName) {
		var ga = new GlideAggregate(tableName);
		ga.addAggregate('COUNT');
		ga.query();
		
		ga.next();
		
		return ga.getAggregate('COUNT');
	},

	lowerLogLevel: function() {
		gs.setProperty('glide.cmdb.logger.source.CMDBDependentCIProcessor', 'error');
		gs.setProperty('glide.cmdb.logger.use_syslog.CMDBDependentCIProcessor', 'error');
	},

	restoreLogLevel: function() {
		gs.setProperty('glide.cmdb.logger.source.CMDBDependentCIProcessor', 'error,warn');
		gs.setProperty('glide.cmdb.logger.use_syslog.CMDBDependentCIProcessor', 'error,warn');
	},
	
	getParents: function(tableName) {
		var manager = GlideDBObjectManager.get();
		var parents = [];
		var parent = manager.getBase(tableName);
		var lastParent = '';
		while (parent !== lastParent) {
			parents.push(parent + '');
			lastParent = parent;
			parent = manager.getBase(lastParent);
		}
		return parents;
	},
	
	disableJob: function() {
		var gr = new GlideRecordSecure('sysauto_script');
		gr.get(this.JOB_SYS_ID);
	
		gr.setValue('active', false);
		gr.update();
	},
	
	checkAndSetTotalCount: function(bookmark, tableName) {
		if (gs.nil(bookmark[this.TOTAL_CI_COUNT])) {
			bookmark[this.TOTAL_CI_COUNT] = this.getTotalCiCount(tableName);
			bookmark[this.ORPHAN_CI_COUNT] = 0;
		}
		
		return bookmark;
	},
	
	getOrphanCount: function(bookmark) {
		return bookmark[this.ORPHAN_CI_COUNT];
	},
	
    type: 'CleanupOrphanJobUtil'
};
