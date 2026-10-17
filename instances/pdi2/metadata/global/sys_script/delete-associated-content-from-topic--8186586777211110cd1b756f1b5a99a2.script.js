(function executeRule(current, previous /*null when async*/ ) {
    gs.addInfoMessage(gs.getMessage('We are disassociating the content from your removed categories on this topic through an event'));
    var topicGr = new GlideRecord('topic');
    topicGr.get(current.topic);
    if (current.content_type == '4c32a92153622010069addeeff7b12a3') {
        gs.eventQueue("topic.content_association", topicGr, 'kb_category,disAssociation', current.kb_category);
    } else if (current.content_type == '98f9a16553622010069addeeff7b1248') {
        gs.eventQueue("topic.content_association", topicGr, 'sc_category,disAssociation', current.sc_category);
    }
})(current, previous);
