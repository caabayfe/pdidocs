checkReadOnly();

function checkReadOnly() {
    var mcp = SncMIDConfigParameter;
    var param = mcp.byName(current.param_name);
    if (param && !param.isReadOnly())
        return;

    current.setAbortAction(true);
    gs.addErrorMessage(gs.getMessage('You are attempting to add or modify a read-only parameter -- not allowed'));
    gs.log('Check for read only on ecc_agent_config found read only change attempted');
}
   
