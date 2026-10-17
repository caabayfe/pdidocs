/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    if (!api.data.gform || !api.data.gform.nowRecordCommonHeader || !api.data.gform.nowRecordCommonHeader.secondaryItems)
        return;

    // In order to reduce calls of data broker, we need to call data broker when necessary.
    if (api.state.interactionState === 'wrap_up' && api.state.interactionAssignedTo === api.context.session.user.sys_id) {
        api.data.interaction_wrap_up_timer.refresh();
    } else {

        const location = api.context.app.interaction_secondary_values_location;
        const secondaryItems = api.data.gform.nowRecordCommonHeader.secondaryItems;

        if (location && location.trim().toLowerCase() === 'sidebar') {
            api.setState('secondaryValues', '');
            api.setState('secondaryValuesOnSidebar', secondaryItems);
        } else {
            //Need to convert the values so they fit the format required for the Display Value Block widget
            const transformHighlightValue = (item) => {;
                return {
                    type: 'highlighted-value',
                    label: item.displayValue,
                    status: item.status,
                    showIcon: item.showIcon
                };
            };
            const transformStringValue = (item) => {
                return {
                    type: 'string',
                    value: item.displayValue
                };
            };
            const transformTextLinkValue = (item) => {
                return {
                    type: 'text-link',
                    label: item.displayValue,
                    href: 'javascript:void(0)',
                    table: item.table,
                    sysId: item.sysId
                };
            };

            const formatedSecondaryItems = secondaryItems.map(item => {
                const {
                    fieldLabel,
                    type
                } = item;
                let displayBlockItemValue = {};
                switch (type) {
                    case 'simple':
                        displayBlockItemValue = transformStringValue(item);
                        break;
                    case 'reference':
                        displayBlockItemValue = transformTextLinkValue(item);
                        break;
                    case 'highlighted':
                        displayBlockItemValue = transformHighlightValue(item);
                        break;
                }
                return {
                    label: fieldLabel,
                    value: displayBlockItemValue
                };
            });
            api.setState('secondaryValues', formatedSecondaryItems);
            api.setState('secondaryValuesOnSidebar', '');
        }

        if (api.state.timer) {
            helpers.timing.clearInterval(api.state.timer);
        }
    }
}
