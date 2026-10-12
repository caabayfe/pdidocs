cxs_App.getBusiness(current).removeFromWizard();
gs.addInfoMessage(gs.getMessage("The Contextual Search variable has been removed from the '{0}' Wizard", GlideStringUtil.escapeHTML(current.expert.name)));
action.setRedirectURL(current);
