(function executeRule(current, previous /*null when async*/ ) {
    if (!current || !current.getValue('tag_name') || current.isActionAborted())
        return;

    if (typeof sn_em_tbac == 'undefined' || !sn_em_tbac.hasOwnProperty('EvtMgmtTagBasedAlertClusteringAPIs'))
        return;

    var tbacApis = new sn_em_tbac.EvtMgmtTagBasedAlertClusteringAPIs();
    var sourceField = current.getValue('tag_name');
    tbacApis.createTagForAlertTags(sourceField);

})(current, previous);
