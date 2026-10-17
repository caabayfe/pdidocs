/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    var id, rowData;
    if (event.name === 'NOW_RECORD_LIST_CONNECTED#DATA_FETCH_SUCCEEDED') {
        const {
            conversationDetails,
            favoriteToggled
        } = api.state;
        const queryRows = event.payload.model.layoutQuery.queryRows;
        if (!queryRows || queryRows.size === 0) {
            setState('', {}, false);
            return;
        }
        if (favoriteToggled) {
            api.setState('favoriteToggled', false);
            const hasConversation = queryRows.has(conversationDetails.id);
            if (hasConversation)
                return;
        }
        const record = queryRows.values().next().value;
        id = record.uniqueId;
        rowData = record.rowData;
    } else if (event.name === "NOW_RECORD_LIST_CONNECTED#ROW_CLICKED") {
        var record = event.payload.row;
        id = record.sys_id.value;
        rowData = record.rowData.value;
    }
    if (rowData) {
        const conversationObj = rowData.get('conversation');
        if (!conversationObj) {
            setState('', {}, false);
            return;
        }
        const firstCsId = conversationObj.columnData.value || '';
        const startDateString = rowData.get('conversation.sys_created_on').columnData.displayValue;
        const startDate = new Date(startDateString);
        const durationString = rowData.get('duration').columnData.value;
        const duration = new Date(durationString);
        const formattedStartTime = formatDate(startDate);
        const formattedDuration = formatDate(duration);
        const localizedDuration = new Date(Date.UTC(duration.getFullYear(), duration.getMonth(), duration.getDate(), duration.getHours(), duration.getMinutes(), duration.getSeconds()));
        const endDate = new Date(startDate.getTime() + localizedDuration.getTime());
        const formattedEndTime = formatDate(endDate);
        const user_name = api.data.show_hashed_user_id_1.output == "true" ? rowData.get('conversation.consumer.user_id.hashed_user_id').columnData.displayValue : rowData.get('conversation.consumer.user_id.user_name').columnData.displayValue;
        const type = rowData.get('type').columnData.displayValue;
        const channel_name = rowData.get('conversation.device_type').columnData.displayValue;
        const isFavorite = rowData.get('favorite').columnData.value == 'true';
        const start_date_time = startDateString;

        const details = {
            id,
            user_name,
            type,
            channel_name,
            start_date_time,
            start_time: formattedStartTime,
            end_time: formattedEndTime,
            duration: formattedDuration
        };
        setState(firstCsId, details, isFavorite);
    }

    function formatDate(date) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    function setState(id, details, isFavorite) {
        api.setState('conversationId', id);
        api.setState('conversationDetails', details);
        api.setState('isFavorite', isFavorite);
        let tooltipText = isFavorite ? 'Remove from favorites' : 'Mark as favorite';
        helpers.translate(tooltipText).then((translatedTooltip) => {
            api.setState('favoriteTooltip', translatedTooltip);
        });
    }
}
