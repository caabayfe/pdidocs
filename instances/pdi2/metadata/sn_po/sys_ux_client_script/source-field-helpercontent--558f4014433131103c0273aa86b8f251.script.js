/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const entityForm = { ...api.state.entityForm
    };
    const {
        REFERENCE,
        CHILD
    } = api.state.RELATION_TYPES;

    if (
        !entityForm.fields.relationType.selectedValue ||
        !entityForm.fields.parentEntity.tableName ||
        !entityForm.fields.entity.tableName
    ) {
        return '';
    } else if (entityForm.fields.relationType.selectedValue === REFERENCE) {
        return helpers.translateSync('Field from "{0}" table which has relation with "{1}" table', entityForm.fields.parentEntity.tableName, entityForm.fields.entity.tableName);
    } else if (entityForm.fields.relationType.selectedValue === CHILD) {
        return helpers.translateSync('Field from "{0}" table which has relation with "{1}" table', entityForm.fields.entity.tableName, entityForm.fields.parentEntity.tableName);
    }

    return '';
}
