current.update();
action.setRedirectURL(current);
new TaskUtils().triggerRefreshImpactedServices(current);
