answer = false;
try {
    answer = new global.DecisionTableUtils().hasDelegatedDeveloperAccess(current.getValue('sys_scope'));
} catch (ex) {
    gs.warn("Error occurred while checking delegated_developer access for sys_decision table: " + ex);
}
