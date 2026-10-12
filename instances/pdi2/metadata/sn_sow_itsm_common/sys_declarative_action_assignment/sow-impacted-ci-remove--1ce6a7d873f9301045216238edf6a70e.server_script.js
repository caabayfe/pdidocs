if (current.deleteRecord()) {
    gs.addInfoMessage(gs.getMessage("Impacted Service/CI {0} is removed successfully", [current.cmdb_ci_service.name]));
} else {
    gs.addInfoMessage(gs.getMessage("Unable to remove Impacted Service/CI {0}", [current.cmdb_ci_service.name]));
}
