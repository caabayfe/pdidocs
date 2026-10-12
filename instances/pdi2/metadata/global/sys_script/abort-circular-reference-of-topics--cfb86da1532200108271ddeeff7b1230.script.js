(function executeRule(current, previous /*null when async*/ ) {
    if (current.sys_id == current.parent_topic) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage("A topic cannot have itself as parent topic"));
    } else {
        var gr = new GlideRecord('topic');
        gr.addQuery('taxonomy', current.taxonomy);
        gr.addQuery('sys_id', '!=', current.sys_id);
        gr.addActiveQuery();
        gr.query();
        var topicList = {};

        while (gr.next()) {
            var parentTopic = gr.getValue('parent_topic');
            if (!topicList.hasOwnProperty(parentTopic))
                topicList[parentTopic] = [];
            topicList[parentTopic].push(gr.getValue('sys_id'));
        }

        function isChildTopic(topicRef) {

            if (!topicList.hasOwnProperty(topicRef))
                return false;

            var childTopics = topicList[topicRef];
            for (var i = 0; i < childTopics.length; i++) {

                if (childTopics[i] == current.parent_topic || isChildTopic(childTopics[i])) {
                    return true;
                }

            }
            return false;
        }

        if (isChildTopic(current.sys_id)) {
            current.setAbortAction(true);
            gs.addErrorMessage(gs.getMessage("A topic cannot have a parent topic that exists in its child topic subtree"));
        }
    }
})(current, previous);
