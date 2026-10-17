current.setValue('state', '');
current.setValue('active', true);
current.update();
action.setRedirectURL(current);
gs.addInfoMessage(gs.getMessage("This Shift is now live."));
