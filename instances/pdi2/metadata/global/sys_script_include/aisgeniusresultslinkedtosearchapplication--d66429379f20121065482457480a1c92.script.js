var AISGeniusResultsLinkedToSearchApplication = Class.create();
AISGeniusResultsLinkedToSearchApplication.prototype = {
    initialize: function() {},

	areGeniusResultsLinked: function(searchContextConfigId) {
		var cachedValue = GlideCacheManager.get('search_context_config_gr_linked', searchContextConfigId);
		if (cachedValue != null)
			return cachedValue;

		var sac = new GlideRecord('sys_search_context_config');
		if(sac.get(searchContextConfigId)) {
			var gr = new GlideRecord('ais_search_profile_ais_genius_result_configuration_m2m');
			gr.addQuery('profile',sac.getValue('search_profile'));
			gr.addQuery('genius_result_configuration.active','true');
			gr.setLimit(1);
			gr.query();
			var isGeniusResultLinked = gr.hasNext();
			GlideCacheManager.put('search_context_config_gr_linked',searchContextConfigId, isGeniusResultLinked);
			return isGeniusResultLinked;
		}
		return false;
	},
	
    type: 'AISGeniusResultsLinkedToSearchApplication'
};
