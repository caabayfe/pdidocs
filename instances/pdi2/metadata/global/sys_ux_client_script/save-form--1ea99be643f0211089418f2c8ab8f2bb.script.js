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
    const form = api.data.glide_form_add_event.nowRecordFormBlob.gForm;
    const BOXED_TO_DAY_VALUES = {
        'mon_box': 1,
        'tue_box': 2,
        'wed_box': 3,
        'thu_box': 4,
        'fri_box': 5,
        'sat_box': 6,
        'sun_box': 7
    };
    const days = Object.keys(api.state.daysOfWeek)
        .filter(dKey => api.state.daysOfWeek[dKey])
        .map(dKey => BOXED_TO_DAY_VALUES[dKey])
        .join('');
    form.setValue('days_of_week', days);

    const errorMessages = [];
    const {startDateTime, endDateTime, repeatType, isRepeatCountValid, isRepeatOnValid, invalidRepeatCountValue} = api.state;

    if (!startDateTime || !endDateTime)
        errorMessages.push(await helpers.translate('The dates and times you entered were not valid'));

    if (['daily', 'weekly', 'monthly', 'yearly', 'specific'].includes(repeatType) && !isRepeatCountValid) {
        const num = parseInt(invalidRepeatCountValue);
        if (invalidRepeatCountValue === '') {
            errorMessages.push(await helpers.translate('Please enter a value for "Repeat every"'));
        } else if (Number.isNaN(num)) {
            errorMessages.push(await helpers.translate('Please enter a numerical value for "Repeat every"'));
        } else if (num > 2147483647) {
            errorMessages.push(await helpers.translate('Please enter a smaller value for "Repeat every"'));
        } else {
            errorMessages.push(await helpers.translate('Please enter a value of at least 1 for "Repeat every"'));
        }
    }

    if (repeatType === 'weekly' && !isRepeatOnValid)
        errorMessages.push(await helpers.translate('Please select at least one day for "Repeat on"'));


    if (errorMessages.length > 0) {
        api.setState('errors', [...errorMessages]);
        return;
    };

    api.setState('errors', []);

    form.save();
}
