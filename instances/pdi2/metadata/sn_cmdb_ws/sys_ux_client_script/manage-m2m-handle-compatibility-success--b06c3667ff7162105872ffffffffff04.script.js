/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { isCompatible, tableLabel } = event.payload;
    helpers.translate('Manage {0}', tableLabel)
        .then((translatedText) => {
            let modalId = isCompatible ? 'm2m_mgr_modal' : 'm2m_legacy_modal'; 
            helpers.modal.open(modalId, {
                headerLabel: translatedText
            });
        });
}
