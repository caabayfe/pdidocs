var UtilScript = Class.create();
UtilScript.prototype = {
    initialize: function() {},


    getTables: function(tableName) {
        var tableUtil = new global.TableUtils(tableName);
        var tableArr = j2js(tableUtil.getTables());
        return tableArr;
    },

    getTableUtil: function(tableName) {
        return new global.TableUtils(tableName);
    },
    
    getTableUtilDrop : function(tableName) {
		return new global.TableUtils(tableName).dropAndClean(tableName);
	},

    getAllExtensions: function(tableName) {
        return j2js(new global.TableUtils(tableName).getAllExtensions());
    },
	//Utility function to clean up a table as per the specified query
	cleanUp: function(tableName, query) {
		var cleanupGr = new GlideRecord(tableName);
		cleanupGr.addEncodedQuery(query);
		cleanupGr.deleteMultiple();
	},

    // Utility Function to get the filter query in "<TableName>.<columnName>" format
	getAdditionalFiltersQuery: function(table, referenceField, valueStream, skuType) {
        if (gs.nil(table) || gs.nil(referenceField))
            return;

        var encodedQuery = new sn_itom_license.ITOMLicensingUtils().getAdditionalFiltersFor(valueStream,skuType);
		if(!encodedQuery)
			return;
		var queryString = new GlideQueryString(table, encodedQuery);
        queryString.deserialize();
        var terms = queryString.getTerms();
        var appendedQuery;
        var index;
        var numberOfQueryStrs = terms.size();
        for (index = 0; index < numberOfQueryStrs; index++) {
            var term = terms.get(index);
            if (gs.nil(appendedQuery)) {
                appendedQuery = referenceField + "." + term.getTerm();
            } else {
                if (term.isOR()) {
                    appendedQuery = appendedQuery + "^OR" + referenceField + "." + term.getTerm();
                } else if (term.isNewQuery()) {
                    appendedQuery = appendedQuery + "^NQ" + referenceField + "." + term.getTerm();
                } else if (term.isEndQuery()) {
                    continue;
                } else {
                    appendedQuery = appendedQuery + "^" + referenceField + "." + term.getTerm();
                }
            }
        }
        return appendedQuery;
    },

	//Utility function to clean up a table
	cleanUpTable: function(tableName){
		var cleanupGr = new GlideRecord(tableName);
		cleanupGr.deleteMultiple();
	},

	/*
		* NOTE: This function should NOT be used when large amount of data needs to be updated.
		* Created generic utility function to set the values of tables which are not accessible from scoped application
		@input
		table - String - Table Name
		identifier - Array of SYS IDs
		data - Set Value Object in Key Value pair
	*/
	setValuesFromScopedApp : function(table,identifier,data){
		var gr = new GlideRecord(table);
		gr.addQuery('sys_id','IN',identifier.join(','));
		gr.query();
		while(gr.next()) {
			Object.keys(data).forEach(function(key){
				gr.setValue(key,data[key]);
				gr.update();
			});
		}
	},

    type: 'UtilScript'
};
