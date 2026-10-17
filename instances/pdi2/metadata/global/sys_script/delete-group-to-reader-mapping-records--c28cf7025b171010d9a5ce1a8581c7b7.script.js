(function executeRule(current, previous /*null when async*/ ) {
    var READER_GROUP_TO_READER_M2M_TABLE =
        'm2m_sys_suggestion_reader_sys_suggestion_reader_group';
    var READER_GROUP_M2M_GROUP_LINKING_FIELD = 'sys_suggestion_reader_group_id';

    var m2mRecord = new GlideRecord(READER_GROUP_TO_READER_M2M_TABLE);
    m2mRecord.addQuery(READER_GROUP_M2M_GROUP_LINKING_FIELD, current.sys_id);
    m2mRecord.query();
    m2mRecord.deleteMultiple();

})(current, previous);
