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
        getRepeatSummary,
        getTranslationConstants
    } = imports["global.GetRepeatSummary"]();
    const {
        NowDateTime
    } = imports['sn_uxf.core_libraries']();

    const form = api.data.glide_form_add_event.nowRecordFormBlob.gForm;
    const results = api.data.glide_form_add_event.nowRecordFormBlob.formFieldValues;
    const EMPTY_REPEAT_UNTIL_VALUE = '00000000';

    var tempJson = {
        "mon_box": false,
        "tue_box": false,
        "wed_box": false,
        "thu_box": false,
        "fri_box": false,
        "sat_box": false,
        "sun_box": false
    };
    if (results) {
        if (results.all_day) {
            if (results.all_day.value == "true" || results.all_day.value == true) {
                form.setValue('all_day', true);
                api.setState('allDay', true);
            } else {
                form.setValue('all_day', false);
                api.setState('allDay', false);
            }
        }

        if (results.repeat_type) {
            form.setValue('repeat_type', results.repeat_type.value);
            api.setState('repeatType', results.repeat_type.value);
            api.setState('doesNotRepeatDropDownId', results.repeat_type.value);
        }

        if (results.repeat_count) {
            const repeatCount = parseInt(results.repeat_count.value);
            form.setValue('repeat_count', repeatCount);
            api.setState('repeatCountValue', repeatCount);
        }

        if (results.monthly_type) {
            form.setValue('monthly_type', results.monthly_type.value);
            api.setState('monthlyType', results.monthly_type.value);
        }

        if (results.yearly_type) {
            form.setValue('yearly_type', results.yearly_type.value);
            api.setState('yearlyType', results.yearly_type.value);
        }

        if (results.float_week) {
            form.setValue('float_week', results.float_week.value);
            api.setState('floatWeekValue', results.float_week.value);
        }

        if (results.float_day) {
            form.setValue('float_day', results.float_day.value);
            api.setState('floatDayValue', results.float_day.value);
        }

        if (results.month) {
            var monthValue = (results.month.value).toString();
            form.setValue('month', monthValue);
            api.setState('monthValue', monthValue);
        }

        if (results.days_of_week) {
            var daysOfWeekValue = results.days_of_week.value;
            const DAY_TO_BOXED_VALUES = {
                1: 'mon_box',
                2: 'tue_box',
                3: 'wed_box',
                4: 'thu_box',
                5: 'fri_box',
                6: 'sat_box',
                7: 'sun_box'
            };
            for (var i = 0; i < daysOfWeekValue.length; i++) {
                tempJson[DAY_TO_BOXED_VALUES[daysOfWeekValue[i]]] = true;
            }
            api.setState('daysOfWeek', tempJson);
            form.setValue('days_of_week', daysOfWeekValue);
        }

        if (results.repeat_until.value) {
            var repeatUntilValue = results.repeat_until.value;
            var repeatUntilValueString = repeatUntilValue.toString();
            if (repeatUntilValueString === EMPTY_REPEAT_UNTIL_VALUE) {
                form.setValue('repeat_until', repeatUntilValue);
                api.setState('repeatUntilValue', '');
                api.setState('formattedRepeatUntilValue', '');
            } else {
                repeatUntilValueString = repeatUntilValueString.substring(0, 4) + '-' + repeatUntilValueString.substring(4, 6) + '-' + repeatUntilValueString.substring(6);
                form.setValue('repeat_until', repeatUntilValue);
                api.setState('repeatUntilValue', repeatUntilValueString);
                const userDateFormat = api.context.session.user.dateFormat.replaceAll('d', 'D').replaceAll('y', 'Y');
                const formattedRepeatUntilValue = NowDateTime(repeatUntilValueString, "YYYY-MM-DD").format(userDateFormat);
                api.setState('formattedRepeatUntilValue', formattedRepeatUntilValue);
            }
        }

        if (results.start_date_time.value && results.end_date_time.value) {
            api.setState('inputStartDateTime', results.start_date_time.value);
            api.setState('inputEndDateTime', results.end_date_time.value);
            api.setState('isConvertToScheduleDateTime', false);
            form.setValue('start_date_time', results.start_date_time.value);
            form.setValue('end_date_time', results.end_date_time.value);
        }

        const repeatInfo = {
            repeatType: results.repeat_type.value,
            repeatCount: results.repeat_count.value,
            startDate: results.start_date_time.value,
            daysOfWeek: tempJson,
            monthlyType: results.monthly_type.value,
            yearlyType: results.yearly_type.value,
            month: results.month.value,
            floatWeek: results.float_week.value,
            floatDay: results.float_day.value,
            translationConstants: api.state.translationConstants,
            helpers
        };

        if (!repeatInfo.translationConstants) {
            const translationConstants = await getTranslationConstants(helpers);
            api.setState('translationConstants', translationConstants);
            repeatInfo.translationConstants = translationConstants;
        }
        api.setState('repeatSummary', await getRepeatSummary(repeatInfo));
    }
}
