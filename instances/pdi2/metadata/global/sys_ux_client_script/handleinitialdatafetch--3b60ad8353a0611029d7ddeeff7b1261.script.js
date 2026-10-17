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
        NowDateTime
    } = imports['sn_uxf.core_libraries']();
    const {
        getColorMap,
        getDatePickerTemplates,
    } = imports["global.ScheduleCalendarUtils"]();
    const DAY_IN_MS = 86400000;
    const {
        startDate,
        endDate
    } = api.state;
    const userDateTimeFormat = api.context.session.user.dateTimeFormat.replaceAll('d', 'D').replaceAll('y', 'Y');
    const scheduleSysId = api.context.props.sysId;

    await helpers.snHttp('/api/now/schedule_page/event/schedule?end_date=' + endDate + '&format=dhtmlx&start_date=' + startDate + '&sysparm_sys_id=' + scheduleSysId, {
            method: 'GET'
        })
        .then(({
            response
        }) => {
            let eventIndex = Date.now();
            const eventData = response.result.events;
            const colorMap = getColorMap();
            var newEvents = eventData.map(function(eventdata) {
                eventdata.id = `${eventdata.sys_id}_${eventIndex++}`;
                var showAsValue = "";
                var repeatTypeValue = "";
                var start = eventdata.start_date,
                    end = eventdata.end_date,
                    title = eventdata.text;
                if(eventdata.record.read_allowed) {
                    showAsValue = eventdata.record.show_as.display_value;
                    repeatTypeValue = eventdata.record.repeat_type.display_value;
                }
                 if(end.includes("23:59:59")) {
                    end = NowDateTime(eventdata.end_date, "YYYY-MM-DD HH:mm:ss").add(1, 'second').format("YYYY-MM-DD HH:mm:ss");
                }
                let startNowDateTime = NowDateTime(eventdata.start_date, "YYYY-MM-DD HH:mm:ss");
                let startDateTime = startNowDateTime.startOf("day");
                let starDatetInMS = startDateTime.$d.getTime();
                let startDateDay = startDateTime.$d.getDate();
                let endNowDateTime = NowDateTime(end, "YYYY-MM-DD HH:mm:ss");
                let endDateTime = endNowDateTime.startOf("day");
                let endDateInMS = endDateTime.$d.getTime();
                let endDateDay = endDateTime.$d.getDate();
                let eventDurationInMS = endDateInMS - starDatetInMS;
                var eventBgColor = colorMap.get('nonAllDay_bgcolor');
                var eventBorderColor = colorMap.get('nonAllDay_bordercolor');
                if (eventdata.type == 'exclude') {
                    eventBgColor = colorMap.get('exclude_bgcolor');
                    eventBorderColor = colorMap.get('exclude_bordercolor');
                } else if (eventDurationInMS >= DAY_IN_MS) {
                    eventBgColor = colorMap.get('allDay_bgcolor');
                    eventBorderColor = colorMap.get('allDay_bordercolor');
                }
                // get rid of seconds for tool tip
                const userTimeFormat = api.context.session.user.timeFormat.replace(/(:|.)ss/,"");
                const formattedStartTime = startNowDateTime.format(userTimeFormat);
                const formattedEndTime = endNowDateTime.format(userTimeFormat);
                const ariaLabel = `${formattedStartTime} - ${formattedEndTime}, ${title}`;
                return ({
                    id: eventdata.id,
                    formattedStart: startNowDateTime.format(userDateTimeFormat),
                    formattedEnd: endNowDateTime.format(userDateTimeFormat),
                    ariaLabel: ariaLabel,
                    start: start,
                    end: end,
                    title: title,
                    group: eventdata.sys_id,
                    borderColor: eventBorderColor,
                    bgColor: eventBgColor,
                    showAs: showAsValue,
                    repeats: repeatTypeValue,
                    spanRecord: eventdata.record,
                    readAllowed: eventdata.record.read_allowed,
                    writeAllowed: eventdata.record.write_allowed,
                    startDateDay: startDateDay,
                    endDateDay: endDateDay
                });
            });

            var sections = getSections(eventData);

            function getSections(eventData) {
                let result = [];
                let order = 0;
                var sectionSet = new Set();
                eventData.forEach(event => {
                    const group = event.timelineGroupingKey;
                    const title = event.text;
                    if (!sectionSet.has(group)) {
                        let section = [];
                        section.id = event.sys_id;
                        section.order = order++;
                        section.title = title;
                        section.isCollapsed = false;
                        section.showHeader = false;
                        section.titleInlineStyle = {
                            "padding-top": "1rem"
                        };
                        result.push(section);
                        sectionSet.add(group);
                    }
                });
                return result;
            }
            api.setState('isLoading', false);
            api.setState('calendarControls', ({
                currentValue
            }) => {
                return {
                    ...currentValue,
                    events: newEvents,
                    sections: sections
                };
            });

        })
        .catch(({
            error
        }) => {
            const message = `Error: ${error.data.error.message}`;
            console.error(message);
        });
    api.setState('datePickerTemplates', getDatePickerTemplates(api));
    api.setState('hasWriteAccessOnCalendar', api.data.calendar_user_role.output);
    api.setState('scheduleSysId', scheduleSysId); 
}
