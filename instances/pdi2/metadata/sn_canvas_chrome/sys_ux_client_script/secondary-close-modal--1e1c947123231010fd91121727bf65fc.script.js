function script({api, event, helpers}) {  
    const preventDefaultSecondaryAction = api.context.props.preventDefaultSecondaryAction;
    if (!preventDefaultSecondaryAction) {
        helpers.modal.close();
    }
}
