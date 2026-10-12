/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        isEmptyObj,
        buildErrorNotificationItems,
        isEmpty,
        areObjectsEqual
    } = imports["sn_cmdb_ws.ExploreCIUtils"](...arguments);
    
    const { 
        formData,
        fieldsMetadata,
        formDataToSave: prevFormDataToSave
    } = api.state;
    
    const {
        table,
        sysId
    } = api.context.props;

    if(isEmptyObj(formData))
        return ;

    const emptyMandatoryFields = [];
    for(let field in formData) {
        if(!fieldsMetadata[field]?.mandatory)
            continue;
        if(isEmpty(formData[field]))
            emptyMandatoryFields.push(field);
    }

    if(emptyMandatoryFields.length==0) {
        //only pass fields updated in the current section
        const formDataToSave = Object.fromEntries(
            Object.entries(formData).filter(([field]) => field in fieldsMetadata)
        );

        //remove all field messages before saving
        api.setState('fieldsMetadata', ({currentValue}) => {
            const newFieldsMetadata = {};
            for (let field in currentValue) {
                const fieldData = currentValue[field];
                newFieldsMetadata[field] = {
                    ...fieldData,
                    messages: []
                };
            }
            return newFieldsMetadata;
        });

        api.setState('maskedAttributes', []); //clear value before saving

        //need to manually refresh if formDataToSave is unchanged
        if(areObjectsEqual(formDataToSave, prevFormDataToSave))
            api.data.update_ci.refresh();
        else
            api.setState('formDataToSave', formDataToSave); //this will execute the Update CI composite data broker
    } else {
        const displayEmptyMandatoryFieldsMsg = async (fields) => {
            const content = await helpers.translate('The following mandatory fields are not filled in: {0}', fields.join(', '));
            const items = buildErrorNotificationItems({
                content, 
                id: 'empty-mandatory-fields-error'
            });
            api.emit('EXPLORE_CI_FORM_CONTROLLER#ADD_NOTIFICATIONS', {
                items
            });
        };

        displayEmptyMandatoryFieldsMsg(emptyMandatoryFields.map(field => fieldsMetadata[field]?.label || fieldsMetadata[field]?.name));
    }
}
