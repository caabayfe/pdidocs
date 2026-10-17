var CMDBWsProgressMonitorUtil = Class.create();
	CMDBWsProgressMonitorUtil.prototype = Object.extendsObject(CMDBWsConstants, {
		initialize: function() {
		},

		createProgress: function (name) {
			var progressGr = new GlideRecord(this.TABLES.PROGRESS_MONITOR);
			progressGr.initialize();
			progressGr.setValue(this.COLS.NAME, name);
			return progressGr.insert();
		},

		getProgressById: function (progressId) {
			var progressGr = new GlideRecord(this.TABLES.PROGRESS_MONITOR);
			if (progressGr.get(progressId)) {
				return progressGr;
			}
			return null;
		},

		updateProgress: function (progressGr, progressCount, totalCount) {
			if (progressGr.isValidRecord()) {
				progressGr.setValue(this.COLS.TOTAL_COUNT, totalCount);
				progressGr.setValue(this.COLS.PROCESSED_COUNT, progressCount);
				progressGr.setValue(this.COLS.PERCENT_COMPLETE, Math.floor(progressCount / totalCount * 100));
				progressGr.update();
			}
		},

		deleteProgress: function (progressId) {
			var progressGr = new GlideRecord(this.TABLES.PROGRESS_MONITOR);
			if (progressGr.get(progressId)) {
				progressGr.deleteRecord();
			}
		},

		getProgressInfo: function (name) {
			var progressInfo = {};
			var progressGr = new GlideRecord(this.TABLES.PROGRESS_MONITOR);
			if (name) {
				progressGr.addQuery(this.COLS.NAME, name);
			}
			progressGr.query();
			if (progressGr.next()) {
				progressInfo.id = progressGr.getValue(this.COLS.SYS_ID);
				progressInfo.totalCount = progressGr.getValue(this.COLS.TOTAL_COUNT);
				progressInfo.remainingCount = parseInt(progressGr.getValue(this.COLS.TOTAL_COUNT)) - parseInt(progressGr.getValue(this.COLS.PROCESSED_COUNT));
			}

			return progressInfo;
		},

		type: 'CMDBWsProgressMonitorUtil'
});
