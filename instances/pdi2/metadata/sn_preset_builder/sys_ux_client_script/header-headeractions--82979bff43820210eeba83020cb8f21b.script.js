/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const headerActionArrayFromBC = api.elements.builder_core.headerActions;
    const canSave = api.elements.preset_builder.isPresetDirty && !api.elements.builder_core.isSaving && !api.elements.builder_core.isMacroponentReadOnly;
    return headerActionArrayFromBC ? headerActionArrayFromBC.map((action) => {
        if (action.appendToPayload.context === 'saveButton') {
            return {
                ...action,
                variant: canSave ? 'primary' : 'secondary',
                disabled: !canSave
            };
        }
        return action;
    }) : [];
}
