(function executeRule(current, previous /*null when async*/ ) {
    var contentConfigGr = new GlideRecord("sn_ex_sp_favorite_content_config");

    if (!contentConfigGr.isValid())
        return;

    contentConfigGr.addQuery("favorite_content_type", current.sys_overrides);
    contentConfigGr.query();
    while (contentConfigGr.next()) {
        contentConfigGr.favorite_content_type = current.getUniqueValue();
        contentConfigGr.insert();
    }
})(current, previous);
