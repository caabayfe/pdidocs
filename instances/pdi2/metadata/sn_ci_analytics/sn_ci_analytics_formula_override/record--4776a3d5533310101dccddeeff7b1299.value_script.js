(function calc(convGr) {
    var startTime = new GlideDateTime(convGr.sys_created_on);
    var conversationMessage = new GlideRecord('sys_cs_message');
    conversationMessage.addQuery('conversation', convGr.sys_id);
    conversationMessage.orderByDesc('sequence');
    conversationMessage.query();
    conversationMessage.next();
    var endTime = new GlideDateTime(conversationMessage.sys_created_on);
    return GlideDateTime.subtract(startTime, endTime).getNumericValue();
})(convGr);
