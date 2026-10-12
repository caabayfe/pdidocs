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
        TABLE,
        EXTERNAL_DATA,
        REPORT_SOURCE,
        ARCHIVED_DATA
    } = api.state.SOURCE_TYPES;
    const {
        REFERENCE,
        CHILD
    } = api.state.RELATION_TYPES;
    const referenceFields = event.payload.data.output.data.snPo.GlidePromin.prominGetTablesRefFields.fields;
    const relationFields = [];

    for (let i = 0; i < referenceFields.length; i += 1) {
        relationFields.push({
            id: referenceFields[i].name,
            label: referenceFields[i].label,
        });
    }

    const entityForm = { ...api.state.entityForm
    };

    if (entityForm.fields.parentEntity.sourceType === EXTERNAL_DATA) {
        if (
            entityForm.fields.sourceType.selectedValue === TABLE ||
            entityForm.fields.sourceType.selectedValue === REPORT_SOURCE ||
            entityForm.fields.sourceType.selectedValue === ARCHIVED_DATA
        ) {
            if (entityForm.fields.relationType.selectedValue === REFERENCE) {
                entityForm.fields.sourceField.selectedValue = 'sys_id';
                entityForm.fields.sourceField.listItems = [{
                    id: 'sys_id',
                    label: 'sys_id'
                }];
                entityForm.fields.sourceField.disabled = true;
                entityForm.fields.targetField.listItems = relationFields;
                entityForm.fields.targetField.disabled = false;
            } else if (entityForm.fields.relationType.selectedValue === CHILD) {
                entityForm.fields.sourceField.listItems = relationFields;
                entityForm.fields.sourceField.disabled = false;
                entityForm.fields.targetField.selectedValue = 'u_case_id';
                entityForm.fields.targetField.listItems = [{
                    id: 'u_case_id',
                    label: 'u_case_id'
                }];
                entityForm.fields.targetField.disabled = true;
            }
        }
    } else if (
        entityForm.fields.parentEntity.sourceType === TABLE ||
        entityForm.fields.parentEntity.sourceType === REPORT_SOURCE ||
        entityForm.fields.parentEntity.sourceType === ARCHIVED_DATA
    ) {
        if (
            entityForm.fields.sourceType.selectedValue === TABLE ||
            entityForm.fields.sourceType.selectedValue === REPORT_SOURCE ||
            entityForm.fields.sourceType.selectedValue === ARCHIVED_DATA
        ) {
            if (entityForm.fields.relationType.selectedValue === REFERENCE) {
                entityForm.fields.sourceField.selectedValue = 'sys_id';
                entityForm.fields.sourceField.listItems = [{
                    id: 'sys_id',
                    label: 'sys_id'
                }];
                entityForm.fields.sourceField.disabled = true;
                entityForm.fields.targetField.listItems = relationFields;
                entityForm.fields.targetField.disabled = false;
            } else if (entityForm.fields.relationType.selectedValue === CHILD) {
                entityForm.fields.sourceField.listItems = relationFields;
                entityForm.fields.sourceField.disabled = false;
                entityForm.fields.targetField.selectedValue = 'sys_id';
                entityForm.fields.targetField.listItems = [{
                    id: 'sys_id',
                    label: 'sys_id'
                }];
                entityForm.fields.targetField.disabled = true;
            }
        } else if (entityForm.fields.sourceType.selectedValue === EXTERNAL_DATA) {
            if (entityForm.fields.relationType.selectedValue === REFERENCE) {
                entityForm.fields.sourceField.selectedValue = 'u_case_id';
                entityForm.fields.sourceField.listItems = [{
                    id: 'u_case_id',
                    label: 'u_case_id'
                }];
                entityForm.fields.sourceField.disabled = true;
                entityForm.fields.targetField.listItems = relationFields;
                entityForm.fields.targetField.disabled = false;
            } else if (entityForm.fields.relationType.selectedValue === CHILD) {
                entityForm.fields.sourceField.listItems = relationFields;
                entityForm.fields.sourceField.disabled = false;
                entityForm.fields.targetField.selectedValue = 'sys_id';
                entityForm.fields.targetField.listItems = [{
                    id: 'sys_id',
                    label: 'sys_id'
                }];
                entityForm.fields.targetField.disabled = true;
            }
        }
    }

    // This is entities created by Approval Analysis. They should have Document ID as the selected source field.
    if (entityForm.fields.entity.selectedValue === 'sysapproval_approver' && entityForm.fields.relationType.selectedValue === CHILD) {
        entityForm.fields.sourceField.listItems.push({
            id: 'document_id',
            label: 'Document ID',
        });
    }

    api.setState('entityForm', entityForm);
    api.setState('hideParentADsWarning', true);
}
