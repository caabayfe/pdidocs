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
        isMacroponentDirty,
        isSaving,
        isLoading
    } = api.elements.builder_core ?? {};
    const {
        isComponentDirty
    } = api.elements.component_builder ?? {};

    const preventSave = !isComponentDirty && !isMacroponentDirty;
    if(!api.elements.builder_core.headerActions) {
        return [];
    }
    const [saveButton, ...headerActions] = api.elements.builder_core.headerActions;

    return [{ ...saveButton,
        variant: preventSave ? 'secondary' : 'primary',
        disabled: preventSave || isSaving || isLoading
    }, ...headerActions];
}
