/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        showDuplicateModal,
        originalComponentData: componentData,
        actions = function() {},
        disabled
    } = api.elements.component_builder_settings ?? {};
    const deleteDisabled = disabled || api.state.componentHasUsage;
    const usageGuidelines = componentData?.usageGuidelines;
    const metadataSysId = api.context.props.componentSysId;
    const actionData = componentData?.component;
    return [{
            label: 'Application scope',
            value: {
                type: 'string',
                value: componentData?.macroponent?.sysScope?.displayValue || '-'
            },
        },
        {
            label: 'Created',
            value: {
                type: 'string',
                value: componentData?.macroponent.sysCreatedOn.displayValue.date || '-'
            }
        },
        {
            label: 'Updated',
            value: {
                type: 'string',
                value: componentData?.macroponent.sysCreatedOn.displayValue.date || '-'
            }
        },
        {
            label: 'Updated by',
            value: {
                type: 'string',
                value: componentData?.macroponent.sysUpdatedBy.displayValue || '-'
            }
        },
        {
            label: 'Actions',
            value: {
                type: 'jsx',
                value: actionData ? actions({
                    componentData: actionData,
                    deleteDisabled
                }, metadataSysId, showDuplicateModal,usageGuidelines)
                : null
            }
        }
    ];
}
