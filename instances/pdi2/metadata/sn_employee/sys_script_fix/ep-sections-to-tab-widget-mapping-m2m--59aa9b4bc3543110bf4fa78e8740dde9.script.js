// Create default section entries for tab widget mapping into new M2M table
createEntriesInMtoM();

function createEntriesInMtoM() {
    // Create array of section and populate new m2m table
    var sectionsList = [];
    var sectionGr = new GlideRecord("sn_employee_overview_section");
    sectionGr.query();
    while (sectionGr.next()) {
        var sectionObj = {
            sysId: sectionGr.getUniqueValue(),
            order: sectionGr.getValue("order"),
            active: sectionGr.getValue("active")
        };
        sectionsList.push(sectionObj);
    }
    if (sectionsList.length) {
        var tabWidgetMapGr = new GlideRecord("sn_employee_tab_widget_mapping");
        tabWidgetMapGr.addQuery("widget", "56fc512453333010fedfddeeff7b1273"); // Query for Employee Profile Overview widget only
        tabWidgetMapGr.query();
        while (tabWidgetMapGr.next()) {
            sectionsList.forEach(function(section) {
                var tabWidgetSectionMtomGr = new GlideRecord("sn_employee_m2m_tabwidget_section");
                tabWidgetSectionMtomGr.initialize();
                tabWidgetSectionMtomGr.setValue(tabWidgetMapGr.getTableName(), tabWidgetMapGr.getUniqueValue());
                tabWidgetSectionMtomGr.setValue("sn_employee_overview_section", section.sysId);
                tabWidgetSectionMtomGr.setValue("active", section.active);
                tabWidgetSectionMtomGr.setValue("order", section.order);
                tabWidgetSectionMtomGr.insert();
            });
        }
    } else {
        gs.info(gs.getMessage("Widget Mapping fix script: There are no sections available to process"));
    }
}
