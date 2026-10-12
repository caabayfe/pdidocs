function ok() {
    GlideModal.get().destroy();
    viewProgress();
}

function viewProgress() {
    showLoadingIcon();
    var g_list = GlideList2.get(NOW.task_add_change_req.TABLE_NAME);
    var finalQuery = g_list.getFixedQuery();
    if (g_list.getQuery()) {
        finalQuery += '^' + g_list.getQuery();
    }
    var gajax = populateCommonParams();
    gajax.addParam("sysparm_query", finalQuery);
    gajax.addParam("sysparm_type", 'add_all');
    gajax.getXMLAnswer(closeWindow);
}

function cancel() {
    GlideModal.get().destroy();
}
