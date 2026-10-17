function deleteLiveFeedGroup() {
    var elem = gel("group_sys_id");
    var ga = new GlideAjax("LiveFeedUtilAjax");
    ga.addParam("sysparm_name", "deleteGroup");
    ga.addParam("sysparm_sys_id", elem.value);
    ga.getXMLAnswer(afterDelete.bind(this), null, elem);
    
}

function afterDelete(answer, elem) {
    GlideDialogWindow.prototype.locate(elem).destroy(); 
    g_feed.openCompanyFeed();
}
