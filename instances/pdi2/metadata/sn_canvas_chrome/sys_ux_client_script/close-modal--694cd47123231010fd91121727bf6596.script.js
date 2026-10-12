function script({api, event, helpers}) {  
    const preventDefaultAction = api.context.props.preventDefaultAction;
    if (!preventDefaultAction) {
        helpers.modal.close();
    }
}
