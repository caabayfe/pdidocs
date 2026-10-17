/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var recordInfoPrimaryDetails = {
        ...api.state.recordInfoPrimaryDetails
    };
    var content = [];
    const { NowDateTime } = imports['sn_uxf.core_libraries']();
    if (api.data.record_information.output && api.data.record_information.output.sourceInfo) {
        if (api.data.record_information.output.sourceInfo.callerInfo.caller.city)
            content.push(api.data.record_information.output.sourceInfo.callerInfo.caller.city);
        var timeZone = api.data.record_information.output.sourceInfo.callerInfo.caller.timeZone;
        var timeZoneValue = api.data.record_information.output.sourceInfo.callerInfo.caller.timeZoneValue;
        var timeFormat = api.context.session.user.timeFormat;
        content.push(NowDateTime().tz(timeZoneValue).format(timeFormat) + ' ' + timeZone);
    }
    var subHeadingList = [];
    if (api.data.record_information.output && api.data.record_information.output.sourceInfo) {
        if (api.data.record_information.output.sourceInfo.callerInfo.caller.title)
            subHeadingList.push(api.data.record_information.output.sourceInfo.callerInfo.caller.title);
        if (api.data.record_information.output.sourceInfo.callerInfo.caller.department)
            subHeadingList.push(api.data.record_information.output.sourceInfo.callerInfo.caller.department);
    }
    
    recordInfoPrimaryDetails["contactField"] = [{
        'label': subHeadingList.join(' · ')
    },
    {
        "label": content.join(' · ')
    }
    ];
    if (api.context.props.recordTable == 'incident') {
        const slaConfig = api.data.record_information.output.slaConfig;
        if (slaConfig.length > 0) {
            // Set config first because emapty config means: First to breach
            recordInfoPrimaryDetails["slaTimerCfgSysId1"] = slaConfig[0].configId;
            recordInfoPrimaryDetails["slaTimerCfgSysId2"] = slaConfig.length > 1 ? slaConfig[1].configId : '';
            recordInfoPrimaryDetails["taskSysId"] = api.context.props.recordSysId;
        }
        const count = api.data.record_information.output.slaInfo.count;
        recordInfoPrimaryDetails['totalSLAs'] = count;
        const viewMoreText = api.data.record_information.output.slaInfo.buttonText;
        recordInfoPrimaryDetails['slaViewMoreText'] = viewMoreText;
        let slaViewMoreBtnARIAProps = {
            "button": {
                "aria-label": viewMoreText
            }
        };
        recordInfoPrimaryDetails['slaViewMoreBtnARIAProps'] = slaViewMoreBtnARIAProps;
    }
    var usersGrp = api.data.record_information.output.loggedInUserGroup;
    var userhasGrp = false;
    if(api.data.record_information.output.incidentInfo)
      usersGrp.forEach(function(u) {
          if(u.value === api.data.record_information.output.incidentInfo.assignmentGroup) userhasGrp = true;
      });
    recordInfoPrimaryDetails['userhasGrp'] = userhasGrp;
    var mimDuration = api.data.record_information.output.mimDuration;
    if (mimDuration && !mimDuration.increment) {
        recordInfoPrimaryDetails["staticMIMDuration"] = msToTime(mimDuration.time);
    }
    recordInfoPrimaryDetails["hideDialogLink"] = api.data.record_information.output.sourceInfo?.originInfo?.dialog?.isHidden;
    recordInfoPrimaryDetails["hideWorkNotes"] = api.data.record_information.output.sourceInfo?.originInfo?.workNotes?.isHidden;
    api.setState('recordInfoPrimaryDetails', recordInfoPrimaryDetails);
    function msToTime(duration) {
        if (duration < 1000)
            duration = 0;
        let seconds = Math.floor((duration / 1000) % 60),
            minutes = Math.floor((duration / (1000 * 60)) % 60),
            hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
            days = Math.floor((duration / (1000 * 60 * 60)) / 24);
        hours = ("0" + hours).slice(-2);
        minutes = ("0" + minutes).slice(-2);
        seconds = ("0" + seconds).slice(-2);
        if (days)
            return days + "d " + hours + "hr " + minutes + "min " + seconds + "sec";
        else
            return hours + "hr " + minutes + "min " + seconds + "sec";
    }
}
