(function executeRule(current, previous /*null when async*/ ) {
    // check if one of the task is doc qna
    var conversationTaskGr = new GlideRecord("sys_cs_conversation_task");
    conversationTaskGr.addQuery("conversation", current.sys_id);
    conversationTaskGr.query();
    var isDocQnA = false;
    var conversationTaskIds = [];
    while (conversationTaskGr.next()) {
        conversationTaskIds.push(conversationTaskGr.getValue("sys_id"));
        if (conversationTaskGr.getValue("topic_type") === "5e8c03da73d42210cb0f32453f148b6a") { // Now Assist - Doc QnA topic
            isDocQnA = true;
        }
    }

    if (isDocQnA) {
		// delete any attachments if Doc QnA happened
        var attachmentGr = new GlideRecord("sys_attachment");
        attachmentGr.addQuery("table_name", "sys_cs_conversation_task");
        attachmentGr.addQuery("table_sys_id", "IN", conversationTaskIds);
        attachmentGr.query();
        while (attachmentGr.next()) {
            attachmentGr.deleteRecord();
        }
    }
})(current, previous);
