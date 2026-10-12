new KBAQI().discardAqi(current);
gs.flushMessages();
gs.addInfoMessage(gs.getMessage('The AQI review you had previously initiated has been discarded.'));
action.setRedirectURL(current);
