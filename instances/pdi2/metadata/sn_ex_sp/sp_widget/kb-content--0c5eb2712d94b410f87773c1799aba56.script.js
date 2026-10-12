(function() {

    var kbSysId = options.content;
    var kbTable = options.content_table;
    var isFeatured = options.isFeatured || false;
    var viewType = options.listType || 'card';
    var title = options.widgetTitle;
    var widgetSysId = options.widgetSysId;
    var searchModeEnabled = options.searchModeEnabled || false;
    var topicId = options.topicForBreadcrumb;
    var index = options.index;

    data.kbCardData = {};
    data.kbCardData.iconClass = "fa fa-file-text-o";
    data.kbCardData.type = gs.getMessage("Article");
    data.kbCardData.isFeatured = isFeatured;
    data.kbCardData.viewType = viewType;
    data.kbCardData.widgetTitle = title;
    data.kbCardData.widgetSysId = widgetSysId;
    data.kbCardData.sysId = kbSysId;
    data.kbCardData.table = "kb_knowledge";
    data.kbCardData.index = index;

    if (searchModeEnabled) {
        data.kbCardData.title = options.title;
        data.kbCardData.description = options.text;
        data.kbCardData.image = options.image ? options.image + '?t=small' : '';
        data.kbCardData.url = '?id=kb_article&sysparm_article=' + options.number;
        if (topicId) {
            data.kbCardData.url += '&topic_id=' + topicId;
        }
        data.kbCardData.additionalInfo = options.sys_updated_on;
        data.widgetData = $sp.getWidget("content-card", data.kbCardData);
    } else {
        if (!kbSysId || !kbTable)
            return;

        var gr = new GlideRecord(kbTable);
        if (gr.get(kbSysId) & gr.canRead()) {
            data.kbCardData.title = gr.getDisplayValue('short_description');
            var description = new sn_ex_sp.KBCommonAPI().getKBContent(gr);
            data.kbCardData.description = !description ? '' : $sp.stripHTML(description);
            data.kbCardData.image = gr.getDisplayValue('image') ? gr.getDisplayValue('image') + '?t=small' : '';
            data.kbCardData.url = '?id=kb_article&sysparm_article=' + gr.getValue('number');
            if (topicId) {
                data.kbCardData.url += '&topic_id=' + topicId;
            }
            data.kbCardData.additionalInfo = gr.getDisplayValue('sys_updated_on');
            data.widgetData = $sp.getWidget("content-card", data.kbCardData);
        } else
            return;
    }
})();
