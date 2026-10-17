current.update();
var verifier = new SNC.CertificateValidator();
var isTrusted = verifier.verifyCertTrusted(current);
if (isTrusted == true)
	gs.addInfoMessage(gs.getMessage("This certificate is trusted by this instance."));
else
	gs.addErrorMessage(gs.getMessage("This certificate is not trusted by this instance."));
action.setRedirectURL(current);
