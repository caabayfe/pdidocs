var TaxonomyUtilSNC = Class.create();
TaxonomyUtilSNC.prototype = {
    initialize: function() {
        this.contentReferenceFields = TaxonomyConstants.CONTENT_REFERENCE_FIELDS;
        this.categoryReferenceFields = TaxonomyConstants.CATEGORY_REFERENCE_FIELDS;
    },

    /**
     * Check if duplicate content is present during insert or update
     * @param m2mContentGr - GlideRecord
     * @return boolean
     */
    isDuplicateContent: function(m2mContentGr) {
        var operation = m2mContentGr.operation();

        if (operation === 'insert')
            return this._checkForDuplicateContent(m2mContentGr);

        if (operation === 'update' && this.hasFieldsChanged(m2mContentGr))
            return this._checkForDuplicateContent(m2mContentGr);

        return false;
    },

    /**
     * Check if duplicate category is present during insert or update
     * @param m2mContentGr - GlideRecord
     * @return boolean
     */
    isDuplicateCategory: function(m2mCategoryGr) {
        var operation = m2mCategoryGr.operation();

        if (operation === 'insert')
            return this._checkForDuplicateCategory(m2mCategoryGr);

        if (operation === 'update' && this.hasFieldsChanged(m2mCategoryGr, this.categoryReferenceFields))
            return this._checkForDuplicateCategory(m2mCategoryGr);

        return false;
    },

    hasFieldsChanged: function(m2mContentGr, fieldsToCheck) {
        var fieldsChanged = false;
        fieldsToCheck = fieldsToCheck || this.contentReferenceFields;
        fieldsToCheck = fieldsToCheck.concat('topic');
        for (var i = 0; i < fieldsToCheck.length; i++) {
            if (m2mContentGr[fieldsToCheck[i]].changes()) {
                fieldsChanged = true;
                break;
            }
        }
        return fieldsChanged;
    },

    isDuplicateTopicName: function(topicGr) {
        var gr = new GlideRecord('topic');
	gr.addQuery('taxonomy', topicGr.taxonomy);
	gr.addQuery('name', this._getTopicDisplayName(topicGr));
	gr.addQuery('sys_id', '!=', topicGr.getUniqueValue());
	gr.addActiveQuery();
	gr.query();
	
	if (gr.next() || this._hasDuplicateTranslatedName(topicGr)) {
	    return true;
	}
	
	return false;
    },

    _hasDuplicateTranslatedName: function(currentTopicGr) {
	var topicSysIds = [];
	// Get all topics under the taxonomy
	var topicGr = new GlideRecord('topic');
	topicGr.addQuery('taxonomy', currentTopicGr.taxonomy);
	topicGr.addQuery('sys_id', '!=', currentTopicGr.getUniqueValue());
	topicGr.addActiveQuery();
	topicGr.query();
	while (topicGr.next()) {
	    topicSysIds.push(topicGr.getUniqueValue());
	}
		
	// check translated text for duplicate names
	var translatedTextGr = new GlideRecord('sys_translated_text');
	translatedTextGr.addQuery('tablename', 'topic');
	translatedTextGr.addQuery('language', gs.getSession().getLanguage());
	translatedTextGr.addQuery('documentkey', 'IN', topicSysIds.join(','));
	translatedTextGr.addQuery('value', this._getTopicDisplayName(currentTopicGr));
	translatedTextGr.query();
		
	return translatedTextGr.next() ? true : false;
    },

    _getTopicDisplayName: function(topicGr) {
        var topicName = topicGr.getDisplayValue('name');
	if (gs.getProperty('glide.ui.i18n_test') === 'true') {
	    // "TRT: "
	    return topicName.substring(5);
	}

	return topicName;
    },

    _checkForDuplicateContent: function(m2mContentGr) {
        var configGr = m2mContentGr.content_type.getRefRecord();
        var contentRefField = configGr.getValue("content_reference_field");
        var gr = new GlideRecord('m2m_connected_content');
        gr.addQuery('content_type', m2mContentGr.getValue("content_type"));
        gr.addQuery(contentRefField, m2mContentGr.getValue(contentRefField));
        gr.addQuery('topic', m2mContentGr.getValue("topic"));
        gr.setLimit(1);
        gr.query();
        return gr.hasNext();
    },

    _checkForDuplicateCategory: function(m2mCategoryGr) {
        var configGr = m2mCategoryGr.content_type.getRefRecord();
        var categoryRefField = configGr.getValue("category_reference_field");
        var gr = new GlideRecord(configGr.getValue("connected_category_table"));
        gr.addQuery('content_type', m2mCategoryGr.getValue("content_type"));
        gr.addQuery(categoryRefField, m2mCategoryGr.getValue(categoryRefField));
        gr.addQuery('topic', m2mCategoryGr.getValue("topic"));
        gr.setLimit(1);
        gr.query();
        return gr.hasNext();
    },

    /**
     * Checks if any of the content reference fields changed
     * @param GlideRecord
     * @return boolean
     */
    isContentReferenceFieldChanged: function(m2mContentGr) {
        var referenceField = m2mContentGr.content_type.content_reference_field;
        return m2mContentGr[referenceField].changes();
    },

    /**
     * Checks if any of the category reference fields changed
     * @param GlideRecord
     * @return boolean
     */
    isCategoryReferenceFieldChanged: function(m2mContentGr) {
        var referenceField = m2mContentGr.content_type.category_reference_field;
        return m2mContentGr[referenceField].changes();
    },

    /**
     * This function will return true if taxonomy is present
     */
    hasTaxonomy: function() {
        var gr = new GlideRecord('taxonomy');
        gr.addActiveQuery();
        gr.query();
        while (gr.next())
            if (gr.canRead())
                return true;
        return false;
    },

    /**
     * This function will return all taxonomies
     * @param includeInactive : flag to include inactive taxonomies
     * @return Array
     */
    getTaxonomies: function(includeInactive) {
        var grTaxonomy = new GlideRecord("taxonomy");
        if (!includeInactive)
            grTaxonomy.addActiveQuery();
        grTaxonomy.orderBy('name');
        grTaxonomy.query();

        var taxonomies = [];
        while (grTaxonomy.next()) {
            if (grTaxonomy.canRead()) {
                var taxonomyObj = {
                    "id": grTaxonomy.getUniqueValue(),
                    "name": GlideStringUtil.escapeHTML(grTaxonomy.getDisplayValue())
                };
                taxonomies.push(taxonomyObj);
            }

        }

        return taxonomies;
    },

    /**
     * This function will return all topics
     * @param taxonomy : taxonomy sysId
     * @param includeInactive : flag to include inactive topics
     * returns topics glideRecord.
     */
    getTaxonomyTopics: function(taxonomyId, includeInactive) {
        var grTopic = new GlideRecord("topic");
        if (!includeInactive)
            grTopic.addActiveQuery();
        grTopic.query("taxonomy", taxonomyId + "");
        grTopic.orderBy("parent_topic");
        grTopic.orderBy("name");
        return grTopic;
    },

    /**
     * This function will return gliderecord of Taxonomy
     * @param taxonomyId : sysId of taxonomy 
     * returns taxonomy for given Id.
     */
    getTaxonomy: function(taxonomyId) {
        var grTaxonomy = new GlideRecord("taxonomy");
        grTaxonomy.get(taxonomyId);
        return grTaxonomy;
    },

    /**
     * This function will create mapping between content and topic
     *
     * @param contentSysId: sys_id of Content(e.g. Knowledge, cataglog item) record.
     * @param contentTable: Table of Content (e.g kb_knonwledge)
     * @param topicSysId: sys_id of Taxonomy Topic
     */
    associateContentToTopic: function(contentSysId, contentTable, topicSysId) {
        if (contentSysId == '' || contentTable == '' || topicSysId == '') {
            gs.error(gs.getMessage("Either contentSysId or contentTable or topicSysId is empty"));
            return null;
        }

        var connectedContentgr = new GlideRecord('m2m_connected_content');
        var sysId = null;

        contentTable = this.getValidContentTable(contentTable);
        if (!connectedContentgr.canCreate()) {
            gs.error(gs.getMessage("{0} doesnot have create access on connected content table", gs.getUserName()));
            return sysId;
        }

        if (!this.isActiveTopicPresent(topicSysId)) {
            gs.error(gs.getMessage("Either taxonomy topic does not exist or invalid"));
            return sysId;
        }

        if (gs.nil(contentTable)) {
            gs.error(gs.getMessage("Invalid taxonomy content table"));
            return sysId;
        }

        if (!this.isContentPresent(contentTable, contentSysId)) {
            gs.error(gs.getMessage("Content does not exist"));
            return sysId;
        }

        connectedContentgr.initialize();
        var cofigUtil = new global.ContentConfigUtil();
        var configGr = cofigUtil.getContentConfigGr(contentTable);
        connectedContentgr.content_type = configGr.getUniqueValue();
        var contentReferenceField = configGr.getValue("content_reference_field");
        connectedContentgr[contentReferenceField] = contentSysId;
        connectedContentgr.topic = topicSysId;

        if (connectedContentgr.insert())
            sysId = connectedContentgr.getUniqueValue();
        else
            gs.error(gs.getMessage("Failed to associate content to topic"));

        return sysId;
    },

    /**
     * This function will return true if given table is valid content table to qualify having new button.
     * @param parent: parent glide record.
     */
    hasContentAuthoringNewAction: function(parent) {
        if (!parent)
            return false;
        var tableName = parent.sys_class_name || parent.getTableName();
        return (this.isValidContentAuthoringTable(tableName) && this.isContentAuthoringAllowed(parent));
    },

    /*
     * This function will apply the filter provided by extension point on the content authoring "Add" action and will return true if record passes through filter
     * @param recordId: content record sys id 
     * @param table: content type (kb_knowledge, sc_cat_item,....)
     */
    isContentAuthoringAllowed: function(parent) {
        var table = new TableUtils(parent.getTableName()).getAbsoluteBase();
        var ep = new GlideScriptedExtensionPoint().getExtensions('TaxonomyContentProcessor');
        for (i = 0; i < ep.length; i++) {
            if (ep[i].getTableName() == table) {
                return ep[i].isContentAuthoringAllowed(parent);
            }
        }
    },

    /**
     * This function will return true if given table is valid content table or its extended table.
     * @param table: table name.
     */
    isValidContentAuthoringTable: function(table) {
        var tableNames = global.TaxonomyConstants.TABLES['CONTENT_TABLES'];
        for (var i in tableNames) {
            if (table === tableNames[i] || new TableUtils(table).getTables().indexOf(tableNames[i]) != -1) {
                return true;
            }
        }
        return false;
    },

    /**
     * This function will return true if given table is valid Taxonomy content table.
     * @param tableName: name of the table.
     */
    getValidContentTable: function(tableName) {
        var tableNames = global.TaxonomyConstants.TABLES['CONTENT_TABLES'];
        for (var i in tableNames)
            if (tableNames[i] == tableName || new TableUtils(tableName).getTables().indexOf(tableNames[i]) != -1)
                return tableNames[i];
        return '';
    },

    /**
     * This function will return true if given taxonomy topic exist and active.
     * @param tableName: sys_id of the taxonomy topic.
     */

    isActiveTopicPresent: function(topicSysId) {
        var topicGr = new GlideRecord("topic");
        topicGr.addActiveQuery();
        topicGr.addQuery('sys_id', topicSysId);
        topicGr.query();
        if (topicGr.next() && topicGr.canRead())
            return true;
        return false;
    },
    /**
     * This function will create topic object with reference
     */
    _createTopic: function(id, label, parentTopic) {
        return {
            id: id,
            label: label,
            parent: parentTopic,
            items: []
        };
    },

    /**
     * This function will return all topics for a Taxonomy
     * @param taxonomyId: sys_id of Taxonomy record
     */
    getTopicsHierarchy: function(taxonomyId) {
        var topics = [];
        var taxonomyGr = this.getTaxonomy(taxonomyId);
        // check if user has taxonomy access
        if (this.hasTaxonomyAccess(taxonomyGr)) {
            var grTopic = this.getTaxonomyTopics(taxonomyId, false);
            grTopic.query();
            var children = {};
            while (grTopic.next()) {
                if (!grTopic.canRead())
                    continue;

                // find the top level nodes and hash the children based on parent
                var parentTopic = grTopic.parent_topic ? grTopic.getValue("parent_topic") : null;

                if (!gs.nil(parentTopic)) {
                    parentTopicGR = grTopic.parent_topic.getRefRecord();
                    if (!parentTopicGR.canRead())
                        parentTopic = null;
                }

                var topicDisplayValue = GlideStringUtil.escapeHTML(grTopic.getDisplayValue());
                // Replace &amp; back with &
                topicDisplayValue = topicDisplayValue.replaceAll('&amp;', '&');

                var item = this._createTopic(grTopic.getUniqueValue(), topicDisplayValue, parentTopic),
                    p = item.parent,
                    target = !p ? topics : (children[p] || (children[p] = []));
                target.push(item);
            }
            // enumerate through to handle the case where there are multiple roots
            for (var i = 0, len = topics.length; i < len; ++i) {
                this._findChildren(children, topics[i], 1);
            }
        }
        return topics;
    },
    /**
     * This function will recursively build the tree for topics hierarchy
     * @param children: dictionary containing all the topics and child topics
     * @param parent: current topic for which its child topics needs to be found
     * @param level: current level of the topic
     */
    _findChildren: function(children, parent, level) {
        if (children[parent.id]) {
            level = ++level;
            parent.items = children[parent.id];
            for (var i = 0, len = parent.items.length; i < len && level < global.TaxonomyConstants.getTopicMaxLevel(); ++i) {
                this._findChildren(children, parent.items[i], level);
            }
        }
    },

    /**
     * This function will return true if given content exists.
     * @param tableName: name of the table.
     */
    isContentPresent: function(contentTable, contentSysId) {
        var gr = new GlideRecord(contentTable);
        gr.get(contentSysId);
        if (!gr.canRead()) {
            gs.error(gs.getMessage("{0} user doesnot have read access to {1} record", [gs.getUserName(), contentSysId]));
            return false;
        }

        if (gr.get(contentSysId) && gr.canRead())
            return true;
        return false;
    },

    /**
     * This function will return all topics
     * @param taxonomyGr : taxonomy glide Record
     * returns flag if user has accesss to taxonomy.
     */
    hasTaxonomyAccess: function(taxonomyGr) {
        return taxonomyGr.canRead();
    },


    /**
     * This function will return if loggedin user is a taxonomy manager.
     */
    isTaxonomyManager: function(taxonomy) {
        var critIds = [];
        var gr = new GlideRecord("taxonomy");
        if (taxonomy)
            gr.addQuery('sys_id', taxonomy);
        gr.addNotNullQuery('managers');
        gr.query();
        while (gr.next())
            critIds.push(gr.getValue('managers'));
        return sn_uc.UserCriteriaLoader.userMatches(gs.getUserID(), critIds);
    },


    /**
     * This function will return if loggedin user is a taxonomy contributor.
     * @param taxonomy : sysId of taxonomy 
     */
    isTaxonomyContributor: function(taxonomy) {
        var critIds = [];
        var gr = new GlideRecord("m2m_taxonomy_contributor");
        if (taxonomy)
            gr.addQuery('taxonomy', taxonomy);
        gr.query();
        while (gr.next())
            critIds.push(gr.getValue('contributors'));
        return sn_uc.UserCriteriaLoader.userMatches(gs.getUserID(), critIds);
    },

    /**
     * This function will return if loggedin user is a taxonomy manager or a taxonomy contributor.
     * @param taxonomy : sysId of taxonomy 
     */
    isTaxonomyManagerOrContributor: function(taxonomy) {
        return this.isTaxonomyManager(taxonomy) || this.isTaxonomyContributor(taxonomy);
    },

    /**
     * This function will update all the child topics for a given parent topic with appropriate topic hierarchy path.
     * @param parentId : sysId of parent Topic 
     * @param parentPath : Hierarchy Path of parent Topic
     */
    updateChildTopicsPath: function(parentId, parentPath) {
        var topics = this.prepareChildTopicGr(parentId, true);
        topics.query();
        var childTopicList = [];
        var PathSeperator =  " / ";
        while (topics.next()) {
            var path = parentPath + PathSeperator + topics.getValue('name');
            childTopicList.push({
                "sysId": topics.getUniqueValue(),
                "path": path
            });
            topics.topic_path = path;
            topics.update();
        }
        for (var i = 0; i < childTopicList.length; i++) {
            this.updateChildTopicsPath(childTopicList[i].sysId, childTopicList[i].path);
        }
    },

    /*
     * This function returns query for the connected content that can be featured on a topic level. While featuring a content, in the lookup list of content, the content is filtered through this query.
     * @param current: current Featured Content record 
     */
    queryForFeaturedContent: function(current) {
        var topicIds = [];
        topicIds.push(current.topic.sys_id);
        var i = 0;
        while (i < topicIds.length) {
            var topicGr = new GlideRecord("topic");
            topicGr.addQuery('parent_topic', topicIds[i]);
            topicGr.query();
            while (topicGr.next())
                topicIds.push(topicGr.getUniqueValue());
            i++;
        }

        var contentReferenceFieldMap = new ContentConfigUtil().getContentReferenceFieldMap(true);
        var excludeContent = [];
        var featGr = new GlideRecord("featured_content");
        featGr.addQuery('topic.sys_id', current.topic.sys_id);
        featGr.query();
        while (featGr.next()) {
            var m2mContentGr = featGr.connected_content.getRefRecord();
            var contentType = m2mContentGr.getValue('content_type');
            var contentRefField = contentReferenceFieldMap[contentType];
            excludeContent.push(m2mContentGr.getValue(contentRefField));
        }

        var query = "topic IN" + topicIds;
        if (excludeContent.length > 0) {
            for (var key in contentReferenceFieldMap) {
                if (contentReferenceFieldMap.hasOwnProperty(key)) {
                    var refField = contentReferenceFieldMap[key];
                    query = query + "^" + refField + " ISEMPTY ^OR " + refField + "NOT IN" + excludeContent;
                }
            }
        }

		// restrict featured content to only include Knowledge, Catalog Item, or Learning
		var validContentConfigIds = ["4c32a92153622010069addeeff7b12a3", "98f9a16553622010069addeeff7b1248", "d71566e97732111034a44d989e5a9956"];
		query = query + "^content_type IN" + validContentConfigIds;

        return query;
    },

    /**
     * This function will return child topics glide record for given topic.
     * @param parentTopicId : sysId of parent Topic 
     * @param includeInactive : boolean 
     */
    prepareChildTopicGr: function(parentTopicId, includeInactive) {
        var childTopicGR = new GlideRecord('topic');
        childTopicGR.addQuery('parent_topic', parentTopicId);
        if (!includeInactive)
            childTopicGR.addActiveQuery();
        return childTopicGR;
    },

    /**
     * This function will return if content in the record is accessibale or not.
     * @param contentRecord : connected content glide record. 
     */
    isContentRecordAccessible: function(contentRecord) {
        var extensions = new GlideScriptedExtensionPoint().getExtensions(TaxonomyConstants.CONTENT_SCRIPTED_EXTENSION_POINT);
        var tableName = contentRecord.content_type.content_table;
        var referenceColumm = contentRecord.content_type.content_reference_field;
        for (var i = 0; i < extensions.length; i++) {
            var extention = extensions[i];
            var extensionTableName = extention.getTableName();
            if (extensionTableName == tableName) {
                return extention.canView(contentRecord[referenceColumm], gs.getUserID());
            }
        }

    },

    /**
     * combined display filter string for all the content configs
     * @param contentConfigGr
     */
    getCombinedContentFilter: function(contentConfigGr) {
        var filterCondition = "";
        while (contentConfigGr.next()) {
            var contentFilter = contentConfigGr.getValue('content_filter');
            if (gs.nil(contentFilter)) continue;
            if (!gs.nil(filterCondition))
                filterCondition = filterCondition + "^NQ";
            filterCondition = filterCondition + contentFilter;
        }
        return filterCondition.toString().replaceAll("^EQ", "") + "^EQ";
    },
    /**
     * returns a map of content table name and its Taxonomy content processor
     */

    getTableToContentProcessorMap: function() {
        var tableToContentProcessorMap = [];
        var extensions = new GlideScriptedExtensionPoint().getExtensions(TaxonomyConstants.CONTENT_SCRIPTED_EXTENSION_POINT);
        for (var i = 0; i < extensions.length; i++) {
            var extension = extensions[i];
            var table = extension.getTableName();
            tableToContentProcessorMap[table] = extension;
        }
        return tableToContentProcessorMap;
    },
    /**
     * Deletes the outdated connected content. Outdated content is defined by the field "conditions" on taxonomy_content_configuration.
     */
    deleteOutdatedContent: function() {
        var query = new TaxonomyUtilAjax().getOutdatedContentEncodedQuery();
        var m2mGr = new GlideRecord('m2m_connected_content');
        m2mGr.addEncodedQuery(query);
        m2mGr.query();
        var count = m2mGr.getRowCount();
        m2mGr.deleteMultiple();

        if (count > 0) {
            this.handlePostDeletionActions(count);
        }
    },

    /**
     * Handles actions after deletion, including fetching taxonomy admins, constructing email parameters, 
     * and triggering an event for notification.
     */
    handlePostDeletionActions: function(count) {
        var adminSysIds = this.getTaxonomyAdmins();
        var jobSysId = '4387e6068b7b9210e5414e5bf12395d7';
        var jobLink = gs.getProperty('glide.servlet.uri') + 'sysauto_script.do?sys_id=' + jobSysId;

        var gdt = new GlideDateTime();
        var fullDateTime = gdt.getDisplayValueLang("long");

        var dateTimeParts = fullDateTime.split(' ');
        var executionDate = dateTimeParts[0] + ' ' + dateTimeParts[1] + ' ' + dateTimeParts[2];
        var timePart = dateTimeParts[3];

        // Convert time to 12-hour format
        var timeParts = timePart.split(':');
        var hours = parseInt(timeParts[0], 10);
        var minutes = timeParts[1];
        var ampm = hours >= 12 ? "p.m." : "a.m.";
        hours = hours % 12 || 12; // Convert 0 or 12 to 12, otherwise keep 1-11
        var executionTime = hours + ':' + minutes + ' ' + ampm;

        var emailParams = {
            jobLink: jobLink,
            executionDate: executionDate,
            executionTime: executionTime,
            totalDeleted: count
        };

        gs.eventQueue('taxonomy.deleted.outdated.content', null, adminSysIds.join(',').toString(), JSON.stringify(emailParams));
    },

    /**
     * Retrieves the list of taxonomy admin user sys_ids.
     */
    getTaxonomyAdmins: function() {
        var taxonomyAdmins = [];
        var gr = new GlideRecord('sys_user_has_role');
        gr.addQuery('role', '5dad18b3533200108271ddeeff7b120a');
        gr.query();
        while (gr.next()) {
            taxonomyAdmins.push(gr.getValue('user'));
        }
        return taxonomyAdmins;
    },
    type: 'TaxonomyUtilSNC'
};
