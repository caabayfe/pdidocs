function transform(input) {
    var relatedLists = [], extnLists = [];
    var lists = input.relatedLists || [];

    var extns = new GlideScriptedExtensionPoint().getExtensions("sn_sow_record.SOWRouteUtil");
    if (extns.length > 0) {
        for (var i = 0; i < extns.length; i++) {
            if (extns[i].handles(input.parentTable, input.parentSysId)) {
                extnLists = extns[i].getListsForRelatedListTab(input.relatedLists, input.parentTable, input.tabName);
                if (typeof extnLists != "undefined")
                    lists = extnLists;
                break;
            }
        }
    }

    var count = 0;
    for (var j = 0; j < lists.length; j++) {
        if (lists[j].visible) {
            relatedLists.push({
                id: count++,
                value: {
                    title: lists[j].displayName,
                    table: lists[j].table,
                    filter: lists[j].fixedQuery,
                    relatedListName: lists[j].value,
                    view: lists[j].view,
                    actionConfigId: lists[j].actionConfigId,
                    refreshRequested: lists[j].refreshRequested,
                    count: lists[j].count
                },
                label: lists[j].displayName + " (" + lists[j].count + ")"
            });
        }
    }

    return relatedLists;
}
