var myCurrent = current;
var base = new SNC.CMDBUtil();
var ret = base.baselineProposedChangesVerifyChanges(myCurrent);

if (ret) {
	var msg = gs.getMessage("Proposed changes verification passed for change '{0}'.", myCurrent.getValue('number'));
	gs.addInfoMessage(msg);
}
else {
	var msg = gs.getMessage("Proposed changes verification failed for change '{0}'. Click 'Proposed Change Verification Log' related link for details.",myCurrent.getValue('number'));
	gs.addErrorMessage(msg);
}

action.setRedirectURL(myCurrent);
