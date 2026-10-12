/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var related_records = api.data.rule_management_dmc.ruleData?.archive?.related_records;
    if(!related_records) return [];

    function getRows(related_records) {
      return related_records.map((record, index) => {
        var {action, reference, reference_rule, sys_id} = record;
        var [reference_table, reference_element, relationship] = reference.value.split('.');
        if(!sys_id) return;
        return {
            cells: {
                action: {
                    value: action
                },
                reference: {
                    value: reference.item.label
                },
                reference_rule: {
                    value: reference_rule?.item?.label
                },
                reference_table: {
                    value: reference_table
                },
                reference_element: {
                    value: reference_element
                },
                edit: {
                    value: "edit_archive_related",
                    componentProps: {
                        "label": "Edit",
                        "size": "sm",
                        "variant": "secondary"
                    }
                }
            },
            key: sys_id
        };
      });
    }

    return {
        rows: getRows(related_records),
        customCellEmittedActions: [
            'NOW_BUTTON#CLICKED'
        ],
    };
}
