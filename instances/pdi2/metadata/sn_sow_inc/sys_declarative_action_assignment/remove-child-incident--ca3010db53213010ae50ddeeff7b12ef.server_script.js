current.parent_incident = '';
if (current.update()) {
    gs.addInfoMessage(gs.getMessage('Child Incident {0} is removed successfully', [current.getDisplayValue()]));
} else {
    gs.addInfoMessage(gs.getMessage('Unable to remove Child Incident {0}', [current.getDisplayValue()]));
}
