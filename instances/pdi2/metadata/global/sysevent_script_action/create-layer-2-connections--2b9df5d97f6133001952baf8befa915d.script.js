var ciId = event.parm1;
if (ciId) {
    var npm = new SNC.NetworkPathManager();
    var dh = new SNC.DomainHelper();
    dh.adjustDomainByCiSysId(ciId);
    npm.createPhysicalConnections(ciId);
    dh.restoreCurrentSessionParams();
}
