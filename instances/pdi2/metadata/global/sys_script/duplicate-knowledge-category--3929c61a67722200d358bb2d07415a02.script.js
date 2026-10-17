(function executeRule(current, previous /*null when async*/ ) {
    if (gs.getSession().getLanguage() == 'en') {
        var knowledgeCategory = new GlideRecord('kb_category');
        knowledgeCategory.addQuery('label', current.label);
        knowledgeCategory.addQuery('parent_id', current.parent_id);
        knowledgeCategory.query();
        knowledgeCategory.next();
        if (knowledgeCategory.getRowCount() > 0 && knowledgeCategory.sys_id != current.sys_id) {
            gs.addErrorMessage(gs.getMessage('The Category, {0}, already exists at this level. Please enter a unique category.', [current.label]));
            current.setAbortAction(true);
        }
    } else {
        var knowledgeCategory = new GlideRecord('kb_category');
        var catArray = [];
        knowledgeCategory.addQuery('parent_id', current.parent_id);
        knowledgeCategory.query();
        while (knowledgeCategory.next()) {
            catArray.push(knowledgeCategory.getUniqueValue());
        }
        var knowledgeCategoryI18n = new GlideRecord("sys_translated_text");
        knowledgeCategoryI18n.addQuery('tablename', 'kb_category');
        knowledgeCategoryI18n.addQuery('documentkey', 'IN', catArray);
        knowledgeCategoryI18n.addQuery('documentkey', '!=', current.sys_id);
        knowledgeCategoryI18n.addQuery('fieldname', 'label');
        knowledgeCategoryI18n.addQuery('language', gs.getSession().getLanguage());
        knowledgeCategoryI18n.addQuery('value', current.label);
        knowledgeCategoryI18n.query();
        if (knowledgeCategoryI18n.getRowCount() > 0) {
            gs.addErrorMessage(gs.getMessage('The Category, {0}, already exists at this level. Please enter a unique category.', [current.label]));
            current.setAbortAction(true);
        }
    }
})(current, previous);
