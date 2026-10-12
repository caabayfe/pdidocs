function handler({
    api,
    event,
    helpers,
    imports,
}) {
    const toastMessage = () => {
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: "alert5",
                status: "high",
                icon: "info-circle-outline",
                content: "You are not authorized to edit this item",
                action: {
                    type: "dismiss"
                }
            }]
        });
    };

    const setState = (api, recordId, wizardId) => {
        api.setState('recordID', recordId);
        api.setState('wizardID', wizardId);
    };

    const {
        snHttp
    } = helpers;

    const tableName = event.payload.table;
    const recordID = event.payload.row.sys_id.value;
    const itemState = event.payload.row.rowData.value.get('state').columnData.value;
    const checkEdit = true;
    var wizardID;
    if (tableName == 'sc_cat_item')
        wizardID = '38f351fe73221010c84e2bb43cf6a7ad';
    else if (tableName == 'sc_cat_item_producer')
        wizardID = '89bf83d4c7321010159ca1e603c260cd';

    snHttp(`/api/sn_sc/v1/servicecatalog/record_id/${recordID}/wizard/${wizardID}?check_edit=${checkEdit}`, {
        method: 'GET',
        batch: true,
    }).then(({
        response
    }) => {
        if (response.result === true) {
            setState(api, recordID, wizardID);
            api.setState('itemState', itemState);
            api.setState('itemDetails', {
                'recordID': recordID,
                'isPublished': (itemState == 'published') || (itemState == ''),
                'title': event.payload.row.displayValue.value
            });
        } else {
            toastMessage();
            setState(api, '', '');
            api.setState('itemDetails', null);
            return;
        }
    }).catch(({
        error
    }) => {
        toastMessage();
        setState(api, '', '');
        api.setState('itemDetails', null);
        return;
    });
}
