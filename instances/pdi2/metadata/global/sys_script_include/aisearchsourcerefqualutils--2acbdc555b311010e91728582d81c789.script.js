var AISearchSourceRefQualUtils = Class.create();
AISearchSourceRefQualUtils.prototype = {
    initialize: function() {
    },
	
	getRefQualForSearchFilter: function(current) {
		var gr = new GlideRecord('ais_search_profile_ais_search_source_m2m'); 
		gr.addQuery('profile', current.search_context_config.search_profile);
		gr.addQuery('search_source.active', true);
		gr.query();
		var ids=[];
		while (gr.next()) {
			ids.push(gr.search_source.sys_id);
		}
		var result = 'sys_idIN' + ids.join(",");
		return result;
	},
	
	getRefQualForSearchSourceFilter: function(current) {
		var gr = new GlideRecord('ais_search_profile_ais_search_source_m2m'); 
		gr.addQuery('profile', current.search_filter.search_context_config.search_profile); 
		gr.addQuery('search_source.active', true);
		gr.query();
		var ids=[];
		while (gr.next()) {
			ids.push(gr.search_source.sys_id);
		}
		var result = 'sys_idIN' + ids.join(",");
		return result;
	},

    type: 'AISearchSourceRefQualUtils'
};
