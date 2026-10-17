var mlOutputFieldTypeExtPt = Class.create();
mlOutputFieldTypeExtPt.prototype = {
    initialize: function() {
    },
	/**
	*  getMLOutputFieldChoices method is used to get suitable fields than can be selected
	*  from the table for the output column of classification and regression capabilities 
	*  
	*  Input Parameters (injected into the method) are:
	*  'tableName' - Table selected on the capability solution definition.
	*  'capability' - the ml capability in use
	*
	*  Output - 'fieldsArr' {array}
	*  result contains columns names for the given table
	*/
    getMLOutputFieldChoices: function(tableName,capability) {
		return fieldsArr;
    },

    type: 'mlOutputFieldTypeExtPt'
};
