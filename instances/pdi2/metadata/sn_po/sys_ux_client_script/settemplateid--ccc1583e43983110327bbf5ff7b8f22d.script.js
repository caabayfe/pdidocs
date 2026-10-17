/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    if (event.elementId == 'select_sourceType' || event.elementId == "source_entity") {
        if(api.state.templateId){
        api.setState('templateQuery', '');
        }
        const newData = api.state.templateListData.rows.map((data) => {
            return { ...data,
                'isSelected': false
            };
        });
        api.setState('templateListData', {
            "rows": newData
        });
        api.setState('isSourceRequired', true);
        api.setState('isSourceInvalid', false);
        return;
    }
    if (event.payload.checked == true) {
        const templateName = api.state.templateListData.rows.find(data=>data.key==event.payload.value);
        const templateConfirmationmsg=await helpers.translate('Verify and make necessary modifications to the project configuration created from the template: "{0}".', templateName.cells?.name?.value);
        api.setState('templateConfirmationmsg', templateConfirmationmsg);
        api.setState('isSourceRequired', false);
        api.setState('isSourceInvalid', false);
        api.setState('templateQuery', `project.sys_id=${event.payload.value}`);
        api.setState('templateId', event.payload.value);
        const newData = api.state.templateListData.rows.map((data) => {
            if (data.key == event.payload.value) {
                return { ...data,
                    'isSelected': true
                };
            } else {
                return { ...data,
                    'isSelected': false
                };
            }
        });
        api.setState('templateListData', {
            "rows": newData
        });
    } else {
        api.setState('isSourceRequired', true);
        api.setState('templateId', '');
        const newData = api.state.templateListData.rows.map((data) => {
            if (data.key == event.payload.value) {
                return { ...data,
                    'isSelected': false
                };
            } else {
                return data;
            }
        });
        api.setState('templateListData', {
            "rows": newData
        });
    }
}
