var PreferredTableAjaxUtil = Class.create();
PreferredTableAjaxUtil.prototype = Object.extendsObject(
	global.AbstractAjaxProcessor,
	{
		isValidTableRecord: function () {
			var tableName = this.getParameter('sysparm_table_name');
			var gr = new GlideRecord('sys_db_object');
			gr.addQuery('name', tableName);
			gr.query();
			if (gr.hasNext()) {
				return true;
			}
			return false;
		},
		type: 'PreferredTableAjaxUtil',
	}
);
