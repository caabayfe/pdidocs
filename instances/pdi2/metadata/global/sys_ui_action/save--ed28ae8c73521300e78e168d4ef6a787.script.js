action.setRedirectURL(current);
current.update();
if (! current.isActionAborted() && !current.isNavigateToCatalog)
    action.setRedirectURL(current);
