function getPublishedTopics() {
    var gr = new GlideRecord('sys_cs_topic');
    gr.addQuery('name', 'NOT LIKE', '_PRVW__%');
    gr.query();
    var topics = {};
    while (gr.next()) {
        topics[gr.getValue('sys_id')] = {
            cb_topic_id: gr.getValue('cb_topic_id'),
            cs_topic_id: gr.getValue('sys_id'),
            graph: gr.cb_topic_id.graph.toString()
        };
    }
    return topics;
}

function getTopicsWithDesignGraph(publishedTopics) {
    var gr = new GlideRecord('sys_cb_design_topic');
    gr.addQuery('compiled_topic', 'IN', Object.keys(publishedTopics));
    gr.addNotNullQuery('graph');
    gr.query();
    var topics = {};
    while (gr.next()) {
        topics[gr.getValue('compiled_topic')] = {
            graph: gr.graph.toString(),
            cs_topic_id: gr.getValue('compiled_topic')
        };
    }
    return topics;
}

function getTopicsWithoutDesignGraph(publishedTopics, topicsWithDesignGraph) {
    var topics = [];
    var key;
    var topic;
    for (key in publishedTopics) {
        topic = publishedTopics[key];
        if (topicsWithDesignGraph.indexOf(key) === -1) {
            topics.push(topic);
        }
    }
    return topics;
}

var util = new TopicControlUsageUtil();
var publishedTopics = getPublishedTopics();
var topicsWithDesignGraph = getTopicsWithDesignGraph(publishedTopics);
var topicsWithoutDesignGraph = getTopicsWithoutDesignGraph(publishedTopics, Object.keys(topicsWithDesignGraph));

// process topics with graphs in sys_cb_design_topic
Object.keys(topicsWithDesignGraph).forEach(function(topicId) {
    var topic = topicsWithDesignGraph[topicId];
    util.processGraph(topic.graph, topic.cs_topic_id, true /*overwrite*/);
});

// process topics with graphs in sys_cb_topic
topicsWithoutDesignGraph.forEach(function(topic) {
    util.processGraph(topic.graph, topic.cs_topic_id, true /*overwrite*/);
});
