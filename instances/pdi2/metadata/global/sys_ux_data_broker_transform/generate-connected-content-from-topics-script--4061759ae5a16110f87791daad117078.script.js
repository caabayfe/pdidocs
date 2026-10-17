function transform(input) {
    function extractTopicFromTopicTree(topic_tree) {
        if (!topic_tree.length)
            return null;

        var length = topic_tree.length;
        var topic = topic_tree[length - 1];

        return topic.id;
    }

    function extractTopicFromNetSelection(taxonomy_selections) {
        var topics = [];
        for (var i = 0; i < taxonomy_selections.length; i++) {
            var topic_id = extractTopicFromTopicTree(taxonomy_selections[i]);
            if (topic_id)
                topics.push(topic_id);
        }
        return topics;
    }

    function _flatten(array) {
        var _flattened_array = [];
        for (var _i = 0; _i < array.length; _i++) {
            for (var _j = 0; _j < array[_i].length; _j++) {
                _flattened_array.push(array[_i][_j]);
            }
        }
        return _flattened_array;
    }

    function _createRecord(topic_id, content_id, content_type) {
        var CONTENT_TYPE_CATALOG = "98f9a16553622010069addeeff7b1248";
        var CONTENT_TYPE_KNOWLEDGE = "4c32a92153622010069addeeff7b12a3";

        var record = new GlideRecordSecure('m2m_connected_content');
        record.initialize();

        record.content_type = content_type;

        if (content_type == CONTENT_TYPE_KNOWLEDGE)
            record.knowledge = content_id;
        else if (content_type == CONTENT_TYPE_CATALOG)
            record.catalog_item = content_id;

        record.topic = topic_id;
        record.insert();
    }

    function calculateDelta(new_topics, previous_topics) {
        if (!new_topics || !previous_topics)
            return {
                "elements_to_disconnect": !previous_topics ? [] : previous_topics,
                "elements_to_connect": !new_topics ? [] : new_topics
            };

        var elements_to_connect = JSON.parse(JSON.stringify(new_topics));
        var elements_to_disconnect = JSON.parse(JSON.stringify(previous_topics));

        for (var i = 0; i < elements_to_disconnect.length; i++) {
            var index = elements_to_connect.indexOf(elements_to_disconnect[i]);
            if (index !== -1) {
                elements_to_disconnect.splice(i, 1);
                elements_to_connect.splice(index, 1);
                i--;
            }
        }

        return {
            "elements_to_disconnect": elements_to_disconnect,
            "elements_to_connect": elements_to_connect
        };
    }

    function deleteObsoleteConnectecContents(content_type_name, catalog_item, previous_topics) {
        if (previous_topics.length === 0)
            return;
        var obsolete_records = new GlideRecordSecure('m2m_connected_content');
        obsolete_records.addQuery(content_type_name, catalog_item);
        obsolete_records.addEncodedQuery("topicIN" + previous_topics);

        obsolete_records.deleteMultiple();
    }

    function isEqual(arr_1, arr_2) {
        if (arr_1.toString().split("").sort().join("") === arr_2.toString().split("").sort().join(""))
            return true;
        return false;
    }

    function createConnectedContent(net_selection, content_id, existing_topics) {
        if (!content_id)
            return;

        var current_topics = [];
        var CONTENT_TYPE_CATALOG = "98f9a16553622010069addeeff7b1248";
        var CONTENT_TYPE_KNOWLEDGE = "4c32a92153622010069addeeff7b12a3";

        for (var taxonomy_selection in net_selection) {
            if (net_selection.hasOwnProperty(taxonomy_selection)) {
                current_topics.push(extractTopicFromNetSelection(net_selection[taxonomy_selection]));
            }
        }

        current_topics = _flatten(JSON.parse(JSON.stringify(current_topics)));

        if (isEqual(current_topics, existing_topics))
            return;

        var delta = calculateDelta(current_topics, existing_topics);
        var disconnect_list = delta.elements_to_disconnect;
        var connect_list = delta.elements_to_connect;

        deleteObsoleteConnectecContents('catalog_item', content_id, disconnect_list);

        for (var _i = 0; _i < connect_list.length; _i++) {
            _createRecord(connect_list[_i], content_id, CONTENT_TYPE_CATALOG);
        }
    }

    var catalog_item = JSON.parse(JSON.stringify(input.catalogSysId));
    var netSelection = JSON.parse(JSON.stringify(input.netSelection));
    var existingConnectedTopics = JSON.parse(JSON.stringify(input.existingTopics));

    createConnectedContent(netSelection, catalog_item, existingConnectedTopics);
}
