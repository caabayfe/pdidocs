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
    const setSecondaryValues = (timerItem) => {
        const location = api.context.app.interaction_secondary_values_location;
        const secondaryItems = api.data.gform.nowRecordCommonHeader.secondaryItems;

        if (location && location.trim().toLowerCase() === 'sidebar') {
            api.setState('secondaryValues', [timerItem]);
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
                const { fieldLabel, type } = item;
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
            const allItems = timerItem ? [...formatedSecondaryItems, timerItem] : [...formatedSecondaryItems];
            api.setState('secondaryValues', allItems);
            api.setState('secondaryValuesOnSidebar', '');            
        }
    };

    const output = api.data.interaction_wrap_up_timer.output;
    if (!output || !api.data.gform.nowRecordCommonHeader)
        return;

    if (api.state.timer) {
        helpers.timing.clearInterval(api.state.timer);
    }

    if (Object.keys(output).length === 0) {
        setSecondaryValues(undefined);
        return;
    }

    const secondToTimeFormat = sec_num => {
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        return hours + ':' + minutes + ':' + seconds;
    };

    const timeLeftOnMillisecond = output.timeLeftOnMillisecond;
    const wrapUpDuration = output.wrapUpDuration;

    let timeLeft = Math.floor(timeLeftOnMillisecond / 1000);

    helpers.translate("Wrap Up Timer").then(timerTitleText => {
        const timer = helpers.timing.setInterval(function() {
            timeLeft--;
            if (timeLeft < 0) {
                setSecondaryValues(undefined);
                helpers.timing.clearInterval(timer);
                return;
            }

            const timerColors = ['high', 'warning', 'positive', 'positive'];
            const currentColorIndex = Math.floor(timeLeft / wrapUpDuration * timerColors.length);

            const timerItem = {
                label: timerTitleText,
                value: {
                    "type": "highlighted-value",
                    "label": secondToTimeFormat(timeLeft),
                    "status": timerColors[currentColorIndex]
                }
            };
            
            setSecondaryValues(timerItem);
        }, 1000);
        api.setState('timer', timer);
    });
}
