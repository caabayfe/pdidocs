/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const { ERROR_NOTIFICATION_PROPS, handleRemoveNotifications} = imports["sn_cmdb_ws.cmdbMultisourceUtil"]();   //const emit = api.emit;

    const errorNotifications = [];
    let coverageWeightsType;
    let coverageClasses;
    let dateMismatchWeightsType;
    let dataMismatchClasses;
    let maxNumberOfRecords; 
    let notReportingMaxDays; 
    const currentDate =  new Date().valueOf();

    //don't let user save unless they have cmdb_ms_admin role
    if(!api.data.ms_show_settings.output) {
        errorNotifications.push({
            ...ERROR_NOTIFICATION_PROPS,
            "id" : "unauthorized - "+currentDate,
            "content": await helpers.translate("Error - you are not authorized to save multisource settings.")
        });
    } else {
        api.setState('isDirty',false);
        // Check Coverage Settings Classes for weights total
        coverageWeightsType = api.state.coverageWeightsType;
        coverageClasses = api.state.coverageClasses.map((x) => x);
        if(coverageWeightsType === 'manual') {
            let totalPercent = 0;
            var classesWithoutPct = [];
            coverageClasses.forEach(function(element) {
                var pct_count = parseFloat(element.ci_count_percent);
                if(pct_count < 0 || pct_count > 100 || element.ci_count_percent === '') {
                    classesWithoutPct.push(element.table_label);
                } else {
                    totalPercent += parseFloat(element.ci_count_percent);
                }
            });
            if(totalPercent > 100) {
                errorNotifications.push({
                    ...ERROR_NOTIFICATION_PROPS,
                    "id" : "coverage overweight - "+currentDate,
                    "content": await helpers.translate("Error - Coverage class weights total is above 100%")
                });
            }

            if(classesWithoutPct.length > 0) {
                errorNotifications.push({
                    ...ERROR_NOTIFICATION_PROPS,
                    "id" : "coverage invalid weight - "+currentDate,
                    "content": await helpers.translate("The following coverage classes have missing or invalid weight values: {0}",classesWithoutPct.join(','))
                });
            }
        } else {
            // Automatically set percentage.
            let autoPercent = Math.floor(100 / coverageClasses.filter(x => !x.exclude).length);
            coverageClasses.filter(x => !x.exclude).forEach(element => element.ci_count_percent = autoPercent);
        }

        // Check Data Mismatch Classes for weights total
        dateMismatchWeightsType = api.state.dataMismatchWeightsType;
        dataMismatchClasses = api.state.dataMismatchClasses.map((x) => x);

        //validate all data mismatch classes have at least 1 attribute selected
        var classesWithoutAttributes = [];
        dataMismatchClasses.forEach(function(element) {
            //check for empty attributes array
            if(element.attributes.length <  1) {
                classesWithoutAttributes.push(element.table_label);
            }
        });

        if(classesWithoutAttributes.length > 0) {
            errorNotifications.push({
                ...ERROR_NOTIFICATION_PROPS,
                "id" : "Data Mismatch attributes - "+currentDate,
                "content": await helpers.translate("Error - Attributes have not been selected for the following data mismatch classes - {0}",classesWithoutAttributes.join(','))
            }); 
        }

        if(dateMismatchWeightsType === 'manual') {
            let totalPercent = 0;
            var classesWithoutPct = [];
            dataMismatchClasses.forEach(function(element) {
                var pct_count = parseFloat(element.ci_count_percent);
                if(pct_count < 0 || pct_count > 100 || element.ci_count_percent === '') {
                    classesWithoutPct.push(element.table_label);
                }
                totalPercent += parseInt(element.ci_count_percent);

            }); 
            if(totalPercent > 100) {
                errorNotifications.push({
                    ...ERROR_NOTIFICATION_PROPS,
                    "id" : "Data Mismatch overweight - "+currentDate,
                    "content": await helpers.translate("Error - Data mismatch class weights total is above 100%")
                });
            }
            if(classesWithoutPct.length > 0) {
                errorNotifications.push({
                    ...ERROR_NOTIFICATION_PROPS,
                    "id" : "Data Mismatch invalid weight - "+currentDate,
                    "content": await helpers.translate("The following data mismatch classes have missing or invalid weight values: {0}",classesWithoutPct.join(','))
                });
            }
        } else {
            // Automatically set percentage.
            let autoPercent = Math.floor(100 / dataMismatchClasses.length);
            dataMismatchClasses.forEach(element => element.ci_count_percent = autoPercent);
        }
        
        maxNumberOfRecords = api.state.maxNumberOfRecords; 
        var settingsStatus = JSON.parse(JSON.stringify(api.state.settingsStatus));
        if(!settingsStatus.maxNumberOfRecords.valid) {
            errorNotifications.push({
                ...ERROR_NOTIFICATION_PROPS,
                "id" : "Max num records - "+currentDate,
                "content": await helpers.translate(settingsStatus.maxNumberOfRecords.invalidReason)
            }); 
        }

        notReportingMaxDays = api.state.notReportingMaxDays; 
        if(!settingsStatus.notReportingMaxDays.valid) {
            errorNotifications.push({
                ...ERROR_NOTIFICATION_PROPS,
                "id" : "Disco not reporting - "+currentDate,
                "content": await helpers.translate(settingsStatus.notReportingMaxDays.invalidReason)
            });
        }
    }

    

    if(errorNotifications.length > 0) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: errorNotifications
        });

        if (errorNotifications.length > 0) {
            errorNotifications.forEach(item => {
                handleRemoveNotifications(api.emit, item.id, helpers);
            });
        }
    } else {
        //there are no errors. Execute the data broker
        api.data.saveSettings.execute({settings: {
            maxRecordsToProcess: maxNumberOfRecords,
            notReportingMaxDays: notReportingMaxDays,
            coverageClasses: coverageClasses,
            coverageWeightType: coverageWeightsType,
            dataMismatchClasses: dataMismatchClasses,
            dataMismatchWeightType : dateMismatchWeightsType
        }});
    }

}
