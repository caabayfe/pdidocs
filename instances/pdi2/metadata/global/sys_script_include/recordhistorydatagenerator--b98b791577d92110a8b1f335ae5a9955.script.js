var RecordHistoryDataGenerator = Class.create();
RecordHistoryDataGenerator.prototype = {
    initialize: function() {
    },

	generateHistoryData: function(tableName, recordSysId){
		if(gs.nil(tableName) || gs.nil(recordSysId))
			return null;

		var hs = new GlideHistorySet(tableName, recordSysId);
		return hs.generate();
	},

	generateRefreshRequest: function(){
		return {
			timestamp : new Date().getTime()
		};
	},

    type: 'RecordHistoryDataGenerator'
};
