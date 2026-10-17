(function executeRule(current, previous /*null when async*/ ) {
    if (previous.isValidRecord() && previous.getValue('active') == true && previous.getValue('default') == true && previous.type == current.type)
        return;

    var filterGR = new GlideRecord("sys_email_system_filter");
    filterGR.addQuery("type", current.type);
    filterGR.addQuery("default", "true");
    filterGR.addQuery("sys_id", "!=", current.getUniqueValue());
    filterGR.addActiveQuery();
    filterGR.query();
    if (filterGR.next()) {
        filterGR.setValue("default", "false");
        filterGR.update();
        var message = "";

        if (GlideStringUtil.notNil(filterGR.name) && GlideStringUtil.notNil(current.name))
            message = gs.getMessage("Default {0} filter changed from {1} to {2}", [filterGR.type, GlideStringUtil.escapeHTML(filterGR.name), GlideStringUtil.escapeHTML(current.name)]);
        else if (GlideStringUtil.notNil(filterGR.name) && GlideStringUtil.nil(current.name))
            message = gs.getMessage("Default {0} filter changed from {1}", [filterGR.type, GlideStringUtil.escapeHTML(filterGR.name)]);
        else if (GlideStringUtil.nil(filterGR.name) && GlideStringUtil.notNil(current.name))
            message = gs.getMessage("Default {0} filter changed to {1}", [filterGR.type, GlideStringUtil.escapeHTML(current.name)]);
        else
            message = gs.getMessage("Default {0} filter changed", filterGR.type);

        gs.addInfoMessage(message);
    }
})(current, previous);
