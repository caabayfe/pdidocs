function handler({
    api,
    event,
    helpers,
    imports
}) {
    const NO_EDIT_ACCESS_MSG = "You are not authorized to edit this item";
    const ITEM_IN_REVIEW = "Item is in review. To edit this item go to Catalog items tab";

    const toastMessage = (msg) => {
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: "alert5",
                status: "high",
                icon: "info-circle-outline",
                content: msg,
                action: {
                    type: "dismiss"
                }
            }]
        });
    };

    const setState = (api, recordId, wizardId, recordName) => {
        api.setState('recordID', recordId);
        api.setState('wizardID', wizardId);
        api.setState('recordName', recordName);
    };

    const {
        modal,
        snHttp
    } = helpers;

    const tableName = event.payload.table;
    const recordID = event.payload.row.sys_id.value;
    const itemState = event.payload.row.rowData.value.get('state').columnData.value;

    if (itemState === 'in_review') {
        toastMessage(ITEM_IN_REVIEW);
        return;
    }

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
            setState(api, recordID, wizardID, event.payload.row.displayValue.value);
            modal.open("[component-id$='checkout_modal']");
            return;
        } else {
            toastMessage(NO_EDIT_ACCESS_MSG);
            setState(api, '', '', '');
            return;
        }
    }).catch(({
        error
    }) => {
        toastMessage(NO_EDIT_ACCESS_MSG);
        setState(api, '', '', '');
        return;
    });
}
