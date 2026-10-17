if (angular.isDefined(item.cid)){
	var url = '$ngbsm.do?id=' + item.cid;
	var newWin = window.open(url, '_blank');
	if(!newWin || newWin.closed || angular.isUndefined(newWin.closed)) 
		sncEventScope.broadcast(sncGlobals.EVT_REPORT_INFO, i18n.getMessage("Turn off your pop-up blocker!"));
}
