function republish(input) {
    if (gs.nil(input) || gs.nil(input.articleId) || gs.nil(input.articleTable)) {
        return false;
    }

	// Validate that articleTable extends kb_knowledge to prevent table name enumeration
    var hierarchy = new GlideTableHierarchy(input.articleTable);
    var parentTables = hierarchy.getTables();
    if (!parentTables || parentTables.indexOf('kb_knowledge') === -1) {
        gs.error('Republish knowledge article: Invalid table parameter');
        return false;
    }

    const articleGr = new GlideRecord(input.articleTable);
    if (!articleGr.get(input.articleId)) {
        return false;
    }

    const newRecord = new global.KBKnowledge().republish(articleGr);
    if (newRecord) {
        return true;
    }

    return false;
}
