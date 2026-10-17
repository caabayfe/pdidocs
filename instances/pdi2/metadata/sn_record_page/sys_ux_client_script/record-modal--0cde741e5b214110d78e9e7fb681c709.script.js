/**
 * @param {params} params
 * @param {api} params.api
 * @param {event} params.event
 * @param {imports} params.imports
 */
 function handleRecordModalOperation({
    api,
    event,
    imports,
    helpers
}) {

    const { name, meta = {}, payload: { route, fields = {}, params, size = 'md', ariaLabel, resizableConfig = {}, customSize = {} } } = event;
if (name === 'SN_FORM_DATA_CONNECTED#CLOSE_MODAL')
    helpers.modal.close();

if (name === 'RECORD#CLOSE_MODAL' || name === 'SN_FORM_DATA_CONNECTED#CLOSE_MODAL')
    api.setState('contents', null);

else if (name === 'RECORD#OPEN_MODAL' || name === 'SN_FORM_DATA_CONNECTED#OPEN_MODAL') {
    if (!route)
        return;
    const { label, fieldType, referenceField, relatedListName } = fields;
    var  modalSize = ""; 
    if(fieldType === 'reference' || fieldType === 'glide_list'){
        modalSize = api.data?.glide_form_1?.nowRecordFormBlob?.currentUser?.formLayoutConfig?.referenceModalSize?.[referenceField] || "";
    } else if(relatedListName){
        modalSize = api.data?.glide_form_1?.nowRecordFormBlob?.currentUser?.formLayoutConfig?.relatedListModalSize?.[relatedListName] || "";
    }
    let displayOptions = {
        size: size,
            label: ariaLabel || label,
            customSize: modalSize
        }
        if (Object.keys(resizableConfig).length !== 0) {
            displayOptions.resizableConfig = resizableConfig;
        }
        if (Object.keys(customSize).length !== 0) {
            displayOptions.customSize = modalSize || customSize;
    }

    if (fieldType === 'reference') {
        displayOptions = {
            ...displayOptions,
            customSize: modalSize
        }
    }
    if(params)
      params.userID = api?.context?.session?.user?.sys_id;
    api.setState('bare', true);
    api.setState('displayOptions', displayOptions);
    api.setState('contents', {
        route: route,
        fields: fields,
        params: params,
        meta: meta
    });
}
}
