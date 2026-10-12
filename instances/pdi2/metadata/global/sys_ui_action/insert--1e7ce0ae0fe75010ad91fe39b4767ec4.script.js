if (current.topic == 'Shazzam') {
	gs.addInfoMessage(gs.getMessage('Rerunning Shazzam Not Available'));
	action.setRedirectURL(current);
} else {
	doInsert();
}

function doInsert() {
	answer = insertRecord(current);
}
