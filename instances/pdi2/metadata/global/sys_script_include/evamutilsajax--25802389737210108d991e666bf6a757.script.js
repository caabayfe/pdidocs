var EVAMUtilsAjax = Class.create();
EVAMUtilsAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	getDatasourceTableAndCondition: function() {
		var sysId = this.getParameter('sysparm_sys_id');
		var gr = new GlideRecordSecure('sys_ux_composite_datasource');
		gr.get(sysId);
		
		return JSON.stringify({
			table: gr.getValue('table'),
			condition: gr.getValue('condition')
		});
	},
    type: 'EVAMUtilsAjax'
});
