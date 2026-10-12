var MosaicUtil = Class.create();
		MosaicUtil.prototype = {
			initialize: function() {
			},

			shouldPluginTriggerMetadataSync: function(plugin_id) {
				if (plugin_id == 'sn_generative_ai' || plugin_id == 'sn_aia' || plugin_id == 'sn_ais_assist' || plugin_id == 'sn_ai_websearch') {
					gs.debug('Mosaic: in shouldPluginTriggerMetadataSync, returning true for plugin ' + plugin_id);
					return true;
				}

				// in addition to above plugins, check if there are any additional plugins in the sysprop
				var additional_plugins = gs.getProperty("com.glide.one_extend.mosaic.plugins_for_metadata_sync", "");
				var additional_plugins_array = additional_plugins.split(',');
				for (var i = 0; i < additional_plugins_array.length; i++) {
					if (additional_plugins_array[i].trim() == plugin_id.trim()) {
						gs.debug('Mosaic: in shouldPluginTriggerMetadataSync, returning true for plugin ' + plugin_id);
						return true;
					}
				}

				gs.debug('Mosaic: in shouldPluginTriggerMetadataSync, returning false for plugin ' + plugin_id);
				return false;
			},

			type: 'MosaicUtil'
};
