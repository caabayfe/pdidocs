
    	var DocumentUserCriteriaCanAccess = Class.create();
		var TABLE_NAME = 'ds_document_uc_can_access_mtom';
		
		DocumentUserCriteriaCanAccess.prototype = {
			initialize: function() {
			},
			type: 'DocumentUserCriteriaCanAccess'
		};
		
		DocumentUserCriteriaCanAccess.isDuplicate = function(current) {
			var d = current.document;
			var uc = current.user_criteria;
			var p = current.permission;
			var gr = new GlideRecord(TABLE_NAME);
			gr.addQuery('document', d);
			gr.addQuery('permission', p);
			gr.addQuery('user_criteria', uc);
			gr.setLimit(1);
			gr.query();
			if (gr.next()) {
				return true;
			}
			return false;
		};
