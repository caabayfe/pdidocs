(function executeRule(current, previous /*null when async*/ ) {
    if (current && current.apply_to_child_topics) {
        var templateToBeApplied = current.template.toString();
        var templateToBeChecked = previous.template.toString();
        if (templateToBeApplied) {
            var queue = [];
            queue.push(current.getUniqueValue());
            var toBeUpdatedChildTopics = [];
            while (queue.length > 0) {
                var levelTopicSysIds = queue.join(',');
                queue = [];
                var gr = new GlideRecord('topic');
                gr.addQuery('parent_topic', 'IN', levelTopicSysIds);
                gr.query();
                while (gr.next()) {
                    var childTemplate = gr.template.toString();
                    var childSysId = gr.getUniqueValue();
                    toBeUpdatedChildTopics.push(childSysId);
                    queue.push(childSysId);
                }
            }
            if (toBeUpdatedChildTopics.length > 0) {
                var childrenGr = new GlideRecord('topic');
                var childrenSysIds = toBeUpdatedChildTopics.join(',');
                childrenGr.addQuery('sys_id', 'IN', childrenSysIds);
                childrenGr.query();
                while (childrenGr.next()) {
                    childrenGr.template = templateToBeApplied;
                    childrenGr.update();
                }
            }
            if (templateToBeApplied !== templateToBeChecked) {
                toBeUpdatedChildTopics.push(current.getUniqueValue());
            }
            if(toBeUpdatedChildTopics.length > 0) {
                var removeTemplateUtil = new RemoveTopicTemplateAssociationUtil();
                removeTemplateUtil.removeAssociation(toBeUpdatedChildTopics);
            }
        }
    }
})(current, previous);
