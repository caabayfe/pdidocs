(function(finding) {
    var gr_pub = new GlideRecord('sys_public');
    var sn_va_web_client_app_embed_sys_id = "04b1905473222300e985658b4cf6a7ef";
    if (gr_pub.get(sn_va_web_client_app_embed_sys_id)) {
        if (gr_pub.active == true) {
            finding.setCurrentSource(gr_pub);
            finding.increment();
        }
    }
})(finding);
