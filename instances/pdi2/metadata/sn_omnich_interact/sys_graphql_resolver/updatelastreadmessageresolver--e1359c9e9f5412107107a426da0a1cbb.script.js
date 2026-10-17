(function process(env) {	

    //implement data resolver here
    var receiver = env.getArguments().receiver;
    var interactionId = env.getArguments().interactionId;
    var lastReadMessageId = env.getArguments().lastReadMessageId;
    var tabDetailGR = new GlideRecordSecure('sys_cs_message_tab_detail');
    tabDetailGR.addQuery('receiver', receiver);
    tabDetailGR.addQuery('interaction', interactionId);
    tabDetailGR.query();
    if (tabDetailGR.next()) {
        if (tabDetailGR.getValue('last_read_message_id') !== lastReadMessageId) {
            tabDetailGR.setValue('last_read_message_id', lastReadMessageId);
            tabDetailGR.update();
            return "last read message id updated";
        }
		return "last read message id already updated";
    }
    return "record with interaction and receiver not found";
})(env);
