function getPaletteOptions($, go, dispatch, uuidv4, resolveThemeVariable, getTranslatedMessage, paletteHandlers) {
    return {
        maxSelectionCount: 1,
        allowDelete: false,
        'draggingTool.doActivate': function() {
            go.DraggingTool.prototype.doActivate.call(this);
            this.diagram.findLayer('Tool').opacity = 0.5;
        },
        'draggingTool.doDeactivate': function() {
            go.DraggingTool.prototype.doDeactivate.call(this);
            this.diagram.findLayer('Tool').opacity = 1;
        },
        'contextMenuTool.standardMouseClick': function() {
            return false;
        }
    };
}
