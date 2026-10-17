function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    if (newValue === "true" && g_form.getValue("props") === '') {
        g_form.setValue("props", '{"recenterThresholdPercentage": 100, "retainNodeEdgePositions": false,"retainGroupExpansions": false, "additionalNodeProps": [], "additionalEdgeProps": [], "replaceSelectedNode": false, "wcagV2Enabled": false, "wcagEvents": ["click","editable","contextMenu"], "allowAdditionToGroup": false, "loaderConfig": { "enableLoader": false, "customLoaderImg": "" }}');
    }
}
