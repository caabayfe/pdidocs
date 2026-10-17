function script({api, event, helpers}) {  
    const preventDefaultPrimaryAction = api.context.props.preventDefaultPrimaryAction;
    if (!preventDefaultPrimaryAction) {
        helpers.modal.close();
    }
}
