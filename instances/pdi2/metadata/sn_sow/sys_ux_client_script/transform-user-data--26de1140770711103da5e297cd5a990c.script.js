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
    const { NowDateTime } = imports['sn_uxf.core_libraries']();
    // For invalid userSysId return
    if (!api.context.props.userSysId) {
        api.setState("userStackedData", []);
        api.setState("hideLoader", false);
        return;
    }

    var userData = api.data.user_record.result;
    var timezone = api.data.now_timezone_1.output;
    var timeFormat = api.context.session.user.timeFormat;
    var userStackedData = [];
    userStackedData.push({
        "label": await helpers.translate("Local time"),
        "value": NowDateTime().tz(timezone).format(timeFormat) + ' ' + timezone
    });

    for (const key in userData) {
        if (!userData[key]) continue;
        switch (key) {
            case "name":
                //Do nothing
                break;
            case "_row_data":
                //Do nothing
                break;
            case "email":
                if (!userData[key].displayValue || !userData[key].value)
                    break;
                var obj = {};
                obj.label = await helpers.translate("Email");
                obj.value = {
                    "type": "text-link",
                    "value": userData[key].displayValue,
                    "label": userData[key].displayValue,
                    "href": `mailto:${userData[key].value}`
                };
                userStackedData.push(obj);
                break;
            case "phone":
                if (!userData[key].displayValue)
                    break;
                var obj = {};
                obj.label = await helpers.translate("Business phone");
                obj.value = {
                    "type": "text-link",
                    "value": "Phone",
                    "label": userData[key].displayValue,
                    "href": "javascript:;"
                };
                userStackedData.push(obj);
                break;
            case "mobile_phone":
                if (!userData[key].displayValue || !userData[key].value)
                    break;
                var obj = {};
                obj.label = await helpers.translate("Mobile phone");
                obj.value = {
                    "type": "text-link",
                    "value": "Mobile",
                    "label": userData[key].displayValue,
                    "href": "javascript:;"
                };
                userStackedData.push(obj);
                break;
            case "location":
                if (!userData[key].displayValue)
                    break;
                if (userData[key]["_reference"]) {
                    var obj = {};
                    obj.label = await helpers.translate("Location");
                    var valueString = "";
                    if (userData[key]["_reference"].city.displayValue) {
                        valueString += userData[key]["_reference"].city.displayValue + ", ";
                    }
                    if (userData[key]["_reference"].state.displayValue) {
                        valueString += userData[key]["_reference"].state.displayValue + ", ";
                    }
                    if (userData[key]["_reference"].country.displayValue) {
                        valueString += userData[key]["_reference"].country.displayValue;
                    }
                    obj.value = valueString;
                    userStackedData.push(obj);
                }
                break;
            default:
                //Do nothing
                break;
        }
    }

    api.setState("userStackedData", userStackedData);
    api.setState("hideLoader", true);
}
