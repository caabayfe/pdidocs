function onClick(g_form) {
    var parentSysId = g_form.getUniqueValue();
    var parentShortDescription = g_form.getValue('short_description');
    var query = "parent_incident=" + parentSysId + "^short_description=" + parentShortDescription;
    g_aw.openRecord("incident", "-1", {
        query: query
    });
}
