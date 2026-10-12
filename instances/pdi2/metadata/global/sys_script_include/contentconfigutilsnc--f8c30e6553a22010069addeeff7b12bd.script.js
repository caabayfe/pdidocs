var ContentConfigUtilSNC = Class.create();
ContentConfigUtilSNC.prototype = {
    initialize: function() {
        this.configTable = "taxonomy_content_configuration";
    },

    /**
     * Returns all active content tables
     */
    getContentTables: function() {
        var contentTables = [];
        var gr = new GlideRecord(this.configTable);
        gr.addActiveQuery();
        gr.query();
        while (gr.next())
            contentTables.push(gr.getValue('content_table'));
        return contentTables;
    },

    /**
     * Returns content configuration GR for given content table
     * @param contentTable
     * @return GlideRecord
     */
    getContentConfigGr: function(contentTable) {
        var configGr = new GlideRecord(this.configTable);
        configGr.addActiveQuery();
        contentTable ? configGr.get('content_table', contentTable) : configGr.query();
        return configGr;
    },

    /**
     * Returns content configuration GR for given content configuration record id
     * @param contentConfigId
     * @return GlideRecord
     */
    getContentConfigGrFromId: function(contentConfigId) {
        var configGr = new GlideRecord(this.configTable);
        configGr.addActiveQuery();
        configGr.addQuery('connected_content_table', TaxonomyConstants.TABLES.M2M_CONTENT_TABLE);
        if (!gs.nil(contentConfigId))
            configGr.addQuery('sys_id', contentConfigId);
        configGr.query();
        return configGr;
    },
	
	/**
     * This function creates a map of taxonomy_content_configuration records' sys_ids and their correspoding reference field
     */
    getContentReferenceFieldMap: function(includeInactive) {
        var contentReferenceMap = {};
        var gr = new GlideRecord(this.configTable);
		if (!includeInactive)
			gr.addActiveQuery();
        gr.query();
        while (gr.next())
            contentReferenceMap[gr.getUniqueValue()] = gr.getValue('content_reference_field');
        return contentReferenceMap;
    },
	
	/**
     * This function creates a map of taxonomy_content_configuration records' sys_ids and their correspoding category reference field
     */
    getCategoryReferenceFieldMap: function(includeInactive) {
        var contentReferenceMap = {};
        var gr = new GlideRecord(this.configTable);
		if (!includeInactive)
			gr.addActiveQuery();
		gr.addNotNullQuery("category_reference_field");
        gr.query();
        while (gr.next())
            contentReferenceMap[gr.getUniqueValue()] = gr.getValue('category_reference_field');
        return contentReferenceMap;
    },
	
    type: 'ContentConfigUtilSNC'
};
