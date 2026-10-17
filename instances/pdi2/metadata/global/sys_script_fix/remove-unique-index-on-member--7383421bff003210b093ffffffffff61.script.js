(function() {
    var tableName = 'sys_cs_conversation_member';
    var isUniqueIndex = true;
    var columnsInIndex = ['conversation', 'member'];
    var util = new global.GlideIndexUtils();
    util.dropByExactElementSequence(tableName, isUniqueIndex, columnsInIndex);
})();
