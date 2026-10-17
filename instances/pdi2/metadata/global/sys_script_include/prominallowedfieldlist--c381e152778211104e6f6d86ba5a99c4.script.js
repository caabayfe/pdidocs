var ProminAllowedFieldList = Class.create();
ProminAllowedFieldList.prototype = {
    initialize: function() {},

    process: function(tableName, currentTableName, entityId) {
		var allowedFields = [];
		if(!gs.nil(entityId)) {
			var gr = new GlideRecord('promin_activity_def');
			gr.addQuery('entity', entityId);
			gr.query();
			while(gr.next()) {
				allowedFields.push(gr.getValue('field'));
			}
			return (allowedFields.length > 0) ? allowedFields : null;
		} else {
			return new ProminAllowedColumnList().process(tableName, tableName, entityId);
		}
    },

    type: 'ProminAllowedFieldList'
};
