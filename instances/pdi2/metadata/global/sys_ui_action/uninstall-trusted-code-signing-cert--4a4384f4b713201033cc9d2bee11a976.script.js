var statusStr = new SNC.CertificateValidator().uninstallCircleOfTrustCert(current);
var status = JSON.parse(statusStr);
if (status.success === 'false')
	gs.addErrorMessage(status.message);
else
	gs.addInfoMessage(status.message);

action.setRedirectURL(current);
