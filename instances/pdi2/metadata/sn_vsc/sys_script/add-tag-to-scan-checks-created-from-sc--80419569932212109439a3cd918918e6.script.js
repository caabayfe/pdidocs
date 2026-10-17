(function executeRule(current, previous /*null when async*/ ) {
    var referring_url = gs.action.getGlideURI().get('sysparm_referring_url');
    //add tag 'Security Center Check' for checks added from security center checks list
    if (referring_url && referring_url == "now/security-center-configuration/security_scan_checks") {
        var gr = new GlideRecord("label_entry");
        var fieldValues = 'title=Security Center Check - ' + current.name 
		+ '^table=scan_check^table_key=' + current.sys_id
        + '^label=2601dd29932212109439a3cd91891840^read=yes^url=scan_check.do?sys_id=' + current.sys_id 
        + '&sysparm_view=';
        gr.initialize();
        gr.applyEncodedQuery(fieldValues);
        gr.insert();
    }
})(current, previous);
