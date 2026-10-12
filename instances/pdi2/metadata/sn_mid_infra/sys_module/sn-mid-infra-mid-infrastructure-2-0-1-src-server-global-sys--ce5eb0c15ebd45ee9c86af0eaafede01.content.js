(function executeRule(current, previous /*null when async*/ ) {
    var roleName = current.operation() === 'delete'
        ? current.role.name + ''
        : previous.role.name + '';

    if (roleName !== 'mid_server')
        return;

    gs.addErrorMessage(gs.getMessage('The mid_server role cannot be removed or modified on the MID Default user.'));
    current.setAbortAction(true);

})(current, previous);
