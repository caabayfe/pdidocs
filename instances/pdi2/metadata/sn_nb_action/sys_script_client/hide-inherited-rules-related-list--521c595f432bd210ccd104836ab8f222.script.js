function onLoad() {
    var mapParentContextRefererence = g_form.getValue("map_parent_context");
    if (mapParentContextRefererence == "") {
        g_form.hideRelatedList("REL:b8b420c3436b9a10ccd104836ab8f2ac");
    }
}
