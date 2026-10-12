var RemoveTopicTemplateAssociationUtilSNC = Class.create();
RemoveTopicTemplateAssociationUtilSNC.prototype = {
    initialize: function() {
        this.tables = ['sn_ca_campaign_item', 'sn_cd_content_visibility'];
        this.rca = '9d135fbc771001108b71a0e89e5a99da, f189f8c077d001108b71a0e89e5a99c0';
    },

    removeAssociation: function(topics) {
        for (var i = 0; i < this.tables.length; ++i) {
            var table = this.tables[i];
            if ((i < 1) || this._checkAccess()) {
                this._removeAssociation(topics, table);
            }
        }
    },

    _removeAssociation: function(topics, tableName) {
        if (tableName && gs.tableExists(tableName)) {
            var encodedQuery = this._buildEncodedQuery(topics);
            if (encodedQuery) {
                var gr = new GlideRecord(tableName);
                gr.addEncodedQuery(encodedQuery);
                gr.query();
                while (gr.next()) {
                    var topicAssociation = gr.topic;
                    var topicList = topicAssociation.split(',');
                    var updatedList = this._removeAssociatedTopic(topicList, topics);
                    gr.topic = updatedList.join(",");
                    gr.update();
                }
            }
        }
    },

    _checkAccess: function() {
        var gr = new GlideRecord('sys_restricted_caller_access');
        gr.addQuery('sys_id', 'IN', this.rca);
        gr.query();
        var count = 0;
        var isAccessible = true;
        while (gr.next()) {
            var status = gr.status.toString();
            if (isAccessible && status !== '2') {
                isAccessible = false;
            }
            count++;
        }
        return isAccessible && (count === 2);
    },

    _removeAssociatedTopic: function(associatedList, topics) {
        var result = [];
        result = associatedList.filter(function(associatedTopic) {
            return topics.indexOf(associatedTopic) === -1;
        });
        return result;
    },

    _buildEncodedQuery: function(topics) {
        var result = '';
        var OR_PREFIX = '^OR';
        var LIKE_PREFIX = 'topicLIKE';
        if (topics.length > 0) {
            result = topics.map(function(topic) {
                return LIKE_PREFIX + topic;
            }).join(OR_PREFIX);
        }
        return result;
    },

    type: 'RemoveTopicTemplateAssociationUtilSNC'
};
