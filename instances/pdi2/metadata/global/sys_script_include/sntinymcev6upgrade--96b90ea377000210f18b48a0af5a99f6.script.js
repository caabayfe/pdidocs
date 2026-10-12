var SnTinyMCEV6Upgrade = function() {
    var RENAMED_TOOLBAR_ITEMS = SnTinyMCEV6Constants.RENAMED_TOOLBAR_ITEMS,
        OBSOLETE_PLUGINS = SnTinyMCEV6Constants.OBSOLETE_PLUGINS,
        NEW_PLUGINS = SnTinyMCEV6Constants.NEW_PLUGINS,
        NEW_TOOLBAR_ITEMS = SnTinyMCEV6Constants.NEW_TOOLBAR_ITEMS,
        RENAMED_PLUGINS = SnTinyMCEV6Constants.RENAMED_PLUGINS;
    var utils = SnTinyMCEUtils(),
        splitPlugins = utils.splitPlugins,
        splitToolbars = utils.splitToolbars,
        filterOut = utils.filterOut,
        rename = utils.rename,
        renameToolbar = utils.renameToolbar,
        addItems = utils.addItems,
        join = utils.join,
        sort = utils.sort,
        flow = utils.flow,
        uniq = utils.uniq;
    var tinyDAO = SnTinyMCEDAO(),
        getV5Props = tinyDAO.getV5Props;

    var copySysProps = function() {

        // Copies over the v5 sys props to v6+ while pre-processing them
        // as defined by the processing map
        var processProps = function(processMap, v5Props) {
            // Get the v5 sys-properties
            var sysPropsGR = new GlideRecord('sys_properties');
            sysPropsGR.addEncodedQuery(
                'nameINglide.ui.html.editor.languages,glide.ui.html.editor.enabled_plugins,glide.ui.html.editor.toolbar,glide.ui.html.editor.font.collection,glide.ui.html.editor.paste.word_import,glide.ui.html.editor.paste.html_import,glide.ui.html.editor.toolbar.valid_buttons,glide.ui.html.editor.valid_plugins'
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

                    if (processor) {
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
                'glide.ui.html.editor.languages': {
                    from: 'glide.ui.html.editor.v5.langauges'
                },
                'glide.ui.html.editor.enabled_plugins': {
                    from: 'glide.ui.html.editor.v5.enabled_plugins',
                    process: flow(
                        splitPlugins,
                        filterOut(OBSOLETE_PLUGINS),
                        rename(RENAMED_PLUGINS),
                        addItems(NEW_PLUGINS),
                        uniq,
                        sort,
                        join
                    )
                },
                'glide.ui.html.editor.toolbar': {
                    from: 'glide.ui.html.editor.v5.toolbar',
                    process: flow(
                        renameToolbar(RENAMED_TOOLBAR_ITEMS),
                        sort,
                        join
                    )
                },
                'glide.ui.html.editor.font.collection': {
                    from: 'glide.ui.html.editor.v5.font.collection'
                },
                'glide.ui.html.editor.paste.word_import': {
                    from: 'glide.ui.html.editor.v5.paste.word_import'
                },
                'glide.ui.html.editor.paste.html_import': {
                    from: 'glide.ui.html.editor.v5.paste.html_import'
                },
                'glide.ui.html.editor.toolbar.valid_buttons': {
                    from: 'glide.ui.html.editor.v5.toolbar.valid_buttons',
                    process: flow(renameToolbar(RENAMED_TOOLBAR_ITEMS), splitToolbars, addItems(NEW_TOOLBAR_ITEMS), uniq, sort, join)
                },
                'glide.ui.html.editor.valid_plugins': {
                    from: 'glide.ui.html.editor.v5.valid_plugins',
                    process: flow(
                        splitPlugins,
                        filterOut(OBSOLETE_PLUGINS),
                        rename(RENAMED_PLUGINS),
                        addItems(NEW_PLUGINS),
                        uniq,
                        sort,
                        join
                    )
                }
            };
        };

        processProps(getProcessingMap(), getV5Props());
    };

    var transformV5Plugins = function(plugins) {
        if (!plugins)
            return plugins;

        return flow(
            splitPlugins,
            filterOut(OBSOLETE_PLUGINS),
            rename(RENAMED_PLUGINS),
            uniq,
            join
        )(plugins);
    };

    var transformV5Toolbar = function(toolbar) {
        if (!toolbar)
            return toolbar;

        return flow(renameToolbar(RENAMED_TOOLBAR_ITEMS))(toolbar);
    };

    return {
        fix: function() {
			// Do not need to migrate V5 properties if zbooting since it will already match with the V6+ properties.
            if (!GlidePluginManager.isZboot())
                copySysProps();
        },
        transformV5Plugins: transformV5Plugins,
        transformV5Toolbar: transformV5Toolbar
    };
};
