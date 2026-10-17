/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({ api, event, helpers, imports }) {
 
    const {
        maxRecordsToProcess,
        maxNotReportingDays,
        dataMismatchResult,
        coverageResult,
        dataMismatchWeight,
        coverageWeight,
        status,
        error,
        errorMessage
    } = event.payload.data.output;
    const { SUCCESS_NOTIFICATION_PROPS,
        ERROR_NOTIFICATION_PROPS,
        handleRemoveNotifications} = imports["sn_cmdb_ws.cmdbMultisourceUtil"]();

    const notifications = [];
    const currentDate = new Date().valueOf();
    const successNotificationId = 'successId' + currentDate;
    
    if (error && error.message) { // settings didn't get saved, it failed in the 'try' block and error got returned from the 'catch' block
        notifications.push({
            ...ERROR_NOTIFICATION_PROPS,
            "id" : "Settings failure " + currentDate,
            "content": await helpers.translate("Error - {0}", error.message)
        });
    }

    if(status === "success") { //overall settings got saved, it didn't fall into the "catch" block
        //go thru each of the settings and check for their status

        if(maxRecordsToProcess.status !== 'success') {
            notifications.push({
                ...ERROR_NOTIFICATION_PROPS,
                "id" : "Max records error - "+currentDate,
                "content": await helpers.translate("Error - {0}", maxRecordsToProcess.message)
            });
        }

        if(maxNotReportingDays.status !== 'success') {
            notifications.push({
                ...ERROR_NOTIFICATION_PROPS,
                "id" : "Max reporting days error - "+currentDate,
                "content": await helpers.translate("Error - {0}", maxRecordsToProcess.message)
            });
        }

        if(coverageWeight.status !== 'success') {
            notifications.push({
                ...ERROR_NOTIFICATION_PROPS,
                "id" : "Coverage Weights error - "+currentDate,
                "content": await helpers.translate("Error - {0}", coverageWeight.message)
            });
        }

        if(dataMismatchWeight.status !== 'success') {
            notifications.push({
                ...ERROR_NOTIFICATION_PROPS,
                "id" : "Data mismatch error - "+currentDate,
                "content": await helpers.translate("Error - {0}", dataMismatchWeight.message)
            });
        }

        //dataMismatchResult and coverageResult are arrays
        for(var i = 0; i < dataMismatchResult.length; i++) {
            var item = dataMismatchResult[i];
            if(item.status !== 'success') {
                notifications.push({
                    ...ERROR_NOTIFICATION_PROPS,
                    "id" : "Data Mismatch class " + i +" - "+currentDate,
                    "content": await helpers.translate("Error - {0}", item.message)
                });
            }
        }

        for(var i = 0; i < coverageResult.length; i++) {
            var item = coverageResult[i];
            if(item.status !== 'success') {
                notifications.push({
                    ...ERROR_NOTIFICATION_PROPS,
                    "id" : "Coverage class " + i +" - "+currentDate,
                    "content": await helpers.translate("Error - {0}", item.message)
                });
            }
        }
    }

    if(notifications.length < 1) {
        //no errors. We can emit a success notification.
        notifications.push({
            ...SUCCESS_NOTIFICATION_PROPS,
            "id": successNotificationId,
            "content" : await helpers.translate('Multisource settings has been updated successfully.')
        });

    }

    if (notifications.length > 0) {
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: notifications
        });
    }

    if (notifications.length > 0) {
        notifications.forEach(item => {
            handleRemoveNotifications(api.emit, item.id, helpers);
        });
    }

    api.setState('isDirty',false);
    

}
