/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    var content = [];
    const { NowDateTime } = imports['sn_uxf.core_libraries']();
    var timezone = api.data.lp_card.result?.time_zone?.displayValue || api.data.record_information.output.instanceTimeZone;
    var timeFormat = api.context.session.user.timeFormat;
    var response = '';

    if (api.data.lp_card.result?.location?._reference?.city?.displayValue) {
        response = api.data.lp_card.result.location._reference.city.displayValue;
    }

    if (timezone) {
        if (response)
            response += ' · ';
        response += NowDateTime().tz(timezone).format(timeFormat) + ' ' + timezone;
        content.push(response);
    }

    var subHeadingList = [];
    if (api.data.lp_card.result) {
        const title = api.data.lp_card.result.title?.displayValue;
        const department = api.data.lp_card.result.department?.displayValue;    

        if (title) {
            subHeadingList.push(title);
        }    

        if (department) {
            subHeadingList.push(department);
        }
    }

    api.setState("newContactField", [{
            'label': subHeadingList.join(' · ')
        },
        {
            "label": content.join(' · ')
        }
    ]);
}
