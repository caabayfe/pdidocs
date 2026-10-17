var AddIndexesForCMDBTables = Class.create();
AddIndexesForCMDBTables.prototype = {
    initialize: function() {},
	
    createIndex: function(table, fields, indexName) {
		gs.log('Initialize index creation for table: '+ table + ' on '+ fields);
        var index = new IndexCreator(table, fields, false, null, indexName);
        index.schedule();
		gs.log('Scheduled index creation for table: '+ table + ' on '+ fields);
    },

    type: 'AddIndexesForCMDBTables'
};
