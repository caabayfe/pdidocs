(function executeRule(current, previous /*null when async*/ ) {

    var READER_GROUP_TABLE = 'sys_suggestion_reader_group';
    var READER_GROUP_TABLE_CONTEXT_LINKING_FIELD = 'context_config_id';

    var readerGroupRecord = new GlideRecord(READER_GROUP_TABLE);
    readerGroupRecord.addQuery(READER_GROUP_TABLE_CONTEXT_LINKING_FIELD, current.sys_id);
    readerGroupRecord.query();
    readerGroupRecord.deleteMultiple();

})(current, previous);
