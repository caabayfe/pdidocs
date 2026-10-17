// Keep the dashboard form opened
action.setRedirectURL(current);

var dashboardId = current.sys_id;

// Add current dashboard record
unloadWithReadOnlyPolicy(current);

//Add Dashboard Tabs
unloadMetadataTable('par_dashboard_tab', dashboardId);

//Add related canvas records
var canvasGR = new GlideRecord('par_dashboard_canvas');
canvasGR.addQuery('dashboard', dashboardId);
canvasGR.query();
while (canvasGR.next()) {
    unloadWithReadOnlyPolicy(canvasGR);
    unloadWidgets(canvasGR.getUniqueValue());
    unloadWidgetGroups(canvasGR.getUniqueValue());
}

//Add related dashboard visibility
//We won't copy the experience as it is instance specific and shouldn't be coppied between insances
unloadMetadataTable('par_dashboard_visibility', dashboardId);

//Add related filters
unloadMetadataTable('par_dashboard_filter', dashboardId);

//Add dashboard metadata
unloadMetadataTable('par_dashboard_user_metadata', dashboardId);

//Add related permissions
unloadMetadataTable('par_dashboard_permission', dashboardId);

unloadCategoryArtifcats(dashboardId);

function unloadMetadataTable(table, dashboardId) {
    var gr = new GlideRecord(table);
    gr.addQuery('dashboard', dashboardId);
    gr.query();
    while (gr.next())
        unloadWithReadOnlyPolicy(gr);
}

function unloadWidgets(canvasSysId) {
    var widgetGR = new GlideRecord('par_dashboard_widget');
    widgetGR.addQuery('canvas', canvasSysId);
    widgetGR.query();
    while (widgetGR.next()) {
        unloadWithReadOnlyPolicy(widgetGR);
        unloadVisualization(widgetGR.getValue('visualization'));
        unloadStoredComponent(widgetGR.getValue('stored_component'));
    }
}

function unloadWidgetGroups(canvasSysId) {
    var widgetGroupGR = new GlideRecord('par_dashboard_widget_group');
    widgetGroupGR.addQuery('canvas', canvasSysId);
    widgetGroupGR.query();
    while (widgetGroupGR.next()) {
        unloadWithReadOnlyPolicy(widgetGroupGR);
        unloadGroupWidgetMapping(widgetGroupGR.getUniqueValue());
    }
}

function unloadGroupWidgetMapping(groupId) {
    var widgetGroupMapGR = new GlideRecord('par_dashboard_widget_group_mapping');
    widgetGroupMapGR.addQuery('group', groupId);
    widgetGroupMapGR.query();
    while (widgetGroupMapGR.next()) {
        unloadWithReadOnlyPolicy(widgetGroupMapGR);
    }
}


function unloadVisualization(visualizationSysId) {
    var visualizationGR = new GlideRecord('par_visualization');
    if (visualizationGR.get(visualizationSysId))
        unloadWithReadOnlyPolicy(visualizationGR);

}

function unloadStoredComponent(storedComponentSysId) {
    var parComponentGR = new GlideRecord('par_component');
    if (parComponentGR.get(storedComponentSysId)) {
        unloadWithReadOnlyPolicy(parComponentGR);
        var table = parComponentGR.sys_class_name;

        //Add par_component_permission
        if ('par_visualization' == table) {
            var visGR = new GlideRecord('par_visualization_permission');
            if (visGR.get(parComponentGR.getUniqueValue()))
                unloadWithReadOnlyPolicy(visGR);
        } else if ('par_component_filter' == table) {
            var filterGR = new GlideRecord('par_component_filter_permission');
            if (filterGR.get(parComponentGR.getUniqueValue()))
                unloadWithReadOnlyPolicy(filterGR);
        }
    }
}

function unloadWithReadOnlyPolicy(gr) {
    var updated = false;
    if (gs.nil(gr.getValue('sys_policy'))) {
        gr.setValue('sys_policy', 'read');
        gr.setWorkflow(false);
        if (gr.update())
            updated = true;
    }
    SNC.ContentUnloader.unloadMetadata(gr);
    if (updated) {
        gr.setValue('sys_policy', '');
        gr.setWorkflow(false);
        gr.update();
    }
}

function unloadCategoryArtifcats(dashboardID) {
    var gr = new GlideRecord('analytics_category_m2m');
    gr.addQuery('type', 'par_dashboard');
    gr.addQuery('artifact_id', dashboardID);
    gr.query();
    while (gr.next()) {
        unloadWithReadOnlyPolicy(gr);
        unloadCategory(gr.getValue('category'));
    }
}


function unloadCategory(categoryId) {
    var gr = new GlideRecord('analytics_category');
    if (!gr.get(categoryId))
        return;

    unloadWithReadOnlyPolicy(gr);
}
