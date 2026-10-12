var KBParentData = Class.create();
KBParentData.prototype = {
    initialize: function() {},
    getParentCategory: function(input, category) {
        var parentId, parentName, childRecord, parentRecord, parentKBRecord;
        var isKBRecord = false;
        var cat = (typeof category === 'string') ? [category] : category;
        childRecord = new GlideRecord('kb_category');
        childRecord.addQuery('sys_id', input);
        childRecord.addActiveQuery();
        childRecord.query();
        while (childRecord.next())
            parentId = childRecord.parent_id;
        parentRecord = new GlideRecord('kb_category');
        parentRecord.addQuery('sys_id', parentId);
        parentRecord.addActiveQuery();
        parentRecord.query();
        while (parentRecord.next())
            parentName = parentRecord.label;
        if (!parentName) {
            parentKBRecord = new GlideRecord('kb_knowledge_base');
            if (parentKBRecord.get(parentId)) {
                parentName = parentKBRecord.getDisplayValue('title');
                isKBRecord = true;
            }
        }
        if (parentName && parentId) {
            cat.unshift(parentName);
            return isKBRecord ? cat : this.getParentCategory(parentId, cat);
        }
        return cat;
    },

    type: 'KBParentData'
};
