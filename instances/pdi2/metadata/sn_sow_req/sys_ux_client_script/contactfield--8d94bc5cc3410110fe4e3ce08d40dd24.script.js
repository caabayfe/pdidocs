async function handler({
    api,
    event,
    helpers,
    imports
}) {
    var requestorContent = [];
    var requestorSubHeadingList = [];
    var openedByContent = [];
    var openedBySubHeadingList = [];
    const {
        NowDateTime
    } = imports['sn_uxf.core_libraries']();
    if (api.data.record_information__request_1.output && api.data.record_information__request_1.output.sourceInfo &&
        api.data.record_information__request_1.output.sourceInfo.requestorInfo) {
        //content
        var requestorInfo = api.data.record_information__request_1.output.sourceInfo.requestorInfo;
        var firstName = api.data.record_information__request_1.output.sourceInfo.name;
        if(firstName){
            firstName = firstName.split(" ")[0];
        }
        var contactAriaLabel = await helpers.translate("View {0}'s contact details", firstName);
        api.setState("requestorContactAriaLabel", {"button":{"aria-label":contactAriaLabel}});
        
        if (requestorInfo.city)
            requestorContent.push(requestorInfo.city);
        if (requestorInfo.timeZone) {
            var timeZone = requestorInfo.timeZone;
            var timeFormat = api.context.session.user.timeFormat;
            requestorContent.push(NowDateTime().tz(timeZone).format(timeFormat) + ' ' + timeZone);
        }
        //subHeading
        if (requestorInfo.title)
            requestorSubHeadingList.push(requestorInfo.title);
        if (requestorInfo.department)
            requestorSubHeadingList.push(requestorInfo.department);
    }

    if (api.data.record_information__request_1.output && api.data.record_information__request_1.output.openedByInfo &&
        api.data.record_information__request_1.output.openedByInfo.userInfo) {
        //content
        var openedByInfo = api.data.record_information__request_1.output.openedByInfo.userInfo;
        var firstName = api.data.record_information__request_1.output.openedByInfo.name;
        if(firstName){
            firstName = firstName.split(" ")[0];
        }
        var contactAriaLabel = await helpers.translate("View {0}'s contact details", firstName);
        api.setState("openedByContactAriaLabel", {"button":{"aria-label":contactAriaLabel}});
        if (openedByInfo.city)
            openedByContent.push(openedByInfo.city);
        if (openedByInfo.timeZone) {
            var timeZone = openedByInfo.timeZone;
            var timeFormat = api.context.session.user.timeFormat;
            openedByContent.push(NowDateTime().tz(timeZone).format(timeFormat) + ' ' + timeZone);
        }
        //subHeading
        if (openedByInfo.title)
            openedBySubHeadingList.push(openedByInfo.title);
        if (openedByInfo.department)
            openedBySubHeadingList.push(openedByInfo.department);
    }

    api.setState("requestorContactField", [{'label': requestorSubHeadingList.join(' · ')},
        {
            "label": requestorContent.join(' · ')
        }
    ]);
    api.setState("openedByContactField", [{'label': openedBySubHeadingList.join(' · ')},{"label": openedByContent.join(' · ')}])
}
