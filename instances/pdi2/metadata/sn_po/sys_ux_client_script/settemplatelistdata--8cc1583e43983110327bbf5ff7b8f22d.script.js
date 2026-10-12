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
    const rows = event.payload.rowDefinitions.rows;
    let isSelected = false;
    if (api.state.sourceType == 'AGENTIC_AI_DATA' && rows.length === 1) {
        isSelected = true;
        api.setState('templateId', rows[0].key);
        const templateName = rows[0].cells?.name?.value || '';
        const templateConfirmationsg= await helpers.translate('Verify and make necessary modifications to the project configuration created from the template: "{0}".', templateName);
        api.setState('templateConfirmationmsg', templateConfirmationmsg);
    }
    const newData = rows.map((data) => {
        return { ...data,
            'isSelected': isSelected
        };
    });
    event.payload.columnDefinitions.columns.forEach((data) => {
        if (data.label == "Number") {
            data.icons.endIcons = [];
        }
    });

    api.setState('templateListData', {
        "rows": newData
    });
}
