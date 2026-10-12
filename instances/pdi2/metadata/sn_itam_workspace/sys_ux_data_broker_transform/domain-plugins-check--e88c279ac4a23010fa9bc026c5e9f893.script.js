function transform(input) {
	var items = [];
	var selectedItems = [];
	var result = result = {
		"items": items,
		"selectedItem": selectedItems
	};
	var plugins = {};
	plugins['com.snc.pa.domain_support'] = {"label": 'DomainSupport',"id": 'domain_support'};
	plugins['com.glide.domain.msp_extensions.installer'] = {"label": 'DomainExtension',"id": 'domain_extension'};
	plugins['com.sn_pa_domain_filter'] = {"label": 'DomainFilter',"id": 'domain_filter'};
	
	var element = (input.pluginIds || "").trim();

	if (!gs.nil(element)) {
		var inputItems = [];
		inputItems = input.pluginIds.split(',');

		for (var i = 0; i < inputItems.length; i++) {
			var id = inputItems[i];
			if (!gs.nil(id)){
				var active = GlidePluginManager.isActive(id);
				if (active){
					if (!gs.nil(plugins[id])){
						items.push(plugins[id]);
						if (selectedItems.length == 0) {
							selectedItems.push(plugins[id]['id']);
						}
					}
				}
			}
		}
	}
	return result;
}
