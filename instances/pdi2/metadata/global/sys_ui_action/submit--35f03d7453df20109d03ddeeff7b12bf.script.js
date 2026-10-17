current.update();
var rotaGr = current.rota.getRefRecord();
var ocRota = new OnCallRotation();
if (ocRota.isShiftOnOldEngine(rotaGr)) {
	gs.addInfoMessage('Member scheduling is in process');
}
action.setRedirectURL(rotaGr);
