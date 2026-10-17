/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    if (event.elementId == 'plugin_add') {
        let plugins = api.state.plugins;
        api.setState('plugins', [...plugins, {
            id: "",
            name: "",
            description: "",
            isQSChecked: false,
            isBEChecked: false,
            isBEDisabled: false
        }]);
        let disabledSteps = { ...api.state.disabledSteps
        };
        disabledSteps.step2 = true;
        api.setState('disabledSteps', disabledSteps);
        return;
    }
    let index = event.context.item.index;
    let plugins = [...api.state.plugins];
    let excludeIdQuery = '';
    for (let i = 0; i < plugins.length; i++) {
        if (i == 0)
            excludeIdQuery = 'id!=' + plugins[i]['id'];
        else
            excludeIdQuery += '^id!=' + plugins[i]['id'];
    }

    if (event.elementId == 'plugin_name') {
        switch (event.name) {
            case 'NOW_TYPEAHEAD#LIST_VISIBLE':
                if (event.context.item.value.id) {
                    let name = event.context.item.value.name[0] == '\\' ? event.context.item.value.name.substring(1) : event.context.item.value.name;
                    api.setState('pluginSearchFilter', 'nameLIKE' + name );
                }else {
                    api.setState('pluginSearchFilter', excludeIdQuery);
                }
                break;
            case 'NOW_TYPEAHEAD#VALUE_SET':
                let value = plugins[index]['name'][0] == '\\' ?  plugins[index]['name'].substring(1) : plugins[index]['name'];
                if (value != event.payload.value) {
                    let filter = 'nameLIKE' + event.payload.value + '^' + excludeIdQuery;
                    api.setState('pluginSearchFilter', filter);
                }    
                api.data.get_plugins_1.refresh();
                break;
            case 'NOW_TYPEAHEAD#SELECTED_ITEM_SET':
                plugins[index]['id'] = event.payload.item.id;
                plugins[index]['sys_id'] = event.payload.item.sys_id;
                plugins[index]['name'] = event.payload.item.label;
                if (plugins[index]['name'].indexOf('@') === 0) {
                    plugins[index]['name'] = `\\` + plugins[index]['name'];
                }
                plugins[index]['description'] = event.payload.item.description;
                let disabled = true;
                let disabledSteps = { ...api.state.disableSteps
                };
                for (let i = 0; i < plugins.length; i++) {
                    if (plugins[i]['id']) {
                        disabled = false;
                    } else {
                        disabled = true;
                        break;
                    }
                }
                disabledSteps.step2 = disabled;
                api.setState('disabledSteps', disabledSteps);
                api.setState('plugins', plugins);
                api.setState('pluginSearchFilter', excludeIdQuery + '^id!=' + plugins[index]['id']);
                api.data.get_plugins_1.refresh();
                break;
        }
    } else if (event.elementId == 'plugin_remove') {
        let plugins = [...api.state.plugins];
        plugins.splice(index, 1);
        api.setState("plugins", plugins);
        let disabled = true;
        let disabledSteps = { ...api.state.disableSteps
        };
        for (let i = 0; i < plugins.length; i++) {
            if (plugins[i]['id']) {
                disabled = false;
            } else {
                disabled = true;
                break;
            }
        }
        disabledSteps.step2 = disabled;

        api.setState('disabledSteps', disabledSteps);
        api.setState('plugins', plugins);
    }

    return;
}
