/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    if (event.context.item) {
        const dropdownVals = api.data.create_change_landing_dropdown_values.output.result;
        const editIndex = (dropdownVals.findIndex(function(item){
            return item.id === 'edit';
        }));
        const proposeIndex = (dropdownVals.findIndex(function(item){
            return item.id === 'propose';
        }));
        const createIndex = (dropdownVals.findIndex(function(item){
            return item.id === 'create';
        }));

        if (!api.state.selectedCard || api.state.selectedCard.index !== event.context.item.index) {
            const selectedCard = JSON.parse(JSON.stringify(event.context.item));

            let newChangeQuery = '';
            if (selectedCard.value.sys_class_name === 'std_change_record_producer' && !api.state.typeCompat)
                newChangeQuery = `chg_model=e55d0bfec343101035ae3f52c1d3ae49^std_change_producer_version=${selectedCard.value.versionId}`;
            else if (selectedCard.value.sys_class_name === 'std_change_record_producer' && api.state.typeCompat)
                newChangeQuery = `type=standard^std_change_producer_version=${selectedCard.value.versionId}`;
            else if (selectedCard.value.sys_class_name === 'sn_sow_interceptor_record_type_selector')
                newChangeQuery = selectedCard.value.qry;
            else
                newChangeQuery = 'chg_model=' + selectedCard.value.sysId;
            api.setState('newChangeQuery', newChangeQuery);

            selectedCard.value.query = newChangeQuery;
            selectedCard.value.targetTable = selectedCard.value.targetTableName || 'change_request';
            api.setState('selectedCard', selectedCard);

            dropdownVals[proposeIndex].disabled = true;
            dropdownVals[createIndex].disabled = true;
            if (event.context.item.value.sys_class_name === 'chg_model') {
                if (dropdownVals[editIndex].canEditModel) {
                    dropdownVals[editIndex].disabled = false;
                    dropdownVals[editIndex].label = dropdownVals[editIndex].modelLabel;
                }
                if (dropdownVals[createIndex].canCreateTemplate)
                    dropdownVals[createIndex].disabled = false;
            } else if (
                (event.context.item.value.sys_class_name === 'std_change_record_producer' && dropdownVals[editIndex].canCreateProposal) ||
                (event.context.item.value.sys_class_name === 'chg_template' && dropdownVals[editIndex].canEditTemplate)
            ) {
                dropdownVals[editIndex].disabled = false;
                dropdownVals[editIndex].label = dropdownVals[editIndex].templateLabel;
            }
            api.setState('dropdownValues', dropdownVals);
        } else {
            api.setState('selectedCard', null);
            if (dropdownVals[proposeIndex].canCreateProposal)
                dropdownVals[proposeIndex].disabled = false;
            dropdownVals[createIndex].disabled = true;
            dropdownVals[editIndex].disabled = true;
            api.setState('dropdownValues', dropdownVals);
        }
    }
}
