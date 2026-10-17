var TopicCategoryContentSurfacingUtilSNC = Class.create();
TopicCategoryContentSurfacingUtilSNC.prototype = {
    initialize: function() {
        this.JOB_LAST_EXECUTION_PROPERTY = "taxonomy.category.new_content_job_last_run";
        this.CATALOG_CONTENT_TYPE = "98f9a16553622010069addeeff7b1248";
        this.KNOWLEDGE_CONTENT_TYPE = "4c32a92153622010069addeeff7b12a3";
        this.UPDATE_TYPE_ADDED = 'added';
        this.UPDATE_TYPE_REMOVED = 'removed';
        this.CONNECTED_CONTENT_TABLE = "m2m_connected_content";
        this.UNCONNECTED_CONTENT_TABLE = "unconnected_category_content";
        this.CONTENT_CONFIG_MAP = this._getContentConfigMap();
        this.IS_AUTO_SYNC_ENABLED = new TopicCategoryUtil().isAutoSyncEnabled();
    },

    _getContentConfigMap: function() {
        var contentConfigs = {};
        var contentConfigGr = this._getContentConfig();
        while (contentConfigGr.next()) {
            var contentTypeId = contentConfigGr.getUniqueValue();
            contentConfigs[contentTypeId] = {};
            contentConfigs[contentTypeId].content_reference_field = contentConfigGr.getValue('content_reference_field');
            contentConfigs[contentTypeId].connected_content_table = contentConfigGr.getValue('connected_content_table');
        }
        return contentConfigs;
    },

    _getUnconnectedContentGr: function(updateType) {
        var unconnContentGr = new GlideRecord(this.UNCONNECTED_CONTENT_TABLE);
        unconnContentGr.addQuery('dismissed', false);
        unconnContentGr.addQuery('update_type', updateType);
        unconnContentGr.query();
        return unconnContentGr;
    },

    /**
     * Processes unconnected content records and adds/deletes them to/from connected content table based on the update_type.
     */
    processUnconnectedContent: function() {
        if (this.IS_AUTO_SYNC_ENABLED) {
            this.addConnectedContent();
            this.removeConnectedContent();
        }
    },

    /**
     * Adds content (to connected content table) which are added to the associated categories of the topics.
     */
    addConnectedContent: function() {
        var unconnContentGr = this._getUnconnectedContentGr(this.UPDATE_TYPE_ADDED);
        var contentConfigMap = this.CONTENT_CONFIG_MAP;
        while (unconnContentGr.next()) {
            var contentTypeConfig = contentConfigMap[unconnContentGr.getValue('content_type')];
            var contentGr = new GlideRecord(contentTypeConfig.connected_content_table);
            contentGr.initialize();
            contentGr.setValue('topic', unconnContentGr.getValue('topic'));
            contentGr.setValue('content_type', unconnContentGr.getValue('content_type'));
            contentGr.setValue(contentTypeConfig.content_reference_field, unconnContentGr.getValue(contentTypeConfig.content_reference_field));
            contentGr.setValue('source', 'category');
            if (!contentGr.insert()) {
                gs.info(gs.getMessage("Unable to process the following unconnected content to topic: {0}", unconnContentGr.getUniqueValue()));
            }
        }
    },

    /**
     * Removes content (from connected content table) which are removed from associated categories of the topics.
     */
    removeConnectedContent: function() {
        var unconnContentGr = this._getUnconnectedContentGr(this.UPDATE_TYPE_REMOVED);
        var contentConfigMap = this.CONTENT_CONFIG_MAP;
        while (unconnContentGr.next()) {
            var contentTypeConfig = contentConfigMap[unconnContentGr.getValue('content_type')];
            var contentGr = new GlideRecord(contentTypeConfig.connected_content_table);
            contentGr.addQuery('topic', unconnContentGr.getValue('topic'));
            contentGr.addQuery('content_type', unconnContentGr.getValue('content_type'));
            contentGr.addQuery(
                contentTypeConfig.content_reference_field,
                unconnContentGr.getValue(contentTypeConfig.content_reference_field)
            );
            contentGr.addQuery('source', 'category');
            contentGr.query();
            if (!(contentGr.next() && contentGr.deleteRecord())) {
                gs.info(gs.getMessage("Unable to process the following unconnected content to topic: {0}", unconnContentGr.getUniqueValue()));
            }
        }
    },

    /**
     * Return filtered GlideRecord based on table name and encoded query
     */
    _getFilteredGlideRecord: function(tableName, encodedQuery, disableWorkflow) {
        var gr = new GlideRecord(tableName);
        if (disableWorkflow)
            gr.setWorkflow(false);
        if (encodedQuery)
            gr.addEncodedQuery(encodedQuery);
        gr.query();
        return gr;
    },

    /**
     * Insert records in unconnected_category_content based on a list of values
     */
    _createUnconnectedContentRecords: function(records) {
        records.forEach(function(record) {
            var gr = new GlideRecord(this.UNCONNECTED_CONTENT_TABLE);
            for (var key in record)
                gr[key] = record[key];
            gr.insert();
        }, this);
    },

    /**
     * Returns a object where the key is the category id and the value is an empty object
     */
    _buildCategoryContentMap: function(contentType, categoryRefField) {
        var categoryContentMap = {};

        var connectedCategoryGr = new GlideAggregate("m2m_connected_category");
        connectedCategoryGr.addQuery("content_type", contentType);
        connectedCategoryGr.addNotNullQuery(categoryRefField);
        connectedCategoryGr.groupBy(categoryRefField);
        connectedCategoryGr.query();

        while (connectedCategoryGr.next())
            categoryContentMap[connectedCategoryGr.getValue(categoryRefField)] = {};
        return categoryContentMap;
    },

    /**
     * Returns a object for linking category and content
     * Structure of the object is {<categoryId>: {contentId: {contentId: <content id>, published: <published date>}}}
     */
    _identifyNewContentInCategories: function(categoryContentMap, categoryField, tableName, encodedQuery) {
        var last_run_date = gs.getProperty(this.JOB_LAST_EXECUTION_PROPERTY);

        var query = categoryField + "IN" + Object.keys(categoryContentMap).join(",");
        if (last_run_date)
            query += "^sys_created_on>=" + last_run_date;
        if (encodedQuery)
            query += "^" + encodedQuery;
        var contentGr = this._getFilteredGlideRecord(tableName, query);

        while (contentGr.next()) {
            var categoryId = contentGr.getValue(categoryField);
            categoryContentMap[categoryId][contentGr.sys_id.toString()] = {
                contentId: contentGr.sys_id.toString(),
                content_creation_date: contentGr.getValue("sys_created_on")
            };
        }
    },

    /**
     * Identifies new catalog items that have been added in the connected categories
     */
    _identifyNewContentInCategoriesForCatalog: function(categoryContentMap) {
        var last_run_date = gs.getProperty(this.JOB_LAST_EXECUTION_PROPERTY);

        var query = "sc_categoryIN" + Object.keys(categoryContentMap).join(",");
        if (last_run_date)
            query += "^sys_created_on>=" + last_run_date;
        var contentGr = this._getFilteredGlideRecord("sc_cat_item_category", query);

        while (contentGr.next()) {
            var categoryId = contentGr.sc_category.toString();
            var contentId = contentGr.sc_cat_item.toString();
            var content_creation_date = contentGr.sc_cat_item.sys_created_on.toString();
            categoryContentMap[categoryId][contentId] = {
                contentId: contentId,
                content_creation_date: content_creation_date
            };
        }
    },

    _getContentConfig: function() {
        return this._getFilteredGlideRecord(
            "taxonomy_content_configuration",
            "category_reference_fieldISNOTEMPTY^content_table_category_fieldISNOTEMPTY^category_tableISNOTEMPTY^active=true"
        );
    },

    _fetchTopicsWithCategoryContent: function(contentType) {
        var topicIds = [];
        var connectedContentGr = new GlideAggregate(this.CONNECTED_CONTENT_TABLE);
        connectedContentGr.addQuery('source', 'category');
        connectedContentGr.addQuery('content_type', contentType);
        connectedContentGr.addNotNullQuery('topic');
        connectedContentGr.groupBy('topic');
        connectedContentGr.query();
        while (connectedContentGr.next()) {
            topicIds.push(connectedContentGr.getValue('topic'));
        }
        return topicIds;
    },

    _getContentList: function(contentTable, categoryField, contentIds) {
        var contentList = [];
        var contentGr = new GlideRecord(contentTable);
        contentGr.addQuery('sys_id', 'IN', contentIds);
        contentGr.query();
        while (contentGr.next()) {
            var content = {};
            content.id = contentGr.getValue('sys_id');
            content.category = contentGr.getValue(categoryField);
            content.content_creation_date = contentGr.getValue('sys_created_on');
            contentList.push(content);
        }
        return contentList;
    },

    /**
     * Returns an object containing content items that got removed from category
     */
    _identifyRemovedContentInCategories: function(contentTable, categoryField, contentIds, categoryIds) {
        var query = 'sys_idIN' + contentIds;
        query += "^" + categoryField + "IN" + categoryIds;
        var contentGr = this._getFilteredGlideRecord(contentTable, query);
        while (contentGr.next()) {
            var index = contentIds.indexOf(contentGr.getValue('sys_id'));
            if (index > -1) {
                contentIds.splice(index, 1);
            }
        }
        return this._getContentList(contentTable, categoryField, contentIds);
    },

    /**
     * Returns an object containing catalog items that got removed from category
     */
    _identifyRemovedContentInCategoriesForCatalog: function(contentTable, categoryField, contentIds, categoryIds) {
        var query = "sc_cat_itemIN" + contentIds;
        query += "^sc_categoryIN" + categoryIds;
        var catalogCategoryGr = this._getFilteredGlideRecord("sc_cat_item_category", query);
        while (catalogCategoryGr.next()) {
            var index = contentIds.indexOf(catalogCategoryGr.getValue('sc_cat_item'));
            if (index > -1) {
                contentIds.splice(index, 1);
            }
        }
        return this._getContentList(contentTable, categoryField, contentIds);
    },

    /**
     * Deletes the already suggested content items that are not dismissed yet.
     */
    _removePreviousSuggestions: function(topicId, contentType, update_type) {
        var existingUnconnectedContentGr = this._getFilteredGlideRecord(this.UNCONNECTED_CONTENT_TABLE, "topic=" + topicId + "^content_type=" + contentType + "^update_type=" + update_type + "^dismissed=false", true);
        existingUnconnectedContentGr.deleteMultiple();
    },

    /**
     * Returns the list of content ids that should not be suggested
     * These content includes the ones that have been already dismissed or are already connected via m2m_connected_content table
     */
    _getExclusionContentForTopic: function(topicId, contentType, contentRefField, update_type) {
        var excludedContentIds = {};
        var existingUnconnectedContentGr = this._getFilteredGlideRecord(this.UNCONNECTED_CONTENT_TABLE, "topic=" + topicId + "^content_type=" + contentType, true);
        while (existingUnconnectedContentGr.next()) {
            if (update_type === existingUnconnectedContentGr.getValue('update_type')) {
                excludedContentIds[existingUnconnectedContentGr[contentRefField]] = existingUnconnectedContentGr[contentRefField];
            }
        }

        if (update_type === this.UPDATE_TYPE_ADDED) {
            var existingConnectedContentGr = this._getFilteredGlideRecord(this.CONNECTED_CONTENT_TABLE, "topic=" + topicId + "^content_type=" + contentType);
            while (existingConnectedContentGr.next())
                excludedContentIds[existingConnectedContentGr[contentRefField]] = existingUnconnectedContentGr[contentRefField];
        }
        return Object.keys(excludedContentIds);
    },

    /**
     * Returns the list of KB article sys ids that should not be suggested
     * New translations of KB articles are not suggested if any existing language for the same KB articles has been dismissed
     * New versions of KB articles are not suggested if any existing version has been dismissed
     */
    _getExcludedKBArticlesForTopic: function(topicId, update_type) {
        var excludedKBIds = {};

        var KBTranslationUtil = new sn_ex_sp.KBContentTranslationUtil();
        var query = "dismissed=true^content_type=" + this.KNOWLEDGE_CONTENT_TYPE + "^topic=" + topicId + "^update_type=" + update_type;
        var unconnectedContentGr = this._getFilteredGlideRecord(this.UNCONNECTED_CONTENT_TABLE, query, true);

        while (unconnectedContentGr.next()) {
            // New versions should not be suggested for dismissed KB articles
            var kbVersionsGr = this._getFilteredGlideRecord("kb_knowledge", "number=" + unconnectedContentGr.getValue("knowledge"));
            while (kbVersionsGr.next())
                excludedKBIds[kbVersionsGr.getValue("sys_id")] = 1;

            // New translations should not be suggested for dismissed KB articles
            if (GlidePluginManager.isActive("com.glideapp.knowledge.i18n2")) {
                var translatedVersionsGr = KBTranslationUtil.getTranslatedVersionsFromSysId(unconnectedContentGr.getValue('knowledge'));
                while (translatedVersionsGr.next())
                    excludedKBIds[translatedVersionsGr.getValue("sys_id")] = 1;
            }
        }

        return Object.keys(excludedKBIds);

    },

    surfaceContent: function() {
        try {
            this.surfaceNewContent();
            this.surfaceRemovedContent();
            this.processUnconnectedContent();
        } catch (e) {
            gs.info('error while surfacing content for topics: ' + e);
        }
    },

    surfaceNewContent: function() {
        var contentConfigGr = this._getContentConfig();
        var recordDataList = [];

        while (contentConfigGr.next()) {
            var contentType = contentConfigGr.getValue("sys_id");
            // connected content fields
            var contentRefField = contentConfigGr.content_reference_field.toString();
            // connected category fields
            var connectedCategoryTable = contentConfigGr.connected_category_table.toString();
            var categoryRefField = contentConfigGr.category_reference_field.toString();
            var contentTable = contentConfigGr.content_table.toString();
            var contentTableCategoryField = contentConfigGr.content_table_category_field.toString();

            var categoryContentMap = this._buildCategoryContentMap(contentType, categoryRefField);

            if (contentType == this.CATALOG_CONTENT_TYPE)
                this._identifyNewContentInCategoriesForCatalog(categoryContentMap);
            else if (contentType == this.KNOWLEDGE_CONTENT_TYPE && GlidePluginManager.isActive("com.snc.knowledge_advanced"))
                this._identifyNewContentInCategories(categoryContentMap, contentTableCategoryField, contentTable, "latest=true");
            else
                this._identifyNewContentInCategories(categoryContentMap, contentTableCategoryField, contentTable);

            var topicGr = this._getFilteredGlideRecord("topic");

            while (topicGr.next()) {
                recordDataList = [];
                connectedCategoryGr = new GlideRecord(connectedCategoryTable);
                connectedCategoryGr.addQuery("topic", topicGr.sys_id.toString());
                connectedCategoryGr.addQuery("content_type", contentType);
                connectedCategoryGr.query();

                var excludedContentIds = this._getExclusionContentForTopic(topicGr.sys_id.toString(), contentType, contentRefField, this.UPDATE_TYPE_ADDED);
                if (contentType == this.KNOWLEDGE_CONTENT_TYPE)
                    excludedContentIds = excludedContentIds.concat(this._getExcludedKBArticlesForTopic(topicGr.getValue("sys_id")), this.UPDATE_TYPE_ADDED);

                connectedCategoryGr = this._getFilteredGlideRecord(connectedCategoryTable, "topic=" + topicGr.sys_id.toString() + "^content_type=" + contentType);
                while (connectedCategoryGr.next()) {
                    newContents = categoryContentMap[connectedCategoryGr[categoryRefField]];
                    if (!newContents)
                        continue;

                    for (contentId in newContents) {
                        if (excludedContentIds.indexOf(contentId) > -1)
                            continue;
                        var record = {
                            update_type: this.UPDATE_TYPE_ADDED,
                            content_type: contentType,
                            topic: topicGr.sys_id.toString(),
                            content_creation_date: newContents[contentId]["content_creation_date"]
                        };
                        record[contentRefField] = contentId;
                        record[categoryRefField] = connectedCategoryGr[categoryRefField].toString();
                        recordDataList.push(record);
                    }
                }
                if (recordDataList)
                    this._createUnconnectedContentRecords(recordDataList);
            }
        }

        gs.setProperty(this.JOB_LAST_EXECUTION_PROPERTY, (new GlideDateTime()).getDate());

        if (gs.getProperty("taxonomy.category.new_feature_alert") === "true")
            gs.setProperty("taxonomy.category.new_feature_alert", false);
    },

    surfaceRemovedContent: function() {
        var contentConfigGr = this._getContentConfig();

        while (contentConfigGr.next()) {
            var contentType = contentConfigGr.getValue("sys_id");
            // connected content fields
            var contentRefField = contentConfigGr.content_reference_field.toString();
            // connected category fields
            var connectedCategoryTable = contentConfigGr.connected_category_table.toString();
            var categoryRefField = contentConfigGr.category_reference_field.toString();
            var contentTable = contentConfigGr.content_table.toString();
            var contentTableCategoryField = contentConfigGr.content_table_category_field.toString();

            var topicIds = this._fetchTopicsWithCategoryContent(contentConfigGr.getValue('sys_id'));
            var topicGr = this._getFilteredGlideRecord("topic", "sys_idIN" + topicIds);
            while (topicGr.next()) {
                var connectedContentGr = new GlideRecord(this.CONNECTED_CONTENT_TABLE);
                connectedContentGr.addQuery('topic', topicGr.getValue('sys_id'));
                connectedContentGr.addQuery('source', 'category');
                connectedContentGr.addQuery('content_type', contentType);
                connectedContentGr.addNotNullQuery(contentRefField);
                connectedContentGr.query();

                var contentIds = [];

                while (connectedContentGr.next()) {
                    contentIds.push(connectedContentGr.getValue(contentRefField));
                }

                var m2mConnCategoryGr = new GlideRecord(connectedCategoryTable);
                m2mConnCategoryGr.addQuery('topic', topicGr.getValue('sys_id'));
                m2mConnCategoryGr.addQuery('content_type', contentType);
                m2mConnCategoryGr.query();

                var categoryIds = [];

                while (m2mConnCategoryGr.next()) {
                    categoryIds.push(m2mConnCategoryGr.getValue(categoryRefField));
                }

                var removedContentItems = [];

                if (contentType == this.CATALOG_CONTENT_TYPE) {
                    removedContentItems = this._identifyRemovedContentInCategoriesForCatalog(contentTable, contentTableCategoryField, contentIds, categoryIds);
                } else {
                    removedContentItems = this._identifyRemovedContentInCategories(contentTable, contentTableCategoryField, contentIds, categoryIds);
                }

                this._removePreviousSuggestions(topicGr.sys_id.toString(), contentType, this.UPDATE_TYPE_REMOVED);
                var excludedContentIds = this._getExclusionContentForTopic(topicGr.sys_id.toString(), contentType, contentRefField, this.UPDATE_TYPE_REMOVED);
                if (contentType == this.KNOWLEDGE_CONTENT_TYPE) {
                    excludedContentIds = excludedContentIds.concat(this._getExcludedKBArticlesForTopic(topicGr.getValue("sys_id")), this.UPDATE_TYPE_REMOVED);
                }
                var recordDataList = [];

                removedContentItems.forEach(function(removedItem) {
                    if (excludedContentIds.indexOf(removedItem.id) < 0) {
                        var record = {
                            update_type: this.UPDATE_TYPE_REMOVED,
                            content_type: contentType,
                            topic: topicGr.sys_id.toString(),
                            content_creation_date: removedItem.content_creation_date
                        };
                        record[contentRefField] = removedItem.id;
                        record[categoryRefField] = removedItem.category;
                        recordDataList.push(record);
                    }
                }, this);
                this._createUnconnectedContentRecords(recordDataList);
            }
        }
    },

    type: 'TopicCategoryContentSurfacingUtilSNC'
};
