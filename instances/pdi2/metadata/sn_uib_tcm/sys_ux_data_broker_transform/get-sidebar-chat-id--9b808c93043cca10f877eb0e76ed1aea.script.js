function transform(input) {
    var output = {};
    if (!input.ictSysId)
    	return output;
    var collabRecordGr = new GlideRecord('sys_cs_collab_record');
    collabRecordGr.addQuery('document', input.ictSysId);
    collabRecordGr.setLimit(1);
    collabRecordGr.query();
    var chatSysId;
    if (collabRecordGr.next())
        chatSysId = collabRecordGr.getValue('collab_chat');
    output.chatSysId = chatSysId;

    return output;
}
