cxs_App.getBusiness(current).removeFromRecordProducer();
gs.addInfoMessage(gs.getMessage("The Contextual Search variable has been removed from the '{0}' Record Producer", current.sc_cat_item.name));
action.setRedirectURL(current);
