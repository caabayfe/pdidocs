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
    const {
        rule_based_finding_list,
        automated_finding_list
    } = api.state.selectedTemplateIds;

    if (automated_finding_list.length > 0 && rule_based_finding_list.length > 0) {
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    id: 'delete-findings',
                    status: 'positive',
                    icon: 'circle-check-outline',
                    content: await helpers.translate(`{0} Automated Finding Definition(s) & {1} Rule based Definition(s) removed successfully`, automated_finding_list.length, rule_based_finding_list.length),
                    action: {
                        type: 'dismiss'
                    },
                }],
            });
            const newSelections = {
                ...api.state.selectedTemplateIds,
                'automated_finding_list': [],
                'rule_based_finding_list': [],
            };
            api.setState('selectedTemplateIds', newSelections);
    } else if (event.elementId == "delete_automated_findings" && automated_finding_list.length > 0) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'delete-automated-finding',
                status: 'positive',
                icon: 'circle-check-outline',
                content: await helpers.translate(`{0} Automated Finding Definition(s) removed successfully`, automated_finding_list.length),
                action: {
                    type: 'dismiss'
                },
            }],
        });
        const newSelections = {
            ...api.state.selectedTemplateIds,
            'automated_finding_list': [],
        };
        api.setState('selectedTemplateIds', newSelections);

    } else if (event.elementId == "delete_findings" && rule_based_finding_list.length > 0) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'delete-rule-finding',
                status: 'positive',
                icon: 'circle-check-outline',
                content: await helpers.translate(`{0} Rule Based Finding Definition(s) removed successfully`, rule_based_finding_list.length),
                action: {
                    type: 'dismiss'
                },
            }],
        });
        const newSelections = {
            ...api.state.selectedTemplateIds,
            'rule_based_finding_list': []
        };
        api.setState('selectedTemplateIds', newSelections);
    }
}
