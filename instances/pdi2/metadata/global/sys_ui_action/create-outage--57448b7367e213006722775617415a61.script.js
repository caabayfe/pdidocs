createOutageM2M();

function createOutageM2M() {
	current.update();
	var url = new CreateOutageUtil().getNewOutageLink(current);
	action.setRedirectURL(url);
	action.setReturnURL(current);
}
