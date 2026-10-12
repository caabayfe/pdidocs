(function executeRule(current, previous /*null when async*/ ) {
    if (isQueryAclDisabled()) {
        return;
    }
    if (!GlideStringUtil.nil(current.name) && current.name.startsWith('disable_field_acl_enforcement.')) {
        if (!GlideStringUtil.nil(current.value)) {
            gs.addInfoMessage(gs.getMessage('Please consider implementing ACL Query Rules for field ACL enforcement as a preferred alternative to modifying properties. Click <a href="/api/now/v1/context_doc_url/query-acl-rule" target="_blank"> here</a> to know more.'));
        }
    }

    function isQueryAclDisabled() {
        var gr = new GlideRecord("sys_properties");
        if (!gr.get("name", "glide.query.queryacl_enabled")) {
            // if the default glide.query.queryacl_enabled property value in Java changes, this value will need to update to the inverse of that
            return false;
        }
        return gr.getValue("value") === 'false';
    }
})(current, previous);
