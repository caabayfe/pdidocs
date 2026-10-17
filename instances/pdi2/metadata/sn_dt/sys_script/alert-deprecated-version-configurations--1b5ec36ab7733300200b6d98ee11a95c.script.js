(function executeRule(current, previous /*null when async*/ ) {

    if (current.getValue('version') === 'v1')
        gs.addErrorMessage(gs.getMessage("Version V1 is deprecated. Refer to the {0}documentation{1} to migrate to version V3", ['<a href="/api/now/v1/context_doc_url/Dynamic_Translation_Upgrade_Version" target="_blank">', "</a>"]));
    else if (current.getValue('version') === 'v2')
        gs.addErrorMessage(gs.getMessage("Version V2 is deprecated. Refer to the {0}documentation{1} to migrate to version V3", ['<a href="/api/now/v1/context_doc_url/Dynamic_Translation_Upgrade_Version" target="_blank">', "</a>"]));
    else if (current.getValue('version') === 'v3')
        gs.addErrorMessage(gs.getMessage("Version V3 is deprecated. Refer to the {0}documentation{1} to migrate to version V4", ['<a href="/api/now/v1/context_doc_url/Dynamic_Translation_Upgrade_Version" target="_blank">', "</a>"]));

})(current, previous);
