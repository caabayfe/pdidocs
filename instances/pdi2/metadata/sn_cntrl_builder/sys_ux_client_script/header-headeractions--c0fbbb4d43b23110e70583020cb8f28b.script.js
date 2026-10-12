/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const isSaving = api.elements.builder_core.isSaving || api.elements.controller_builder.isSaving;
    const disabled = api.elements.builder_core.isMacroponentReadOnly || (!api.elements.controller_builder.isDirty && !api.elements.builder_core.isMacroponentDirty);
    const buttonText = helpers.translateSync('Save');
    return [{
        className: 'editor-header--save now-m-inline-end--sm',
        configAria: {
            'aria-label': buttonText
        },
        label: buttonText,
        variant: !disabled ? 'primary' : 'secondary',
        disabled: disabled || isSaving,
        tooltipContent: buttonText,
        appendToPayload: {
            headerAction: 'SN_UIBTK_EDITOR_HEADER#SAVE_CLICKED',
            context: 'saveButton'
        },
        'hook-update': (old, vnode) => {
            if (!old.data.props.disabled && vnode.data.props.disabled) {
                vnode.elm.blur();
            }
        }
    }];
}
