if (current.topic == 'Shazzam') {
	gs.addInfoMessage(gs.getMessage('Rerunning Shazzam Not Available'));
	action.setRedirectURL(current);
} else {
	doInsertAndStay();
}

function doInsertAndStay() {
	var saveMe = current;
	insertRecord(saveMe);
	action.setRedirectURL(saveMe);
}
