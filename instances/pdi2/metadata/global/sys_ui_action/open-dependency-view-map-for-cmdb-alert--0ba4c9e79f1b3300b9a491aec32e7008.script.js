function openDependencyView() {
    var ciSysId = g_form.getValue('cmdb_ci');
	var alertID = g_form.getUniqueValue();
	var metadata = {"alertID":alertID};
	var metadataEncoded = encodeURIComponent(JSON.stringify(metadata));
		
	var url = '$ngbsm.do?id=' + ciSysId + '&mapScriptID=9e24bddf9f973300b9a491aec32e7039&level=20&mapScriptParams=' + metadataEncoded;
        var newWin = window.open(url, '_blank');
        if (!newWin || newWin.closed || (typeof newWin.closed === "undefined"))
            CustomEvent.fireAll("snc.reportInfo", getMessage("Turn off your pop-up blocker!"));

}
