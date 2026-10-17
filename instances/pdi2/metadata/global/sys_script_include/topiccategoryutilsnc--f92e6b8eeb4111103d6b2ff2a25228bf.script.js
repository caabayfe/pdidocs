var TopicCategoryUtilSNC = Class.create();
TopicCategoryUtilSNC.prototype = {
    initialize: function() {
        this.CATALOG_CONTENT_TYPE = "98f9a16553622010069addeeff7b1248";
        this.KNOWLEDGE_CONTENT_TYPE = "4c32a92153622010069addeeff7b12a3";
    },

    isAutoSyncEnabled: function() {
        return gs.getProperty('taxonomy.category.content_auto_sync', 'false') === 'true';
    },

    shouldAccessUnconnectedContent: function(current) {
        return (!this.isAutoSyncEnabled() && (gs.hasRole("taxonomy_admin") || new global.TaxonomyUtil().isTaxonomyManagerOrContributor(current.taxonomy.toString()) || new global.TopicPermissionUtil().isTopicManagerOrContributor(current.sys_id.toString())));
    },

    _getCategoriesForCatalog: function(catItemId) {
        var m2mGr = new GlideAggregate("sc_cat_item_category");
        m2mGr.addQuery("sc_cat_item", catItemId);
        m2mGr.groupBy("sc_category");
        m2mGr.query();
        var categoryIds = [];
        while (m2mGr.next())
            categoryIds.push({
                id: m2mGr.getValue("sc_category"),
                displayValue: m2mGr.sc_category.getDisplayValue()
            });
        return categoryIds;
    },

    _buildTopicCategoryMapForCatalog: function(connectedContentTable, contentRefField) {
        var topicCategoryMap = {};
        var connectedContentGr = new GlideRecord(connectedContentTable);
        connectedContentGr.addQuery("content_type", this.CATALOG_CONTENT_TYPE);
        connectedContentGr.query();
        while (connectedContentGr.next()) {
            var categories = this._getCategoriesForCatalog(connectedContentGr.getValue(contentRefField));
            var mappedCategories = topicCategoryMap[connectedContentGr.getValue("topic")] || {};
            categories.forEach(function(categoryData) {
                mappedCategories[categoryData.id] = categoryData.displayValue;
            });
            topicCategoryMap[connectedContentGr.getValue("topic")] = mappedCategories;
        }
        return topicCategoryMap;
    },

    _buildTopicCategoryMap: function(connectedContentTable, contentRefField, contentType, contentCategoryRefField) {
        var topicCategoryMap = {};
        var connectedContentGr = new GlideRecord(connectedContentTable);
        connectedContentGr.addQuery("content_type", contentType);
        connectedContentGr.query();
        while (connectedContentGr.next()) {
            var category = connectedContentGr[contentRefField][contentCategoryRefField];
            var mappedCategories = topicCategoryMap[connectedContentGr.getValue("topic")] || {};
            mappedCategories[category.sys_id.toString()] = category.getDisplayValue();
            topicCategoryMap[connectedContentGr.getValue("topic")] = mappedCategories;
        }
        return topicCategoryMap;
    },

    /**
     * Fetch categories for each topic and populate Connected Category table.
     */
    setConnectedCategoryFromConnectedContent: function() {
        var contentConfigGr = new GlideRecord("taxonomy_content_configuration");
        var queryStr = "category_reference_fieldISNOTEMPTY^content_table_category_fieldISNOTEMPTY^category_tableISNOTEMPTY^active=true";
        contentConfigGr.addEncodedQuery(queryStr);
        contentConfigGr.query();
        var recordsToInsert;
        while (contentConfigGr.next()) {
            recordsToInsert = [];
            var connectedContentTable = contentConfigGr.connected_content_table.toString();
            var contentRefField = contentConfigGr.content_reference_field.toString();
            var contentCategoryRefField = contentConfigGr.content_table_category_field.toString();
            var connectedCategoryTable = contentConfigGr.connected_category_table.toString();
            var categoryRefField = contentConfigGr.category_reference_field.toString();
            var contentType = contentConfigGr.sys_id.toString();
            var categoryTable = contentConfigGr.category_table.toString();
            var topicCategoryMap = {};
            if (contentType == this.CATALOG_CONTENT_TYPE)
                topicCategoryMap = this._buildTopicCategoryMapForCatalog(connectedContentTable, contentRefField);
            else
                topicCategoryMap = this._buildTopicCategoryMap(connectedContentTable, contentRefField, contentType, contentCategoryRefField);
            for (var topic in topicCategoryMap) {
                for (var categoryId in topicCategoryMap[topic]) {
                    var recordGr = new GlideRecord(connectedCategoryTable);
                    var displayValue = gs.getMessage("{0}", [topicCategoryMap[topic][categoryId]]);
                    recordGr.setValue("topic", topic);
                    recordGr.setValue("content_type", contentType);
                    recordGr.setValue(categoryRefField, categoryId);
                    recordGr.setValue("category_display_value", displayValue);
                    recordGr.insert();
                }
            }
        }
    },

    /**
     *  Added Condition to check whether the user can update the content associated with the topic or not.
     */
    checkUpdateContentCondition: function() {
        return (gs.hasRole("taxonomy_admin") || new global.TaxonomyUtil().isTaxonomyManagerOrContributor() || new global.TopicPermissionUtil().isAnyTopicManager() || new global.TopicPermissionUtil().isAnyTopicContributor());
    },


    /**
     * Remove the content which is deleted from categories in the connected content of topic.
     */
    removeCategoryContentFromConnectedContent: function(current) {
        var contentTypeConfig = current.content_type.getRefRecord();

        // Query the m2m_connected_content table for corresponding records
        var contentGr = new GlideRecord(contentTypeConfig.connected_content_table.toString());
        contentGr.addQuery('topic', current.topic);
        contentGr.addQuery('content_type', current.content_type);
        contentGr.addQuery(
            contentTypeConfig.content_reference_field.toString(),
            current[contentTypeConfig.content_reference_field.toString()]
        );
        contentGr.addQuery('source', 'category');
        contentGr.query();

        if (contentGr.next()) {
            contentGr.deleteRecord();
        } else {
            gs.addInfoMessage(gs.getMessage('Unable to delete content: The selected content is not found in the topic.'));
        }
        current.deleteRecord();
    },

    /**
     * Move content from unconnected_category_content to m2m_connected_content
     */
    moveNewCategoryContentToConnectedContent: function(current) {
        var contentTypeConfig = current.content_type.getRefRecord();
        var contentGr = new GlideRecord(contentTypeConfig.connected_content_table.toString());
        contentGr.initialise();
        contentGr.topic = current.topic;
        contentGr.content_type = current.content_type;
        contentGr[contentTypeConfig.content_reference_field.toString()] = current[contentTypeConfig.content_reference_field.toString()];
        contentGr.source = 'category';
        if (contentGr.insert()) {
            var gr = new GlideRecord("unconnected_category_content");
            gr.addQuery("topic", current.topic);
            gr.addQuery("content_type", current.content_type);
            gr.addQuery(contentTypeConfig.content_reference_field.toString(), current[contentTypeConfig.content_reference_field.toString()]);
            gr.query();
            gr.deleteMultiple();
        } else {
            gs.addErrorMessage(gs.getMessage("Unable to add content to topic."));
        }
    },

    /**
     * Dismiss content from unconnected_category_content
     */
    dismissCategoryContent: function(current) {
        current.dismissed = true;
        if (current.update() && current.content_type.toString() == this.KNOWLEDGE_CONTENT_TYPE && GlidePluginManager.isActive("com.glideapp.knowledge.i18n2")) {
            // Dismiss all translated versions of the KB
            var KBTranslationUtil = new sn_ex_sp.KBContentTranslationUtil();
            var translatedVersionsGr = KBTranslationUtil.getTranslatedVersionsFromSysId(current.getValue('knowledge'));
            var kbIds = [];
            while (translatedVersionsGr.next())
                kbIds.push(translatedVersionsGr.sys_id.toString());

            var gr = new GlideRecord("unconnected_category_content");
            gr.addQuery("knowledge", "IN", kbIds);
            gr.addQuery("topic", current.topic.toString());
            gr.addQuery("content_type", this.KNOWLEDGE_CONTENT_TYPE);
            gr.setValue("dismissed", true);
            gr.updateMultiple();
        }
    },

    updateConnectedContentSource: function() {
        var topicCategoryMap = this._buildTopicCategoryMapFromConnectedCategory();
        this.updateKnowledgeContent(topicCategoryMap);
        this.updateCatalogContent(topicCategoryMap);
        this.updateContentNotAssociatedToCategories();
    },

    _buildTopicCategoryMapFromConnectedCategory: function() {
        var topicCategoryMap = {};
        var connectedCategoryGr = new GlideRecord("m2m_connected_category");
        connectedCategoryGr.query();
        while (connectedCategoryGr.next()) {
            var topicId = connectedCategoryGr.getValue("topic");
            if (!topicCategoryMap[topicId]) {
                topicCategoryMap[topicId] = {
                    "catalog": [],
                    "knowledge": []
                };
            }
            if (connectedCategoryGr.getValue("content_type") === this.KNOWLEDGE_CONTENT_TYPE) {
                topicCategoryMap[topicId].knowledge.push(connectedCategoryGr.getValue("kb_category"));
            } else if (connectedCategoryGr.getValue("content_type") === this.CATALOG_CONTENT_TYPE) {
                topicCategoryMap[topicId].catalog.push(connectedCategoryGr.getValue("sc_category"));
            }
        }
        return topicCategoryMap;
    },

    updateKnowledgeContent: function(topicCategoryMap) {
        for (var topicId in topicCategoryMap) {
            var knowledgeCategories = topicCategoryMap[topicId]["knowledge"];
            if (knowledgeCategories.length > 0) {
                var m2mConnectedContentGr = new GlideRecord("m2m_connected_content");
                m2mConnectedContentGr.addQuery("content_type", this.KNOWLEDGE_CONTENT_TYPE);
                m2mConnectedContentGr.addQuery("topic", topicId);
                m2mConnectedContentGr.addQuery("knowledge.kb_category", "IN", knowledgeCategories);
                m2mConnectedContentGr.query();
                m2mConnectedContentGr.setValue("source", "category");
                m2mConnectedContentGr.updateMultiple();
            }
        }
    },

    updateCatalogContent: function(topicCategoryMap) {
        for (var topicId in topicCategoryMap) {
            var catalogItems = this._getCatalogItemsInCategories(topicCategoryMap[topicId]["catalog"]);
            if (catalogItems.length > 0) {
                var m2mConnectedContentGr = new GlideRecord("m2m_connected_content");
                m2mConnectedContentGr.addQuery("content_type", this.CATALOG_CONTENT_TYPE);
                m2mConnectedContentGr.addQuery("topic", topicId);
                m2mConnectedContentGr.addQuery("catalog_item", "IN", catalogItems);
                m2mConnectedContentGr.query();
                m2mConnectedContentGr.setValue("source", "category");
                m2mConnectedContentGr.updateMultiple();
            }
        }
    },

    updateContentNotAssociatedToCategories: function() {
        var unCategorizedContentGr = new GlideRecord("m2m_connected_content");
        unCategorizedContentGr.addQuery("content_type", "IN", [this.CATALOG_CONTENT_TYPE, this.KNOWLEDGE_CONTENT_TYPE]);
        unCategorizedContentGr.addNullQuery("source");
        unCategorizedContentGr.setValue("source", "user");
        unCategorizedContentGr.updateMultiple();
	},

    _getCatalogItemsInCategories: function(categories) {
        var catalogItems = [];
        var m2mGr = new GlideAggregate("sc_cat_item_category");
        m2mGr.addQuery("sc_category", "IN", categories);
        m2mGr.groupBy("sc_cat_item");
        m2mGr.query();
        while (m2mGr.next())
            catalogItems.push(m2mGr.getValue("sc_cat_item"));
        return catalogItems;
    },

    type: 'TopicCategoryUtilSNC'
};
