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

    const disableContinue = (task) => {
        let disabledSteps = {
            step1: true,
            step2: true
        };
        if (task.name && (task.rich_description || task.description)) {
            disabledSteps.step1 = false;
            if (Object.keys(task.content).length != 0) {
                switch (task.content.configuration_types) {
                    case 'table':
                        if (task.content.table_name && task.content.view) {
                            disabledSteps.step2 = false;
                        }
                        break;
                    case 'iframe':
                        if (task.content.url) {
                            disabledSteps.step2 = false;
                        }
                        break;
                    case 'custom':
                        if (task.content.related_content) {
                            disabledSteps.step2 = false;
                        }
                        break;
                    case 'install_plugin':
                        if (task.content.records && task.content.records.length > 0) {
                            disabledSteps.step2 = false;
                        }
                        break;
                }
            }
        }
        api.setState('disabledSteps', disabledSteps);
        return;
    };

    const result = api.data.get_setup_step.output.result;
    disableContinue(result);
    let step1 = {
        name: result.name,
        description: result.rich_description || result.description,
        sys_id: result.sys_id,
        contentId: result.content.sys_id,
        configuration_types: result.content.configuration_types || 'table'
    };

    let step2 = { 
        tableName: {
            id: result.content.table_name
        },
        tableView: {
            id: result.content.view || "Default view"
        },
        url: result.content.url,
        related_content: result.content.related_content ? result.content.related_content.map(content => {
            return { ...content,
                type: content.type == 'document' ? 'article' : content.type,
                description: content.text
            };
        }) : []
    };

    if(step1.configuration_types == 'table') {
        api.setState('tableSearchFilter', step2.tableName.id || '');
        api.data.get_table_names.refresh();
    }

    if (result.content.configuration_types === 'install_plugin') {
        helpers.snHttp(`api/sn_ads_setup/build/setup/${api.context.props.setupId}/plugins/${api.context.props.categoryId}`, {
                method: 'GET',
                batch: false
            })
            .then(({
                response
            }) => {
                let {basic, recommended} = response.result;
                basic = basic || [];
                recommended = recommended || [];
                let records = result.content.records ? result.content.records.map(record => {
                    if (record.name.indexOf('@') === 0) {
                        record.name = `\\` + record.name;
                    }
                    return { ...record,
                        isQSChecked: basic.includes(record.sys_id),
                        isBEChecked: basic.includes(record.sys_id) || recommended.includes(record.sys_id),
                        isBEDisabled: basic.includes(record.sys_id)
                    };
                }) : [];
                if (records.length > 0) {
                    api.setState('plugins', [...records]);
                    api.setState('pluginSearchFilter', records.reduce((result, record, index) => {
                        if (index == 0) return 'id!=' + record.id;
                        return result + '^id!=' + record.id;
                    },''));
                }
                let pluginSetupType = {
                    basic,
                    recommended
                };
                api.setState('pluginSetupType', pluginSetupType);
            })
            .catch(({
                error
            }) => {
                //TODO: Open notification
                console.log(error);
            });
    }
    let step3 = {
        allow_delegation: result.allow_delegation,
        task_type: result.task_type
    };
    api.setState('taskStepStatus', Number(result.status));
    if (api.state.syncStepStatus)
        api.setState('selectedTaskStep', Number(result.status) ? Number(result.status) : 1); // If the status is 0, selecting the Basic Info step

    api.setState('pageInput', {
        step1,
        step2,
        step3
    });
    api.data.get_table_label.refresh();
    api.data.form_view_for_table.refresh();
}
