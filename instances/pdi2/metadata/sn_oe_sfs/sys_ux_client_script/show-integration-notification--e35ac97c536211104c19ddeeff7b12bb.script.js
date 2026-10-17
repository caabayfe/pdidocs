/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if(api.context.props.channel == 'teams') {
        if(api.context.props.name != '' && api.context.props.type == 'update'){
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    id: 'alert5',
                    status: 'positive',
                    icon: 'check-circle-outline',
                    content: `Success: Integration with Microsoft Teams \'${api.context.props.name}\' bot is updated successfully.`,
                    action: {
                        type: 'dismiss'
                    }
                }]
            });
        }else {
            api.emit("NOW_UXF_PAGE#REMOVE_NOTIFICATIONS", {
                items: [{
                    id: 'alert5'
                }]
            });
        }
    }

      if(api.context.props.channel == 'messenger') {
        if(api.context.props.name != '' && api.context.props.type == 'install'){
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    id: 'alert5',
                    status: 'positive',
                    icon: 'check-circle-outline',
                    content: `Success: Integration with Messenger \'${api.context.props.name}\' bot is completed successfully.`,
                    action: {
                        type: 'dismiss'
                    }
                }]
            });
        } else if(api.context.props.name != '' && api.context.props.type == 'update'){
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    id: 'alert5',
                    status: 'positive',
                    icon: 'check-circle-outline',
                    content: `Success: Integration with Messenger \'${api.context.props.name}\' bot is updated successfully.`,
                    action: {
                        type: 'dismiss'
                    }
                }]
            });
        } else {
            api.emit("NOW_UXF_PAGE#REMOVE_NOTIFICATIONS", {
                items: [{
                    id: 'alert5'
                }]
            });
        }
    }

       if(api.context.props.channel == 'line') {
        if(api.context.props.name != '' && api.context.props.type == 'install'){
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    id: 'alert5',
                    status: 'positive',
                    icon: 'check-circle-outline',
                    content: `Success: Integration with Line \'${api.context.props.name}\' bot is completed successfully.`,
                    action: {
                        type: 'dismiss'
                    }
                }]
            });
        } else if(api.context.props.name != '' && api.context.props.type == 'update'){
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    id: 'alert5',
                    status: 'positive',
                    icon: 'check-circle-outline',
                    content: `Success: Integration with Line \'${api.context.props.name}\' bot is updated successfully.`,
                    action: {
                        type: 'dismiss'
                    }
                }]
            });
        } else {
            api.emit("NOW_UXF_PAGE#REMOVE_NOTIFICATIONS", {
                items: [{
                    id: 'alert5'
                }]
            });
        }
    }

    if(api.context.props.channel == 'slack') {
        if(api.context.props.name != '' && api.context.props.type == 'install'){
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    id: 'alert5',
                    status: 'positive',
                    icon: 'check-circle-outline',
                    content: `Success: Integration with Slack \'${api.context.props.name}\' bot is completed successfully.`,
                    action: {
                        type: 'dismiss'
                    }
                }]
            });
        } else if(api.context.props.name != '' && api.context.props.type == 'update'){
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    id: 'alert5',
                    status: 'positive',
                    icon: 'check-circle-outline',
                    content: `Success: Integration with Slack \'${api.context.props.name}\' bot is updated successfully.`,
                    action: {
                        type: 'dismiss'
                    }
                }]
            });
        } else {
            api.emit("NOW_UXF_PAGE#REMOVE_NOTIFICATIONS", {
                items: [{
                    id: 'alert5'
                }]
            });
        }
    }

    if(api.context.props.channel == 'google-chat') {
        if(api.context.props.name != '' && api.context.props.type == 'update'){
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    id: 'alert5',
                    status: 'positive',
                    icon: 'check-circle-outline',
                    content: `Success: Integration with Google Chat \'${api.context.props.name}\' bot is updated successfully.`,
                    action: {
                        type: 'dismiss'
                    }
                }]
            });
        }else {
            api.emit("NOW_UXF_PAGE#REMOVE_NOTIFICATIONS", {
                items: [{
                    id: 'alert5'
                }]
            });
        }
    }


}
