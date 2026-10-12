(function executeRule(current, previous /*null when async*/ ) {

    // Add your code here
    var topicLangGr = new GlideRecord('sys_cs_topic_language');
    topicLangGr.addQuery('cs_topic_id', current.sys_id);
    topicLangGr.query();

    while (topicLangGr.next()) {
        NLUWBLUAUtils.recordOOBIntentUsage(topicLangGr);
    }
})(current, previous);
