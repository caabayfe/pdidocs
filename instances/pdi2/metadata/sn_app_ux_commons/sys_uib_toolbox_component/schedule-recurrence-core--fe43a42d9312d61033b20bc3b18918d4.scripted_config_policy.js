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
    if (!trigger || trigger === 'allDay') {
        api.updateVisibility('toDate', properties.allDay);
        api.updateVisibility('fromTime', !properties.allDay);
        api.updateVisibility('toTime', !properties.allDay);
    }
    if (!trigger || trigger === 'repeats') {
        api.updateVisibility('dayDetails', properties.repeats.message === 'daily');
        api.updateVisibility('weekDetails', properties.repeats.message === 'weekly');
		api.updateVisibility('monthDetails', properties.repeats.message === 'monthly');
        api.updateVisibility('yearDetails', properties.repeats.message === 'yearly');
    }

    if (!trigger || trigger === 'componentType') {
        api.updateVisibility('exceptionIndex', properties.componentType.message === 'exception');
        api.updateVisibility('disabledDatesForMiniCalendar', properties.componentType.message === 'exception');
    }

    

}
