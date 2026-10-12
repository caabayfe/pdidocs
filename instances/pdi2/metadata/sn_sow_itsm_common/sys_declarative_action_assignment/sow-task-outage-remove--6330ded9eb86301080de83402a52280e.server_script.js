if (current.deleteRecord()) {
    gs.addInfoMessage(gs.getMessage("Outage {0} is removed successfully", [current.outage.number]));
} else {
    gs.addInfoMessage(gs.getMessage("Unable to remove Outage {0}", [current.outage.number]));
}
