answer = getNodesCount();

function getNodesCount() {
    var EMCount = new EvtMgmtLicenseCount();
    var cnt = EMCount.getEMCount();
    return cnt;
}
