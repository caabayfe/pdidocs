(function process( /*ResolverEnvironment*/ env) {

    // implement data resolver here
    let conversationAutoPilotState = [];
    const conversationSysIds = env.getArguments()["conversationIds"];
    for (var i = 0; i < conversationSysIds.length; i++) {
        let conversationSysId = conversationSysIds[i];
        let autopilotState = sn_cs.VASystemObject.isInAutoPilotMode(conversationSysId);
        let item = {
            sysId: conversationSysId,
            inAutoPilotMode: autopilotState
        };
        conversationAutoPilotState.push(item);
    }
    return conversationAutoPilotState;

})(env);
