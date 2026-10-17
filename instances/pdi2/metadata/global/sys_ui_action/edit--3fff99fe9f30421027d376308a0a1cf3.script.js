current.state = 'edit';
current.update();
gs.addInfoMessage(gs.getMessage('This template might be in use and editing the template might affect the flows using it.'));
action.setRedirectURL(current);
