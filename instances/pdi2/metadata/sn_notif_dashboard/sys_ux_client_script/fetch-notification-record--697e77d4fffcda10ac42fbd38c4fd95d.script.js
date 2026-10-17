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
    async function notifHandler(response){
        var notifRecord = response.result;
        api.setState("notifRecordJSON",notifRecord);
        var parsedInput = JSON.parse(JSON.stringify(notifRecord));
        var leftKeyMappings = {
            active: await helpers.translate("State"),
            subscribable: await helpers.translate("Type"),
            category: await helpers.translate("Category"),
            table: await helpers.translate("Table"),
            application: await helpers.translate("Application")
        };
        var rightKeyMappings = {
            createdBy: await helpers.translate("Created by"),
            updatedBy: await helpers.translate("Updated by"),
            updatedOn: await helpers.translate("Updated on")
        };
        const StatusEnum = {
            ACTIVE: await helpers.translate('Active'),
            INACTIVE: await helpers.translate('Inactive'),
            SUBSCRIBABLE: await helpers.translate('Subscribable'),
            NON_SUBSCRIBABLE: await helpers.translate('Non-Subscribable'),
        };
        function getStatus(key, value) {
            switch (key) {
                case 'active':
                    return value === '1' ? StatusEnum.ACTIVE : StatusEnum.INACTIVE;
                case 'subscribable':
                    return value === '1' ? StatusEnum.SUBSCRIBABLE : StatusEnum.NON_SUBSCRIBABLE;
                default:
                    return value !== null && value.trim() !== "" ? value : "-";
            }
        }
        var createRecordDetails = (keyMappings, isLeft = true) => {
            return Object.keys(keyMappings).map(key => {
                var value = parsedInput[key];
                var type = isLeft && (key === 'active' || key === 'subscribable') ? 'highlighted-value' : 'string';
                var detailValue = isLeft ? getStatus(key, value) : value !== null ? value : "-";
                var color = isLeft && value === '1' ? 'green' : (isLeft && value === '0' ? 'orange' : "");
                var icon = isLeft && (key === 'active' ) ? (value === '1' ? 'bell-outline' : 'bell-slash-outline') : "";
                return {
                    label: keyMappings[key],
                    value: {
                        type: type,
                        ...(isLeft ? {
                            color,
                            icon,
                            label: detailValue,
                            value: detailValue
                        } : {
                            value: detailValue
                        })
                    }
                };
            });
        };
        const recordDetailsLeft = createRecordDetails(leftKeyMappings, true);
        const recordDetailsRight = createRecordDetails(rightKeyMappings, false);
        api.setState("recordDetailsLeft", recordDetailsLeft);
        api.setState("recordDetailsRight", recordDetailsRight);
        api.setState("notificationScope", parsedInput['scope']);
    };

    helpers.snHttp('api/snc/notification_dashboard/notifications/email/notifInfo', {
        method: 'POST',
        batch: false,
        body: {
            notificationID: api.state.notificationID
        }
    }).then(({
        response
    }) => {
        notifHandler(response);
    }
    );
}
