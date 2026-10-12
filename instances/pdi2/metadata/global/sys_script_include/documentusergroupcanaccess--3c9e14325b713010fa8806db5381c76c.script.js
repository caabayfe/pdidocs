
		var DocumentUserGroupCanAccess = Class.create();
		var TABLE_NAME = 'ds_document_ug_can_access_mtom';
		
		DocumentUserGroupCanAccess.prototype = {
			initialize: function() {
			},
			type: 'DocumentUserGroupCanAccess'
		};
		
		DocumentUserGroupCanAccess.isDuplicate = function(current) {
			var d = current.document;
			var ug = current.user_group;
			var p = current.permission;
			var gr = new GlideRecord(TABLE_NAME);
			gr.addQuery('document', d);
			gr.addQuery('permission', p);
			gr.addQuery('user_group', ug);
			gr.setLimit(1);
			gr.query();
			if (gr.next()) {
				return true;
			}
			return false;
		};
