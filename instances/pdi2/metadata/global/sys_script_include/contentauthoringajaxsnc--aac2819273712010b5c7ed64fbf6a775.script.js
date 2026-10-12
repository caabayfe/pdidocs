var ContentAuthoringAjaxSNC = Class.create();
ContentAuthoringAjaxSNC.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    /**
     * This function will create assosiation of content to topic
     */
    createContentMapping: function() {
		var contentSysId = this.getParameter('sysparm_documentId');
		var contentTable = this.getParameter('sysparm_table');
		var topicSysId = this.getParameter('sysparm_topic');
        var mappingSysId = this._createContentMapping(contentSysId, contentTable, topicSysId);
        var result = this.newItem("result");
        result.setAttribute("mappingSysId", JSON.stringify(mappingSysId));
    },
	
    _createContentMapping: function(contentSysId, contentTable, topicSysId) {
        var table = this._getContentTable(contentTable);
        return new global.TaxonomyUtil().associateContentToTopic(contentSysId, table, topicSysId);
    },

    /**
     * This function will return the content table for the corresponding extended table.
     * @param table: extended table name.
     */
    _getContentTable: function(table) {
        var tableNames = global.TaxonomyConstants.TABLES['CONTENT_TABLES'];
        for (var i in tableNames) {
            if (table === tableNames[i] || new TableUtils(table).getTables().indexOf(tableNames[i]) != -1)
                return tableNames[i];
        }
        return table;
    },

    /**
     * This function will return all active taxonomies
	 * @return String
     */
    getTaxonomies: function() {
		var taxonomyGr = new GlideRecord("taxonomy");
		var taxonomies = new global.TaxonomyUtil().getTaxonomies(false);
		taxonomies = JSON.stringify(taxonomies);
        var result = this.newItem("result");
        result.setAttribute("taxonomy", taxonomies);
    },
	
    /**
     * This function will return all topics for a Taxonomy
     */
    getTaxonomyTopics: function() {
        var topics = new global.TaxonomyUtil().getTopicsHierarchy(this.getParameter('sysparm_taxonomyId'));
        var result = this.newItem("result");
        result.setAttribute("topics", JSON.stringify(topics));
    },

    type: 'ContentAuthoringAjaxSNC'
});
