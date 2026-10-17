if (gs.getCurrentApplicationId() != current.sys_scope) {
    gs.addErrorMessage(gs.getMessage("Cross Scope Alert! Failed to migrate experience {0} to ACE v2", [current.name]));
} else {
    gs.addInfoMessage(gs.getMessage('Experience {0} migration to ACE v2 initiated', [current.name]));
    var result = new ACEAppBuilderUtilV2().migrateToAceRenderer(current.sys_id);
    if (result) {
        gs.addInfoMessage(result);
    } else {
        gs.addErrorMessage(gs.getMessage("Failed to migrate {0} to ACE v2", [current.name]));

    }
}
