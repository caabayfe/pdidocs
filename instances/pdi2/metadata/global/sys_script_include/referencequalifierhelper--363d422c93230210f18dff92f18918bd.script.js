var ReferenceQualifierHelper = Class.create();
ReferenceQualifierHelper.prototype = {
    initialize: function() {
    },

/** find all reference fields for the current table and its parents
 * and build the query condtion, for example:
 * 	 internal_type=reference^nameINincident,task 
 */
getQueryConditionForRefs: function(tableName) {
	var hierarchy = '' + GlideDBObjectManager.get().getTables(tableName);
	hierarchy = hierarchy.replace('[', '');
	hierarchy = hierarchy.replace(']', '');
	hierarchy = hierarchy.replace(' ', '');
	return 'internal_type=reference^nameIN'+ hierarchy;
},
	
    type: 'ReferenceQualifierHelper'
};
