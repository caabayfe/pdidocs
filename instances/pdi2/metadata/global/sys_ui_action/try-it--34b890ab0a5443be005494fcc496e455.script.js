// save any updates
if (current.changes())
  current.update();

var vu = new ViewUtil();
if (vu.isValid(current)) {
    // redirect to us
    gs.setRedirect(current.name + "_list.do");
} else {
    gs.addInfoMessage(gs.getMessage("The View did not validate correctly, please check the warning messages."));
    action.setRedirectURL(current);
}
