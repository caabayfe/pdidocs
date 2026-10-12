
      (function executeRule(current, previous /*null when async*/) {
    var pathPattern = current.getValue("path_pattern");
    if(pathPattern) {
      var pathList = pathPattern.split("/").filter(Boolean);
      if(pathList[0] == "chat") {
        gs.addErrorMessage(gs.getMessage("Chat is a reserved route and hence shouldn't be used"));
        current.setAbortAction(true);
      }
    }
  })(current, previous);
