current.timeline = new ConsolidatedIncidentTimeline().getTimeline(current);
current.update();
gs.addInfoMessage(gs.getMessage('Timeline has been regenerated'));
action.setRedirectURL(current);
