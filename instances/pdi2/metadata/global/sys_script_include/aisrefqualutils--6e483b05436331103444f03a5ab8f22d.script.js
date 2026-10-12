var AISRefQualUtils = Class.create();
AISRefQualUtils.prototype = {
	initialize: function() {
	},

	//Used by the 'attribute' column of 'ais_datasource_attribute' table
	getRefQualForSourceAttribute: function(sourceTableName) {
		var basicFilter = 'applies_to=0^ORapplies_to=1^EQ';
		
		if (GlidePluginManager.isActive('com.glide.platform_mm_service')) {
			var supportedTablesStr = gs.getProperty('glide.platform_mm_service.supported_tables', '');
			var supportedTablesArray = supportedTablesStr.split(',');
			var isSupported = supportedTablesArray.some(function(item) {
				return item.trim() === sourceTableName.trim();
            });
			//don't show mms attribute if the table is not mms supported
			//d53f7f4a2f15b61012238ccb903f9b59 is sys_id for mms attribute
			if(!isSupported || !(new sn_ais.AisUtil().isIndexAttachmentsEnabled(sourceTableName)))			    
				basicFilter = 'sys_id!=d53f7f4a2f15b61012238ccb903f9b59' + '^' + basicFilter;
		}

		if (!GlidePluginManager.isActive('com.glide.ais.external_content'))
			return basicFilter;

		var nonPublicAccessFilter = 'attribute!=allow_public_access';
		var publicAccessFilter = 'attribute=allow_public_access^EQ';

		if (gs.nil(sourceTableName))
			return nonPublicAccessFilter + '^' + basicFilter;

		var isExternal = GlideDBObjectManager.get().isInstanceOf(sourceTableName, 'v_ais_external_search_content');
		if (!isExternal)
			return nonPublicAccessFilter + '^' + basicFilter;

		return 'attribute=user_read_takes_precedence_over_group_deny^OR' + publicAccessFilter;
	},

    type: 'AISRefQualUtils'
};
