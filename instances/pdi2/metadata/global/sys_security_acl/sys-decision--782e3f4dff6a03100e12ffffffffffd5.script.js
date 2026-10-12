answer = false;
try {
    answer = new global.DecisionTableUtils().hasDelegatedDeveloperAccess(gs.getCurrentApplicationId());
} catch (ex) {
    gs.warn("Error occurred while checking delegated_developer access for sys_decision table: " + ex);
}
