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
    const selectedCard = event.payload.selectedCard;
    let url;

    const optionId = event.payload.dropdownOption.id;
    if (optionId === 'propose')
        url = 'std_change_proposal.do?sys_id=-1';
    else if (optionId === 'create') {
        if (selectedCard && selectedCard.value.sys_class_name === 'chg_model') {
            const tableName = selectedCard.value.targetTableName || 'change_request';
            url = `chg_template.do?sys_id=-1&sysparm_query=sttrm_model%3D${selectedCard.value.sysId}%5Etable%3D${tableName}`;
        } else
            url = 'chg_template.do?sys_id=-1';
    } else {
        switch(selectedCard.value.sys_class_name) {
            case 'chg_model':
                url = `chg_model.do?sys_id=${selectedCard.value.sysId}`;
                break;
            case 'chg_template':
                url = `chg_template.do?sys_id=${selectedCard.value.sysId}`;
                break;
            case 'std_change_record_producer':
                const query = `sysparm_id=32b19f3b9fb002002920bde8132e7024&std_change_producer=${selectedCard.value.sysId}&sysparm_historyback=true`;
                url = `com.glideapp.servicecatalog_cat_item_view.do?${query}`;
                break;
        }
    }

    if (url)
        api.emit('GLOBAL_NAVIGATION_REQUESTED', {
            fallbackRoute: {
            context: {
                    experienceName: 'Unified Navigation App',
                    path: 'now/nav/ui'
                },
                route: 'classic',
                params: {
                    target: url
                }
            }
        });
}
