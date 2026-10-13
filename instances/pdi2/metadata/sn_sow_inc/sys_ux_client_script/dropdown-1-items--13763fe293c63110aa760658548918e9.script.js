/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const dateFormat = JSON.parse(api.data.look_up_user_preferences.result.preferences[0].value);
    const isShortDateFormat = JSON.parse(api.data.look_up_user_preferences.result.preferences[1].value);
    const userDateFormat = api.data.look_up_user_preferences.result.dateFormat;
    const values = [{
        id: "SYSTEM_DEFAULT",
        label: `${api.data.look_up_user_preferences.result.dateTimeFormat} (System default)`
    }];
    if (dateFormat && !dateFormat.timeAgo && dateFormat.dateBoth && !isShortDateFormat) {
        values.push({
            id: "USER_PREFERENCE",
            label: `${userDateFormat} 09:00:01 5 min ago (User Preference)`,
        });
    } else if (dateFormat && !dateFormat.timeAgo && dateFormat.dateBoth && isShortDateFormat) {
        values.push({
            id: "USER_PREFERENCE",
            label: `${userDateFormat} 09:00 5 min ago (User Preference)`
        });
    } else if (dateFormat && !dateFormat.timeAgo && !dateFormat.dateBoth && !isShortDateFormat) {
        values.push({
            id: "USER_PREFERENCE",
            label: `${userDateFormat} 09:00:01 (User Preference)`
        });
    } else if (dateFormat && !dateFormat.timeAgo && !dateFormat.dateBoth && isShortDateFormat) {
        values.push({
            id: "USER_PREFERENCE",
            label: `${userDateFormat} 09:00 (User Preference)`
        });
    } else if (dateFormat) {
        values.push({
            id: "USER_PREFERENCE",
            label: '5 min ago (User Preference)'
        });
    }
    return values;
}
