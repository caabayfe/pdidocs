var ContentPrimaryTopicUtilSNC = Class.create();
ContentPrimaryTopicUtilSNC.prototype = {
    initialize: function() {},

    /**
     * Updates the primary topic on the content record
     * @param currentConnectedContentGr - current GlideRecord
     * @param previousConnectedContentGr - previous GlideRecord
     */
    updateTopicOnContent: function(currentConnectedContentGr, previousConnectedContentGr) {
        var operation = currentConnectedContentGr.operation();
        if (operation === 'insert') {
            this._handleContentInsertion(currentConnectedContentGr);
        } else if (operation === 'update' && new global.TaxonomyUtil().hasFieldsChanged(currentConnectedContentGr)) {
            var referenceField = currentConnectedContentGr.content_type.content_reference_field;
            // if content or topic or content type gets modified handle it as delete and insert.
            this._handleContentDeletion(previousConnectedContentGr);
            this._handleContentInsertion(currentConnectedContentGr);
        } else if (operation === 'delete') {
            this._handleContentDeletion(currentConnectedContentGr);
        }
    },
	
	/**
     * Updates the primary topic on the content record when topic is inactivated
     * @param topicGr - current topic GlideRecord
     */
    updateContentPrimaryTopic: function(topicGr) {
        var m2mGlideRecord = new GlideRecord('m2m_connected_content');
        m2mGlideRecord.addQuery('topic', topicGr.getUniqueValue());
        m2mGlideRecord.query();
        while (m2mGlideRecord.next()) {
            this._handleContentDeletion(m2mGlideRecord);
        }
    },

    _handleContentInsertion: function(connectedContentGr) {
        var contentTable = connectedContentGr.content_type.content_table;
        var contentColumn = connectedContentGr.content_type.content_reference_field;
        var topic = connectedContentGr.topic;
        var contentSysId = connectedContentGr[contentColumn];
        var existingTopicOnContent = connectedContentGr[contentColumn].taxonomy_topic;
        var isCurrentTopicActive = connectedContentGr[contentColumn].taxonomy_topic.active;
        if (!existingTopicOnContent || (existingTopicOnContent && !isCurrentTopicActive)) {
            var contentGlideRecord = new GlideRecord(contentTable);
            contentGlideRecord.get(contentSysId);
            contentGlideRecord.taxonomy_topic = topic;
            contentGlideRecord.update();
        }
    },

    _handleContentDeletion: function(contentGr) {
        var contentTable = contentGr.content_type.content_table;
        var contentColumn = contentGr.content_type.content_reference_field;
        var topic = contentGr.topic;
        var contentSysId = contentGr[contentColumn];
        var contentRecord = new GlideRecord(contentTable);
        var contentExists = contentRecord.get(contentSysId);
        // check if the item exists in the content table, if not, then early return
        // as the taxonomy topic column update causes empty records in sc_cat_item
        if(!contentExists)
            return;
        var primaryTopicOnContent = contentRecord.taxonomy_topic;
        if (primaryTopicOnContent && this._hasValidPrimaryTopic(primaryTopicOnContent, contentSysId, contentColumn))
            return;
        var m2mGlideRecord = new GlideRecord('m2m_connected_content');
        m2mGlideRecord.addQuery(contentColumn, contentSysId);
        m2mGlideRecord.addQuery('topic.active', true);
        m2mGlideRecord.query();
        if (m2mGlideRecord.next()) {
            contentRecord.taxonomy_topic = m2mGlideRecord.topic;
        } else
            contentRecord.taxonomy_topic = "";
        contentRecord.update();
    },

    _hasValidPrimaryTopic: function(topic, contentSysId, contentReferenceColumn) {
        var gr = new GlideRecord('m2m_connected_content');
        gr.addQuery(contentReferenceColumn, contentSysId);
        gr.addQuery('topic', topic);
        gr.addQuery('topic.active', true);
        gr.setLimit(1);
        gr.query();
        return gr.hasNext();
    },

    type: 'ContentPrimaryTopicUtilSNC'
};
