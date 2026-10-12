(function executeRule(current, previous /*null when async*/ ) {

    var children = new global.BusinessProcessUtils().getChildren(current);

    if (children.indexOf(current.parent+'') != -1) {
        gs.addErrorMessage(gs.getMessage('Selecting {0} as parent to {1} will create a conflicting parent-child hierarchy. Select a different parent', [current.parent.name, current.name]));
        current.setAbortAction(true);
    }

})(current, previous);
