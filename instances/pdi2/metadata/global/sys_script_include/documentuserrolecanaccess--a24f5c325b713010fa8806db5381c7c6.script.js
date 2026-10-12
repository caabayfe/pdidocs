
		var DocumentUserRoleCanAccess = Class.create();
		var TABLE_NAME = 'ds_document_ur_can_access_mtom';
		
		DocumentUserRoleCanAccess.prototype = {
			initialize: function() {
			},
			type: 'DocumentUserRoleCanAccess'
		};
		
		DocumentUserRoleCanAccess.isDuplicate = function(current) {
			var d = current.document;
			var ur = current.user_role;
			var p = current.permission;
			var gr = new GlideRecord(TABLE_NAME);
			gr.addQuery('document', d);
			gr.addQuery('permission', p);
			gr.addQuery('user_role', ur);
			gr.setLimit(1);
			gr.query();
			if (gr.next()) {
				return true;
			}
			return false;
		};
