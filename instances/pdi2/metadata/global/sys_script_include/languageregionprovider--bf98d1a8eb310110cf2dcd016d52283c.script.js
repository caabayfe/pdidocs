var LanguageRegionProvider = Class.create();
LanguageRegionProvider.prototype = {
    initialize: function() {
    },

	get: function() {
		var result = {};
		var ga = new GlideAggregate("sys_language");
		ga.addQuery('active',true);
		ga.addAggregate('COUNT');
		ga.query();
		if(ga.next()){
			if(ga.getAggregate('COUNT')<=1)
				return {};
		}
		
		var language_region = new GlideRecord('sys_language_region');
		language_region.query();
		if (language_region.hasNext()) {
			result.regions = [];
			while (language_region.next()) {
				if (language_region.getElement('language').getRefRecord().getValue('active') == true) {
					var found = false;
					for (var i = 0; i < result.regions.length; i++) {
						if (result.regions[i].region == language_region.getElement('region').getRefRecord().getDisplayValue('region')) {
							result.regions[i].languages.push({
                                display_label: language_region.getElement('language').getRefRecord().getValue('display_label'),
								id: language_region.getElement('language').getRefRecord().getValue('id')
							});
							found = true;
							break;
						}
					}
					if (!found) {
						result.regions.push({
							region: language_region.getElement('region').getRefRecord().getDisplayValue('region'),
                            order: language_region.getElement('region').getRefRecord().getValue('order'),
							languages: [{
                                display_label: language_region.getElement('language').getRefRecord().getValue('display_label'),
								id: language_region.getElement('language').getRefRecord().getValue('id')
							}]
						});
					}
				}
			}
		} else {
			var language = new GlideRecord('sys_language');
            result.languages = [];
			language.addActiveQuery();
			language.query();
			while (language.next()) {
				result.languages.push({
					display_label: language.getValue('display_label'),
					id: language.getValue('id')
				});
			}
		}
		
		return result;
	},

    type: 'LanguageRegionProvider'
};
