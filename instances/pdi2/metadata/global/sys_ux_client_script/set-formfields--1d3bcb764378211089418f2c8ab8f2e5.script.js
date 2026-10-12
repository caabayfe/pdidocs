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
        getRepeatSummary
    } = imports["global.GetRepeatSummary"]();
    const {
        convertTimezone
    } = imports['global.TimeZoneUtil']();

    const form = api.data.glide_form_add_event.nowRecordFormBlob.gForm;
    const DEFAULT_DATETIME_FORMAT = "YYYY-MM-DD HH:mm:ss";
    const userDateFormat = api.context.session.user.dateFormat.replaceAll('d', 'D').replaceAll('y', 'Y');
    let userDateTimeFormat = api.context.session.user.dateTimeFormat.replaceAll('d', 'D').replaceAll('y', 'Y');
    
    const {
        payload,
        elementId
    } = event;
    const {
        state
    } = api;
    const repeatInfo = {
        repeatType: state.repeatType,
        repeatCount: state.repeatCountValue,
        startDate: state.startDateTime,
        daysOfWeek: state.daysOfWeek,
        monthlyType: state.monthlyType,
        yearlyType: state.yearlyType,
        month: state.monthValue,
        floatWeek: state.floatWeekValue,
        floatDay: state.floatDayValue,
        translationConstants: state.translationConstants,
        helpers
    };

    if (payload.start) {
        if (/am|pm/.test(payload.start))
            userDateTimeFormat = userDateTimeFormat.replace("A", "a");
        else if(/AM|PM/.test(payload.start))
            userDateTimeFormat = userDateTimeFormat.replace("a", "A");
    }

    async function setRepeatSummary(repeatInfo) {
        api.setState("repeatSummary", await getRepeatSummary(repeatInfo));
    }

    const setInputDateRange = (payload) => {
        let start = payload.start;
        let end = payload.end;
        if (payload.timeZone) {
            start = NowDateTime.tz(start, payload.dateTimeFormat, payload.timeZone).utc().format(DEFAULT_DATETIME_FORMAT);
            end = NowDateTime.tz(end, payload.dateTimeFormat, payload.timeZone).utc().format(DEFAULT_DATETIME_FORMAT);
        } else {
            start = NowDateTime(start, payload.dateTimeFormat).format(DEFAULT_DATETIME_FORMAT);
            end = NowDateTime(end, payload.dateTimeFormat).format(DEFAULT_DATETIME_FORMAT);
        }
        api.setState('inputStartDateTime', start);
        api.setState('inputEndDateTime', end);
        api.setState('isConvertToScheduleDateTime', true);
    };


    //setting form fields
    if (elementId == 'date_range_picker_wrapper') {
        if (api.state.allDay) {
            payload.start = NowDateTime(payload.start, userDateFormat).startOf('day').format(userDateTimeFormat);
            payload.end = NowDateTime(payload.end, userDateFormat).endOf('day').format(userDateTimeFormat);
        }
        if (payload.start && payload.end) {
            setInputDateRange({
                start: payload.start,
                end: payload.end,
                timeZone: api.state.timeZone,
                dateTimeFormat: userDateTimeFormat
            });
        }
        api.setState('startDateTime', payload.start);
        api.setState('endDateTime', payload.end);

        await setRepeatSummary({
            ...repeatInfo,
            startDate: payload.start
        });
        return;
    }

    if (event.elementId == 'all_day' && event.name == 'NOW_CHECKBOX#CHECKED_SET') {
        api.setState('allDay', payload.value.toString() == 'true');
        form.setValue('all_day', payload.value.toString());

        // If all day use user's date format if not all day use dateTime format
        let curFormat = (payload.value.toString() == 'true') ? userDateFormat : userDateTimeFormat;

        // If all day set start to beginning of day and end at end of day
        let startDateTime = NowDateTime(api.state.startDateTime, "YYYY-MM-DD").startOf('day').format(DEFAULT_DATETIME_FORMAT);
        let endDateTime = NowDateTime(api.state.endDateTime, "YYYY-MM-DD").endOf('day').format(DEFAULT_DATETIME_FORMAT);
        api.setState('startDateTime', startDateTime);
        api.setState('endDateTime', endDateTime);

        // update the formatted start and end date times after conversion
        let nowStartDateTime = NowDateTime(startDateTime, DEFAULT_DATETIME_FORMAT).format(curFormat);
        let nowEndDateTime = NowDateTime(endDateTime, DEFAULT_DATETIME_FORMAT).format(curFormat);
        api.setState('formattedStartDateTime', nowStartDateTime);
        api.setState('formattedEndDateTime', nowEndDateTime);
        setInputDateRange({
            start: startDateTime,
            end: endDateTime,
            timeZone: api.state.timeZone,
            dateTimeFormat: DEFAULT_DATETIME_FORMAT
        });
        return;
    }

    if (event.elementId == 'repeat_type' && event.name == 'NOW_SELECT#SELECTED_ITEM_SET') {
        form.setValue('repeat_type', payload.value.toString());
        api.setState('repeatType', payload.value.toString());

        await setRepeatSummary({
            ...repeatInfo,
            repeatType: payload.value.toString()
        });
        return;
    }

    if (event.elementId == 'monthly_type' && event.name == 'NOW_SELECT#SELECTED_ITEM_SET') {
        form.setValue('monthly_type', payload.value.toString());
        api.setState('monthlyType', payload.value.toString());

        await setRepeatSummary({
            ...repeatInfo,
            monthlyType: payload.value.toString()
        });
        return;
    }

    if (event.elementId == 'yearly_type' && event.name == 'NOW_SELECT#SELECTED_ITEM_SET') {
        form.setValue('yearly_type', payload.value.toString());
        api.setState('yearlyType', payload.value.toString());

        await setRepeatSummary({
            ...repeatInfo,
            yearlyType: payload.value.toString()
        });
        return;
    }

    //convert in 'repeat_count' data type
    if (event.elementId == 'repeat_count' && event.name == 'NOW_INPUT#VALUE_SET') {
        var repeatCount = parseInt(payload.value.toString());
        form.setValue('repeat_count', repeatCount);
        api.setState('repeatCountValue', repeatCount);

        await setRepeatSummary({
            ...repeatInfo,
            repeatCount: repeatCount
        });
        return;
    }

    //convert repeat until in integer date format
    if (event.name == 'SN_RECORD_DATE_PICKER_WRAPPER#VALUE_CHANGED') {
        api.setState("formattedRepeatUntilValue", payload.value.toString());
        form.setValue('repeat_until', payload.value.toString());
        return;
    }

    //weekday checkboxes clicked
    if (event.name == "NOW_CHECKBOX#CHECKED_SET") {
        const value = payload.value;
        api.setState('daysOfWeek', ({
            currentValue
        }) => {
            return {
                ...currentValue,
                [event.elementId]: value
            };
        });
        const newDaysOfWeek = {
            ...repeatInfo.daysOfWeek,
            [event.elementId]: value,
        };
        await setRepeatSummary({
                ...repeatInfo,
                daysOfWeek: newDaysOfWeek,
            }
        );

        api.setState(
            "isRepeatOnValid",
            // checks if at least one day of week is selected
            Object.entries(newDaysOfWeek).filter(([dayOfWeek, isSelected]) => isSelected).length > 0
        );
        return;
    }

    if (event.elementId == 'float_week' && event.name == 'NOW_SELECT#SELECTED_ITEM_SET') {
        form.setValue('float_week', payload.value.toString());
        api.setState('floatWeekValue', payload.value.toString());

        await setRepeatSummary({
            ...repeatInfo,
            floatWeek: payload.value.toString()
        });
        return;
    }

    if (event.elementId == 'float_day' && event.name == 'NOW_SELECT#SELECTED_ITEM_SET') {
        form.setValue('float_day', payload.value.toString());
        api.setState('floatDayValue', payload.value.toString());

        await setRepeatSummary({
            ...repeatInfo,
            floatDay: payload.value.toString()
        });
        return;
    }

    if (event.elementId == 'month' && event.name == 'NOW_SELECT#SELECTED_ITEM_SET') {
        form.setValue('month', payload.value.toString());
        api.setState('monthValue', payload.value.toString());

        await setRepeatSummary({
            ...repeatInfo,
            month: payload.value.toString()
        });
        return;
    }
}
