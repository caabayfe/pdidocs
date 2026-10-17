function script({api, event}) { 
    const {
        action
    } = event.payload;
    if (action && action.toLowerCase() === 'save_a_copy') {

        api.emit('LIST_CTRL#OPEN_MODAL', {
            route: 'save-a-copy',
            bare: true,
            size: 'sm'
        });
    } else if (action && action.toLowerCase() === 'ai-list-header-notification') {
     api.data.sn_record_list_data_broker.resetHeaderAlertConfig();
    
     }

 }
