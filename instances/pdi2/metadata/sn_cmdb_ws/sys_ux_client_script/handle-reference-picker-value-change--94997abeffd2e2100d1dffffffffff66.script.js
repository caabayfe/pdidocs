function script({api, event, helpers, imports}) {
    const displayValue = event.payload.displayValue;
    const value = event.payload.value;
    let newPayload = {
        "value" : value,
        "displayValue" : displayValue
    };
    let groupChoiceChanged = value != api.state.runAsUserGroupPropValue.value;

    if(groupChoiceChanged){
        api.setState('runAsUserGroupPropValue', newPayload);
        api.data.dataManagerGetJobRunners.refresh();
        const {output} = api.data.dataManagerGetJobRunners;

        api.setState('runAsUsersList', output.userList);
        api.setState('runAsUserDefaultPropValue', '');
    }
}
