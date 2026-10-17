current.update();
SncTriggerSynchronizer.executeNow(current);
gs.addInfoMessage(gs.getMessage('Data Collection Job {0} has been started', GlideStringUtil.escapeHTML(current.name)));
action.setRedirectURL(current);
