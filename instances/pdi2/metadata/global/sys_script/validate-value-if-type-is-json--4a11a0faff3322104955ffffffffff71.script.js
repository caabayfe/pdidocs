(function executeRule(current, previous /*null when async*/) {
  // "When to run" ensures this BR is only triggered for type "json"
  try {
    JSON.parse(current.value);
  } catch (e) {
    gs.addErrorMessage(gs.getMessage("Invalid JSON format in Value field."));
    current.setAbortAction(true);
  }
})(current, previous);
