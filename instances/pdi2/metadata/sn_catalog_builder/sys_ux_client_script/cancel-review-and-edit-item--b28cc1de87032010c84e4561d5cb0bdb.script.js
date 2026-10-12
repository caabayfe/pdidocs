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

    const {
        snHttp,
        modal,
        screen,
    } = helpers;

    const recordID = api.state.recordID;
    const wizardID = api.state.wizardID;

    api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
        id: "blocking",
        loading: true,
        blocking: true,
        label: "Opening item for edit"
    });

    snHttp(`/api/sn_sc/v1/servicecatalog/items/${recordID}/versioning/cancel_review`, {
            method: 'PUT',
            batch: true
        })
        .then(({
            response
        }) => {
            api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
                id: "blocking",
                loading: false
            });
            api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
                id: 'non_blocking',
                loading: false
            });
            if (response.result.errMsg) {
                api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                    items: [{
                        id: "alert5",
                        status: "high",
                        icon: "info-circle-outline",
                        content: "This item review cannot be cancelled now",
                        action: {
                            type: "dismiss"
                        }
                    }]
                });
                return;
            }
            helpers.navigate.to("wizard", {
                sysId: wizardID
            }, {
                mode: 'normal',
                recordId: recordID,
                templateId: ''
            });
        })
        .catch(({
            error
        }) => {
            api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
                id: "blocking",
                loading: false
            });
            api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
                id: 'non_blocking',
                loading: false
            });
            api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                items: [{
                    id: "alert5",
                    status: "high",
                    icon: "info-circle-outline",
                    content: "This item review cannot be cancelled now",
                    action: {
                        type: "dismiss"
                    }
                }]
            });
            return;
        });
}
