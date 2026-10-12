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
    const {
        snHttp
    } = helpers;

    api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
        loading: true,
        nonBlocking: false
    });

    snHttp(`api/sn_ads_setup/play/autocomplete/${api.context.props.sysId}`, {
            method: 'POST',
            batch: false,
            body: {
                interaction_id: api.context.props.interactionId
            }
        })
        .then(({
            response
        }) => {
            api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
                loading: false,
                nonBlocking: false
            });
            const timestamp = new Date().getTime();
            api.emit('MODAL_SELECTED', {
                modalId: "[component-id$='success_info]",
                showModal: false,
            });

            helpers.navigate.to("home", {}, {
                "customId": timestamp
            });

        })
        .catch(({
            error
        }) => {
            //TODO: Use common alert strategy
            console.log('error', error);
            api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
                loading: false,
                nonBlocking: false
            });
        });
}
