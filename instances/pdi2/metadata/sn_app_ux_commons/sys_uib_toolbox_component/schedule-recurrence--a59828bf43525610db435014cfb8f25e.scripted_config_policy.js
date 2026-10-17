/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.trigger
 * @param {any} params.properties
 */
function componentPolicy({
    api,
    trigger,
    properties
}) {

    const isAllDayNull = properties.allDay === null;
    api.updateVisibility('fromTime', isAllDayNull || !properties.allDay);
    api.updateVisibility('toTime', isAllDayNull || !properties.allDay);
    api.updateVisibility('toDate', isAllDayNull || properties.allDay);

    const repeatTypeValue = properties.repeatType;
    const isRepeatTypeValueNull = repeatTypeValue === null;
    api.updateVisibility('repeatCount', isRepeatTypeValueNull || repeatTypeValue === 'daily' || repeatTypeValue === 'weekly' || repeatTypeValue === 'monthly' || repeatTypeValue === 'yearly');
    api.updateVisibility('repeatUntil', isRepeatTypeValueNull || repeatTypeValue === 'daily' || repeatTypeValue === 'weekly' || repeatTypeValue === 'monthly' || repeatTypeValue === 'yearly');
    api.updateVisibility('daysInWeek', isRepeatTypeValueNull || repeatTypeValue === 'weekly');
    api.updateVisibility('monthType', isRepeatTypeValueNull || repeatTypeValue === 'monthly');
    api.updateVisibility('yearType', isRepeatTypeValueNull || repeatTypeValue === 'yearly');
}
