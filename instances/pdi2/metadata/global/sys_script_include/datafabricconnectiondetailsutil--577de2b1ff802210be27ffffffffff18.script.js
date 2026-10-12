var DataFabricConnectionDetailsUtil = Class.create();
DataFabricConnectionDetailsUtil.prototype = {
    initialize: function() {
        this.DATA_DICTIONARY = 'sys_df_data_dictionary';
		this.CATALOG = 'catalog';
		this.INTERNAL_TYPE = 'internal_type';
		this.COLLECTION = 'collection';
    },

    getCountOfMappedTableToConnection: function(connectionName) {
        var count = 0;
        var dictionaryGR = new GlideRecord(this.DATA_DICTIONARY);
        dictionaryGR.addQuery(this.CATALOG, connectionName);
        dictionaryGR.addQuery(this.INTERNAL_TYPE, this.COLLECTION);
        dictionaryGR.query();
        count = dictionaryGR.getRowCount();

        return count;
		/**
		 * TODO: Integrate with API
		 * The method will call the API to getCount of mapping tables per connection
		 *  */
    },

    type: 'DataFabricConnectionDetailsUtil'
};
