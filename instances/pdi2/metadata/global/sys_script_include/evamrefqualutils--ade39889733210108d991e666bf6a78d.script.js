var EVAMRefQualUtils = Class.create();
EVAMRefQualUtils.prototype = {
    initialize: function() {
    },
	
	getRefQualForDatasourceFilter: function(current) {
		var gr = new GlideRecord('sys_ux_composite_data_m2m_datasource');
		gr.addQuery('dataset', current.filter.dataset);
		gr.addQuery('datasource.active', true);
		gr.query();
		var ids = [];
		while (gr.next()) {
			ids.push(gr.getValue('datasource'));
		}
		return 'sys_idIN' + ids.join(',');
	},

    type: 'EVAMRefQualUtils'
};
