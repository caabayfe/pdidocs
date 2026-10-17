// Keep the dashboard form opened
action.setRedirectURL(current);

var dashboardId = current.sys_id;

// Add current dashboard record
SNC.ContentUnloader.unloadMetadata(current);

//Add Dashboard Tabs
unloadMetadataTable('par_dashboard_tab', dashboardId);

//Add related canvas records
var canvasGR = new GlideRecord('par_dashboard_canvas');
canvasGR.addQuery('dashboard', dashboardId);
canvasGR.query();
while (canvasGR.next()) {
    SNC.ContentUnloader.unloadMetadata(canvasGR);
    unloadWidgets(canvasGR.getUniqueValue());
    unloadWidgetGroups(canvasGR.getUniqueValue());
}

function unloadWidgetGroups(canvasSysId) {
    var widgetGroupGR = new GlideRecord('par_dashboard_widget_group');
    widgetGroupGR.addQuery('canvas', canvasSysId);
    widgetGroupGR.query();
    while (widgetGroupGR.next()) {
        SNC.ContentUnloader.unloadMetadata(widgetGroupGR);
        unloadGroupWidgetMapping(widgetGroupGR.getUniqueValue());
    }
}

function unloadGroupWidgetMapping(groupId) {
    var widgetGroupMapGR = new GlideRecord('par_dashboard_widget_group_mapping');
    widgetGroupMapGR.addQuery('group', groupId);
    widgetGroupMapGR.query();
    while (widgetGroupMapGR.next()) {
        SNC.ContentUnloader.unloadMetadata(widgetGroupGR);
    }
}

//Add related dashboard visibility
//We won't copy the experience as it is instance specific and shouldn't be coppied between insances
unloadMetadataTable('par_dashboard_visibility', dashboardId);

//Add related filters
unloadNonMetadataTable('par_dashboard_filter', 'dashboard', dashboardId, current.sys_scope);

//Add dashboard metadata
unloadNonMetadataTable('par_dashboard_user_metadata', 'dashboard', dashboardId, current.sys_scope);

//Add related permissions
unloadNonMetadataTable('par_dashboard_permission', 'dashboard', dashboardId, current.sys_scope);

unloadCategoryArtifcats(dashboardId);

function createSysMetadataLink(documentKey, payload, tablename, scope) {
    var gr = new GlideRecord('sys_metadata_link');
    gr.initialize();
    gr.setValue('directory', 'update');
    gr.setValue('documentkey', documentKey);
    gr.setValue('payload', payload);
    gr.setValue('tablename', tablename);
    gr.setValue('sys_scope', scope);
    var sysID = gr.insert();

    // get the GlideRecord
    if (gr.get(sysID))
        return gr;
    return null;
}

function unloadMetadataTable(table, dashboardId) {
    var gr = new GlideRecord(table);
    gr.addQuery('dashboard', dashboardId);
    gr.query();
    while (gr.next())
        SNC.ContentUnloader.unloadMetadata(gr);
}

function unloadNonMetadataTable(table, field, sysId, scope) {
    var gr = new GlideRecord(table);
    gr.addQuery(field, sysId);
    gr.query();
    while (gr.next()) {
        // create a sys_metadata_link
        var sysUpdateGr = new GlideRecord('sys_update_xml');
        sysUpdateGr.addQuery('name', table + '_' + gr.getUniqueValue());
        sysUpdateGr.query();
        if (sysUpdateGr.next()) {
            var payload = sysUpdateGr.getValue('payload');
            //var sysUpdateXmlScope = sysUpdateGr.getValue('sys_scope');
            var linkGR = createSysMetadataLink(gr.getUniqueValue(), payload, table, scope);
            if (linkGR != null)
                SNC.ContentUnloader.unloadMetadata(linkGR);

            sysUpdateGr.deleteRecord();
        }
    }
}

function unloadWidgets(canvasSysId) {
    var widgetGR = new GlideRecord('par_dashboard_widget');
    widgetGR.addQuery('canvas', canvasSysId);
    widgetGR.query();
    while (widgetGR.next()) {
        SNC.ContentUnloader.unloadMetadata(widgetGR);
        unloadVisualization(widgetGR.getValue('visualization'));
        unloadStoredComponent(widgetGR.getValue('stored_component'));
    }
}

function unloadVisualization(visualizationSysId) {
    var visualizationGR = new GlideRecord('par_visualization');
    if (visualizationGR.get(visualizationSysId))
        SNC.ContentUnloader.unloadMetadata(visualizationGR);
}

function unloadStoredComponent(storedComponentSysId) {
    var parComponentGR = new GlideRecord('par_component');
    if (parComponentGR.get(storedComponentSysId)) {
        SNC.ContentUnloader.unloadMetadata(parComponentGR);
        var table = parComponentGR.sys_class_name;

        //Add par_component_permission
        if ('par_visualization' == table)
            unloadNonMetadataTable('par_visualization_permission', 'component', parComponentGR.getUniqueValue(), parComponentGR.sys_scope);

        else if ('par_component_filter' == table)
            unloadNonMetadataTable('par_component_filter_permission', 'component', parComponentGR.getUniqueValue(), parComponentGR.sys_scope);
    }
}

function unloadCategoryArtifcats(dashboardID) {
    var gr = new GlideRecord('analytics_category_m2m');
    gr.addQuery('type', 'par_dashboard');
    gr.addQuery('artifact_id', dashboardID);
    gr.query();
    while (gr.next()) {
        SNC.ContentUnloader.unloadMetadata(gr);
        unloadCategory(gr.getValue('category'));
    }
}


function unloadCategory(categoryId) {
    var gr = new GlideRecord('analytics_category');
    if (!gr.get(categoryId))
        return;

    SNC.ContentUnloader.unloadMetadata(gr);
}
