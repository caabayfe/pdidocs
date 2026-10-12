(function executeRule(current, previous /*null when async*/ ) {

    if (!current.isNewRecord())
      return;
    var problem = new Problem(current);
    current.setValue(problem.getStateFieldName(), problem.getInitialState());

})(current, previous);
