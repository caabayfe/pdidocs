var EmailComposerTinyMCEV6Upgrade = function() {
    var RENAMED_TOOLBAR_ITEMS = SnEmailEditorTinyMCEV6Constants.RENAMED_TOOLBAR_ITEMS;
    var utils = SnEmailEditorTinyMCEUtils(),
        renameToolbar = utils.renameToolbar,
        addFormatPainterPlugin = utils.addFormatPainterPlugin,
        flow = utils.flow;
    var tinyDAO = SnEmailEditorTinyMCEDAO(),
        getV5Props = tinyDAO.getV5Props;
    var copySysProps = function() {
        // Copies over the v5 sys props to v6+ while pre-processing them
        // as defined by the processing map
        var processProps = function(processMap, v5Props) {
            // Get the v5 sys-properties
            var sysPropsGR = new GlideRecord('sys_properties');
            sysPropsGR.addEncodedQuery(
                'nameINglide.ui.email.composer.toolbar'
            );
            sysPropsGR.query();
            sysPropsGR.autoSysFields(false);
            sysPropsGR.setWorkflow(false);
            // Copy the contents of the old records into the new records
            while (sysPropsGR.next()) {
                var name = sysPropsGR.name;
                var value = sysPropsGR.value.trim();
                var newValue = value;
                var processObj = processMap[name];
                if (processObj) {
                    var from = processObj.from;
                    var processor = processObj.process;
                    if (processor && v5Props[from]) {
                        newValue = processor(v5Props[from]);
                    }
                }
                newValue = newValue.trim();
                if (value !== newValue) {
                    sysPropsGR.setValue('value', newValue);
                    sysPropsGR.update();
                }
            }
        };
        // Create a processing map
        var getProcessingMap = function() {
            return {
                'glide.ui.email.composer.toolbar': {
                    from: 'glide.ui.html.editor.v5.toolbar',
                    process: flow(
                        addFormatPainterPlugin(),
                        renameToolbar(RENAMED_TOOLBAR_ITEMS)
                    )
                }
            };
        };
        processProps(getProcessingMap(), getV5Props());
    };
    return {
        fix: function() {
            copySysProps();
        }
    };
};
