(function executeRule(current, previous) {
  try {
    new SNCRestrictBasicAuthApplyFix().applyDecision(current.getValue('user'), current.getValue('decision'));
    current.setWorkflow(false);
    if (current.isValidField('action_taken')) current.setValue('action_taken', true);
    current.update();
  } catch (e) {
    gs.error('SNCRestrictBasicAuthApplyFix: server_execute_decision failed for record ' + current.getUniqueValue() + ': ' + e.message);
    gs.addErrorMessage(gs.getMessage('An error occurred while executing the decision. Please contact your system administrator.'));
  }
  action.setRedirectURL(current);
})(current, previous);
