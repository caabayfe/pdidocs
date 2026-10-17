current.publish_state = "published";
var saveMe = current;
current.update();
gs.addInfoMessage(gs.getMessage('Publishing complete'));
action.setRedirectURL(saveMe);
