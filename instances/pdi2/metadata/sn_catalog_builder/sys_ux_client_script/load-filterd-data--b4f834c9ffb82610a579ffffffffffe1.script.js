/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const fieldProp = api.context.props.field;
    let id = '#';
    let count = 0;
    if(fieldProp && fieldProp.value !==""){
       count = parseInt(fieldProp.value);
    }

    if (fieldProp && fieldProp.targetRecordId)
        id = fieldProp.targetRecordId;
let filterParams = `cat_item=${id}`;
const defaultValues = {
                    catalog_item: id,
                    item_class_name:fieldProp.targetRecordTableName
};
api.setState('catalogItemId', id);
api.setState('itemClassName', fieldProp.targetRecordTableName);
api.setState('clientValues', defaultValues);
api.setState('clientScriptQuery',filterParams);
api.setState('editMode',fieldProp.editMode);
api.setState('listCount',count);
}
