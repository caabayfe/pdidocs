function updateTopicType(table) {
    var SETUP_TOPIC_CATEGORY = '5628e7f27373230025d032e954f6a7de';
    var SMALL_TALK_CATEGORY = '23242db273603300c1dc32e954f6a79f';
    var SETUP_TOPIC_TYPE = 'SETUP_TOPIC';
    var SMALL_TALK_TYPE = 'SMALL_TALK';
    var gr = new GlideRecord(table);
    gr.query();
    while (gr.next()) {
        if (gr.type == 'STANDARD' || gr.type == '' && !gr.library) {
            if (gr.category == SETUP_TOPIC_CATEGORY) {
                gr.type = SETUP_TOPIC_TYPE;
                gr.category = '';
            }
            if (gr.category == SMALL_TALK_CATEGORY) {
                gr.type = SMALL_TALK_TYPE;
                gr.flexible_conversation_switching = true;
                gr.category = '';
            }
            if (gr.design_category == SMALL_TALK_CATEGORY) {
                gr.type = SMALL_TALK_TYPE;
                gr.flexible_conversation_switching = true;
                gr.design_category = '';
                removeDesignCategoryFromDefinition(gr);
                updateLastPublishedOn(gr);
            }
            if (gr.design_category == SETUP_TOPIC_CATEGORY) {
                gr.type = SETUP_TOPIC_TYPE;
                gr.design_category = '';
                removeDesignCategoryFromDefinition(gr);
                updateLastPublishedOn(gr);
            }
            gr.update();
        }
        // remove "Setup Topic" category on topic blocks
        else if (gr.library) {
            if (gr.category == SETUP_TOPIC_CATEGORY) {
                gr.category = '';
            }
            if (gr.design_category == SETUP_TOPIC_CATEGORY) {
                gr.design_category = '';
                removeDesignCategoryFromDefinition(gr);
                updateLastPublishedOn(gr);
            }
            gr.update();
        }
    }
}

function removeDesignCategoryFromDefinition(gr) {
    var definition = JSON.parse(gr.definition);
    definition.design_category = '';
    gr.definition = JSON.stringify(definition);
}

function updateLastPublishedOn(gr) {
    if (isPublished(gr)) {
        var publishTime = new GlideDateTime(gs.nowDateTime());
        publishTime.addSeconds(60);
        // this fixes the issue where the topic appears as "Draft"
        gr.last_published_on = publishTime.getValue();
    }
}

function isPublished(cs_topic) {
    if (cs_topic.published) {
        var cb_topic = new GlideRecord('sys_cb_topic');
        cb_topic.addQuery('sys_id', cs_topic.cb_topic_id);
        cb_topic.query();

        if (cb_topic.next()) {
            return new GlideDateTime(cs_topic.last_published_on) >= new GlideDateTime(cb_topic.sys_updated_on);
        }
    }
    return false;
}

// migrate sys_cs_topic first so sys_updated_on is not updated before comparing it to last_published_on
updateTopicType('sys_cs_topic');
updateTopicType('sys_cb_topic');
