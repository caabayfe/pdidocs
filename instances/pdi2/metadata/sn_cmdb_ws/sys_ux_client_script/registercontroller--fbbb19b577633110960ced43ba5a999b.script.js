function script({ api, event, helpers, imports }) {
    //registerController script in Map Search Filter Controller; fired when another controller is initialized and passes this event in
    const { cloneDeep } = imports['sn_cmdb_ws.unifiedMapUtils']();

    var secondaryControllers = cloneDeep(api.state.secondaryControllers);
    secondaryControllers.push(event.payload.controllerId);
    api.setState('secondaryControllers', secondaryControllers);
}
