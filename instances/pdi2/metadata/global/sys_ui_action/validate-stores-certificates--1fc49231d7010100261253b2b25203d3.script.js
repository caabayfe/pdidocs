current.update();
try{
	var valid = new SNC.CertificateValidator().validate(current);
	if(!valid)
		gs.addErrorMessage(gs.getMessage('InValid ' + current.type));
	else
		gs.addInfoMessage(gs.getMessage('Valid ' + current.type));
}catch(e){
	gs.addErrorMessage(gs.getMessage(e));
}
action.setRedirectURL(current);
