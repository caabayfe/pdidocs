(function executeRule(current, previous /*null when async*/) {

    var recordScope = current.source + ''; // make sure that it is a javascript string
    var currentScope = gs.getCurrentApplicationScope();

    // IHub sets event source sysid as recordScope. We cannot determine the actual scope, hence allow deletion.
    if(isValidEventSource(recordScope)) {
        return;
    }

    // Prevent cross-scope deletion unless global
    if (currentScope !== "global" && recordScope !== currentScope) {
        gs.addErrorMessage(gs.getMessage("You cannot delete this record because it was not created in the current application scope."));
        current.setAbortAction(true);
    }

    function isValidEventSource(eventSourceId) {
      var EXTERNAL_EVENT_SOURCE_TABLE = "sys_ih_external_event_source";
      gr = new GlideRecord(EXTERNAL_EVENT_SOURCE_TABLE);

      if (!gr.isValid())
        return false;
      return gr.get(eventSourceId);
    }

})(current, previous);
