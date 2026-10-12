(function executeRule(current, previous /*null when async*/ ) {
    var sc;
    if (gs.isCurrentApplicationInGlobalScope())
        sc = gs.getCurrentApplicationScope();
    else
        sc = gs.getCurrentApplicationId();
    current.application = sc;

})(current, previous);
