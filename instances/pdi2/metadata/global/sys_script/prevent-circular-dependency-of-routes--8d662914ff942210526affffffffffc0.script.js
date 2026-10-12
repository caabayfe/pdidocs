(function executeRule(current, previous /*null when async*/ ) {
      if (current.getValue('route') == current.getValue('dependent_route')) {
      gs.addErrorMessage(gs.getMessage('The dependent route cannot be the same as the selected route. Please choose a different value to prevent a circular dependency'));
      current.setAbortAction(true);
      }
      })(current, previous);
