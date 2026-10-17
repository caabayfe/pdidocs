current.update();
var info = new SNC.PAExternalCollectionCheck();
var message = info.collectIndicator(current.sys_id).replace("\n", "<br\>");

if (message.startsWith("Error") || message.startsWith("Warning"))
	gs.addErrorMessage(message);
else
	gs.addInfoMessage(message);

action.setRedirectURL(current);
