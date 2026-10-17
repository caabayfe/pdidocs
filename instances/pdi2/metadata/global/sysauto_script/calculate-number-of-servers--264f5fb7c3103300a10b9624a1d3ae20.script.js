calculate();

function calculate() {
    var lu = new SNC.LicensingUtil();
    if (lu.isNewLicenseModel()) {
        lu.disableCalculateNumberOfServersJob();
        return;
    }

    var dh = new SNC.DomainHelper();
    dh.saveNumberOfServersInAllDomains();
}
