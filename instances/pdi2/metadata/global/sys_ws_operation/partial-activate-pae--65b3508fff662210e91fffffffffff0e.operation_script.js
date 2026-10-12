(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var artifactType = request.body.data.type;
    var sysIdArray = request.body.data.sys_id_array;

    // Function to query par_coreui_migration_bridge_dashboard table for each sys_id and update references
    function activatePAEDashboard() {
        // Array to store results
        var results = [];

        // Check if user has dashboard_admin role
        if (!gs.hasRole('dashboard_admin')) {
            var errorMsg = gs.getMessage('User does not have required role: dashboard_admin');
            gs.error(errorMsg);
            results.push({
                error: errorMsg,
                status: 'error'
            });
            return results;
        }

        // Counter for updated records
        var updatedCount = 0;

        // Loop through each sys_id in the array
        for (var i = 0; i < sysIdArray.length; i++) {
            var sysId = sysIdArray[i];

            // Create GlideRecord for the bridge table
            var grBridge = new GlideRecord('par_coreui_migration_bridge_dashboard');

            // Add query condition for sys_id
            grBridge.addQuery('pa_dashboard', sysId);

            // Add query condition for is_last = true
            grBridge.addQuery('is_last', true);

            // Execute the query
            grBridge.query();

            // Process results
            while (grBridge.next()) {
                // Get reference sys_ids
                var paDashboardSysId = grBridge.getValue('pa_dashboard');
                var parDashboardSysId = grBridge.getValue('par_dashboard');

                // Update pa_dashboard reference (set active to false)
                if (paDashboardSysId) {
                    var paDashboard = new GlideRecord('pa_dashboards');
                    if (paDashboard.get(paDashboardSysId)) {
                        paDashboard.setValue('active', false);
                        paDashboard.setValue('no_bulk_migration', true);
                        var paDashboardUpdated = paDashboard.update();
                        gs.info(gs.getMessage('Updated pa_dashboard {sysId} active=false: {status}', { sysId: paDashboardSysId, status: paDashboardUpdated ? 'Success' : 'Failed'}));
                    } else {
                        gs.warn(gs.getMessage('Could not find pa_dashboard record with sys_id: {sysId}', { sysId: paDashboardSysId }));
                    }
                }

                // Update par_dashboard reference (set active to true)
                if (parDashboardSysId) {
                    var parDashboard = new GlideRecord('par_dashboard');
                    if (parDashboard.get(parDashboardSysId)) {
                        parDashboard.setValue('active', true);
                        var parDashboardUpdated = parDashboard.update();
                        gs.info(gs.getMessage('Updated par_dashboard {sysId} active=true: {status}', { sysId: parDashboardSysId, status: parDashboardUpdated ? 'Success' : 'Failed'}));
                    } else {
                        gs.warn(gs.getMessage('Could not find par_dashboard record with sys_id: {sysId}', { sysId: parDashboardSysId }));
                    }
                }

                // Query par_dashboard_canvas for the dashboard
                var grCanvas = new GlideRecord('par_dashboard_canvas');
                grCanvas.addQuery('dashboard', parDashboardSysId);
                grCanvas.query();

                while (grCanvas.next()) {
                    var canvasSysId = grCanvas.getUniqueValue();

                    // Query par_dashboard_widget_list for each canvas
                    var grWidget = new GlideRecord('par_dashboard_widget');
                    grWidget.addQuery('canvas', canvasSysId);
                    grWidget.query();

                    while (grWidget.next()) {
                        var component = grWidget.getValue('stored_component');
                        if (component) {
                            results.push(activateComponent(component));
                        }
                    }
                }

                // Update the bridge record itself - set active field to 'next'
                grBridge.setValue('active', 'next');
                var bridgeUpdated = grBridge.update();
                gs.info(gs.getMessage('Updated bridge record {value} active=next: {status}', { value: grBridge.getUniqueValue(), status: bridgeUpdated ? 'Success' : 'Failed'}));

                // Add record to results array
                results.push({
                    sys_id: grBridge.getUniqueValue(),
                    coreui_dashboard: grBridge.getDisplayValue('pa_dashboard'),
                    pae_dashboard: grBridge.getDisplayValue('par_dashboard'),
                    active: grBridge.getValue('active'),
                    created_on: grBridge.getValue('sys_created_on')
                });

                updatedCount++;
            }
        }

        // Log or return the results
        gs.info(gs.getMessage('Found {resultLength} dashboard bridge records. Updated {count} reference records.', { resultLength: results.length, count: updatedCount}));
        return results;
    }

    // Function to activate PAE Visualization
    function activatePAEVisualization() {
        // Array to store results
        var results = [];

        // Check if user has report_admin role
        if (!gs.hasRole('report_admin')) {
            var errorMsg = gs.getMessage('User does not have required role: report_admin');
            gs.error(errorMsg);
            results.push({
                error: errorMsg,
                status: 'error'
            });
            return results;
        }

        // Counter for updated records
        var updatedCount = 0;

        // Loop through each sys_id in the array
        for (var i = 0; i < sysIdArray.length; i++) {
            var sysId = sysIdArray[i];

            // Create GlideRecord for the bridge table
            var grBridge = new GlideRecord('par_coreui_migration_bridge_component');

            // Add query condition for sys_id
            grBridge.addQuery('report', sysId);

            // Add query condition for is_last = true
            grBridge.addQuery('is_last', true);

            // Execute the query
            grBridge.query();

            // Process results
            while (grBridge.next()) {
                // Get reference sys_ids
                var sysReportSysId = grBridge.getValue('report');
                var parReportSysId = grBridge.getValue('component');

                // Update sys_report reference (set active to false)
                if (sysReportSysId) {
                    var sysReport = new GlideRecord('sys_report');
                    if (sysReport.get(sysReportSysId)) {
                        sysReport.setValue('active', false);
                        sysReport.setValue('no_bulk_migration', true);
                        var sysReportUpdated = sysReport.update();
                        gs.info(gs.getMessage('Updated sys_report {sysId} active=false: {status}', { sysId: sysReportSysId, status: sysReportUpdated ? 'Success' : 'Failed'}));
                    } else {
                        gs.warn(gs.getMessage('Could not find sys_report record with sys_id: {sysId}', { sysId: sysReportSysId }));
                    }
                }

                // Update par_report reference (set active to true)
                if (parReportSysId) {
                    var parReport = new GlideRecord('par_component');
                    if (parReport.get(parReportSysId)) {
                        parReport.setValue('active', true);
                        var parReportUpdated = parReport.update();
                        gs.info(gs.getMessage('Updated par_report {sysId} active=true: {status}', { sysId: parReportSysId, status: parReportUpdated ? 'Success' : 'Failed'}));
                    } else {
                        gs.warn(gs.getMessage('Could not find par_report record with sys_id: {sysId}', { sysId: parReportSysId }));
                    }
                }

                // Update the bridge record itself - set active field to 'next'
                grBridge.setValue('active', 'next');
                var bridgeUpdated = grBridge.update();
                gs.info(gs.getMessage('Updated bridge record {value} active=next: {status}', { value: grBridge.getUniqueValue(), status: bridgeUpdated ? 'Success' : 'Failed'}));

                activateRelatedScheduledExports(sysId);

                // Add record to results array
                results.push({
                    sys_id: grBridge.getUniqueValue(),
                    report: grBridge.getDisplayValue('report'),
                    visualization: grBridge.getDisplayValue('component'),
                    active: grBridge.getValue('active'),
                    created_on: grBridge.getValue('sys_created_on')
                });

                updatedCount++;
            }
        }

        // Log or return the results
        gs.info(gs.getMessage('Found {resultLength} visualization bridge records. Updated {count} reference records.', { resultLength: results.length, count: updatedCount}));
        return results;
    }

    // Helper function to activate related scheduled exports
    function activateRelatedScheduledExports(reportSysId) {
        // Create GlideRecord for the sysauto bridge table
        var grSysautoBridge = new GlideRecord('par_coreui_migration_bridge_sysauto');

        // Add query condition for report sys_id
        grSysautoBridge.addQuery('report', reportSysId);

        // Add query condition for is_last = true
        grSysautoBridge.addQuery('is_last', true);

        // Execute the query
        grSysautoBridge.query();

        var exportCount = 0;

        // Process results
        while (grSysautoBridge.next()) {
            // Get reference sys_ids
            var reportSysautoSysId = grSysautoBridge.getValue('sysauto_report');
            var parSysautoSysId = grSysautoBridge.getValue('sysauto_par');

            // Update sys_trigger reference (set active to false)
            if (reportSysautoSysId) {
                var sysTrigger = new GlideRecord('sysauto_report');
                if (sysTrigger.get(reportSysautoSysId)) {
                    sysTrigger.setValue('active', false);
                    var sysTriggerUpdated = sysTrigger.update();
                    gs.info(gs.getMessage('Updated sysauto_report {sysId} active=false: {status}', { sysId: reportSysautoSysId, status: sysTriggerUpdated ? 'Success' : 'Failed'}));
                } else {
                    gs.warn(gs.getMessage('Could not find sysauto_report record with sys_id: {sysId}', { sysId: reportSysautoSysId }));
                }
            }

            // Update par_sysauto reference (set active to true)
            if (parSysautoSysId) {
                var parSysauto = new GlideRecord('sysauto_par');
                if (parSysauto.get(parSysautoSysId)) {
                    parSysauto.setValue('active', true);
                    var parSysautoUpdated = parSysauto.update();
                    gs.info(gs.getMessage('Updated sysauto_par {sysId} active=true: {status}', { sysId: parSysautoSysId, status: parSysautoUpdated ? 'Success' : 'Failed'}));
                } else {
                    gs.warn(gs.getMessage('Could not find sysauto_par record with sys_id: {sysId}', { sysId: parSysautoSysId }));
                }
            }

            // Update the bridge record itself - set active field to 'next'
            grSysautoBridge.setValue('active', 'next');
            var bridgeUpdated = grSysautoBridge.update();
            gs.info(gs.getMessage('Updated sysauto bridge record {value} active=next: {status}', { value: grSysautoBridge.getUniqueValue(), status: bridgeUpdated ? 'Success' : 'Failed'}));

            exportCount++;
        }

        if (exportCount > 0) {
            gs.info(gs.getMessage('Activated {count} scheduled exports for report {sysId}', { count: exportCount, sysId: reportSysId}));
        }

        return exportCount;
    }

    // Function to activate PAE Filter
    // Function to activate a component
    function activateComponent(componentSysId) {
        // Array to store results
        var results = [];
        if (!componentSysId) {
            gs.warn(gs.getMessage('No component sys_id provided to activateComponent'));
            return;
        }

        var grBridge = new GlideRecord('par_coreui_migration_bridge_component');
        grBridge.addQuery('component', componentSysId);
        grBridge.addQuery('is_last', true);
        grBridge.query();

        if (grBridge.next()) {
            // Update the bridge record - set active field to 'next'
            grBridge.setValue('active', 'next');
            var bridgeUpdated = grBridge.update();

            // Get component type and check for specific types
            var componentType = grBridge.getValue('type');
            if (componentType === 'report') {
                var sysReportSysId = grBridge.getValue('report');
                // Update sys_report reference (set active to false)
                if (sysReportSysId) {
                    var sysReport = new GlideRecord('sys_report');
                    if (sysReport.get(sysReportSysId)) {
                        sysReport.setValue('active', false);
                        sysReport.setValue('no_bulk_migration', true);
                        var sysReportUpdated = sysReport.update();
                        gs.info(gs.getMessage('Updated sys_report {sysId} active=false: {status}', { sysId: sysReportSysId, status: sysReportUpdated ? 'Success' : 'Failed'}));
                    }
                } else {
                    gs.warn(gs.getMessage('Could not find sys_report record with sys_id: {sysId}', { sysId: sysReportSysId }));
                }
                activateRelatedScheduledExports(sysReportSysId);
            } else if (componentType === 'filter') {
                var filterSysId = grBridge.getValue('filter');
                var filter = new GlideRecord('sys_ui_hp_publisher');
                if (filter.get(filterSysId)) {
                    filter.setValue('no_bulk_migration', true);
                    var filterUpdated = filter.update();
                    gs.info(gs.getMessage('Updated filter {sysId} no_bulk_migration=true: {status}', { sysId: filterSysId, status: filterUpdated ? 'Success' : 'Failed'}));
                }
            } else if (componentType === 'widget') {
                var widgetSysId = grBridge.getValue('widget');
                var widget = new GlideRecord('pa_widgets');
                if (widget.get(widgetSysId)) {
                    widget.setValue('no_bulk_migration', true);
                    var widgetUpdated = widget.update();
                    gs.info(gs.getMessage('Updated widget {sysId} no_bulk_migration=true: {status}', { sysId: widgetSysId, status: widgetUpdated ? 'Success' : 'Failed'}));
                }
            }
            var parComponentSysId = grBridge.getValue('component');

            // Update par_report reference (set active to true)
            if (parComponentSysId) {
                var parComponent = new GlideRecord('par_component');
                if (parComponent.get(parComponentSysId)) {
                    parComponent.setValue('active', true);
                    var parComponentUpdated = parComponent.update();
                    gs.info(gs.getMessage('Updated par_component {sysId} active=true: {status}', { sysId: parComponentSysId, status: parComponentUpdated ? 'Success' : 'Failed'}));
                } else {
                    gs.warn(gs.getMessage('Could not find par_component record with sys_id: {sysId}', { sysId: parComponentSysId }));
                }
            }

            // Update the bridge record itself - set active field to 'next'
            grBridge.setValue('active', 'next');
            var bridgeUpdated = grBridge.update(); // Add record to results array
            results.push({
                sys_id: grBridge.getUniqueValue(),
                type: grBridge.getDisplayValue('type'),
                filter: grBridge.getDisplayValue('filter'),
                widget: grBridge.getDisplayValue('widget'),
                report: grBridge.getDisplayValue('report'),
                component: grBridge.getDisplayValue('component'),
                active: grBridge.getValue('active'),
                created_on: grBridge.getValue('sys_created_on')
            });
            gs.info(gs.getMessage('Updated component bridge record {value} active=next: {status}', { value: grBridge.getUniqueValue(), status: bridgeUpdated ? 'Success' : 'Failed'}));
        }
        return results;
    }

    function activatePAEFilter() {
        // Array to store results
        var results = [];

        // Check if user has either dashboard_admin or hp_publisher_admin role
        if (!gs.hasRole('dashboard_admin') && !gs.hasRole('hp_publisher_admin')) {
            var errorMsg = gs.getMessage('User does not have any of the required roles: dashboard_admin or hp_publisher_admin');
            gs.error(errorMsg);
            results.push({
                error: errorMsg,
                status: 'error'
            });
            return results;
        }

        // Counter for updated records
        var updatedCount = 0;

        // Iterate over each sys_id in the array
        for (var i = 0; i < sysIdArray.length; i++) {
            // Query the bridge table for filters
            var grBridge = new GlideRecord('par_coreui_migration_bridge_component');
            grBridge.addQuery('type', 'filter');
            grBridge.addQuery('is_last', true);
            grBridge.addQuery('filter', sysIdArray[i]);
            grBridge.query();

            while (grBridge.next()) {
                var coreFilterSysId = grBridge.getValue('filter'); // Get the filter reference
                var parFilterSysId = grBridge.getValue('component');


                // Update filter reference (set active to true)
                if (coreFilterSysId) {
                    var filterRecord = new GlideRecord('sys_ui_hp_publisher');
                    if (filterRecord.get(coreFilterSysId)) {
                        filterRecord.setValue('active', false);
                        filterRecord.setValue('no_bulk_migration', true);
                        var filterUpdated = filterRecord.update();
                        gs.info(gs.getMessage('Updated filter {sysId} active=false: {status}', { sysId: coreFilterSysId, status: filterUpdated ? 'Success' : 'Failed'}));
                        if (filterUpdated) updatedCount++;
                    } else {
                        gs.warn(gs.getMessage('Could not find filter record with sys_id: {sysId}', { sysId: coreFilterSysId }));
                    }
                }

                // Update par_report reference (set active to true)
                if (parFilterSysId) {
                    var parFilter = new GlideRecord('par_component');
                    if (parFilter.get(parFilterSysId)) {
                        parFilter.setValue('active', true);
                        var parFilterUpdated = parFilter.update();
                        gs.info(gs.getMessage('Updated par_component {sysId} active=true: {status}', { sysId: parFilterSysId, status: parFilterUpdated ? 'Success' : 'Failed'}));
                    } else {
                        gs.warn(gs.getMessage('Could not find par_component record with sys_id: {sysId}', { sysId: parFilterSysId }));
                    }
                }

                // Update the bridge record itself - set active field to 'next'
                grBridge.setValue('active', 'next');
                var bridgeUpdated = grBridge.update();
                gs.info(gs.getMessage('Updated bridge record {value} active=next: {status}', { value: grBridge.getUniqueValue(), status: bridgeUpdated ? 'Success' : 'Failed'}));

                // Add record to results array
                results.push({
                    sys_id: grBridge.getUniqueValue(),
                    filter: grBridge.getDisplayValue('filter'),
                    component: grBridge.getDisplayValue('component'),
                    active: grBridge.getValue('active'),
                    created_on: grBridge.getValue('sys_created_on')
                });

                updatedCount++;
            }
        }

        return results;
    }

    // Function to activate PAE Widget
    function activatePAEWidget() {
        // Array to store results
        var results = [];

        // Check if user has pa_admin role
        if (!gs.hasRole('pa_admin')) {
            var errorMsg = gs.getMessage('User does not have required role: pa_admin');
            gs.error(errorMsg);
            results.push({
                error: errorMsg,
                status: 'error'
            });
            return results;
        }

        // Counter for updated records
        var updatedCount = 0;

        // Iterate over each sys_id in the array
        for (var i = 0; i < sysIdArray.length; i++) {
            // Query the bridge table for widgets
            var grBridge = new GlideRecord('par_coreui_migration_bridge_component');
            grBridge.addQuery('type', 'widget');
            grBridge.addQuery('is_last', true);
            grBridge.addQuery('widget', sysIdArray[i]);
            grBridge.query();

            while (grBridge.next()) {
                var coreWidgetSysId = grBridge.getValue('widget'); // Get the widget reference
                var parWidgetSysId = grBridge.getValue('component');

                // Update widget reference (set active to true)
                if (coreWidgetSysId) {
                    var widgetRecord = new GlideRecord('pa_widgets');
                    if (widgetRecord.get(coreWidgetSysId)) {
                        widgetRecord.setValue('active', false);
                        widgetRecord.setValue('no_bulk_migration', true);
                        var widgetUpdated = widgetRecord.update();
                        gs.info(gs.getMessage('Updated widget {sysId} active=false: {status}', { sysId: coreWidgetSysId, status: widgetUpdated ? 'Success' : 'Failed'}));
                        if (widgetUpdated) updatedCount++;
                    } else {
                        gs.warn(gs.getMessage('Could not find widget record with sys_id: {sysId}', { sysId: coreWidgetSysId }));
                    }
                }

                // Update par_component reference (set active to true)
                if (parWidgetSysId) {
                    var parWidget = new GlideRecord('par_component');
                    if (parWidget.get(parWidgetSysId)) {
                        parWidget.setValue('active', true);
                        var parWidgetUpdated = parWidget.update();
                        gs.info(gs.getMessage('Updated par_component {sysId} active=true: {status}', { sysId: parWidgetSysId, status: parWidgetUpdated ? 'Success' : 'Failed'}));
                        if (parWidgetUpdated) updatedCount++;
                    } else {
                        gs.warn(gs.getMessage('Could not find par_component record with sys_id: {sysId}', { sysId: parWidgetSysId }));
                    }
                }

                // Update the bridge record itself - set active field to 'next'
                grBridge.setValue('active', 'next');
                var bridgeUpdated = grBridge.update();
                gs.info(gs.getMessage('Updated bridge record {value} active=next: {status}', { value: grBridge.getUniqueValue(), status: bridgeUpdated ? 'Success' : 'Failed'}));

                // Add record to results array
                results.push({
                    sys_id: grBridge.getUniqueValue(),
                    filter: grBridge.getDisplayValue('filter'),
                    component: grBridge.getDisplayValue('component'),
                    active: grBridge.getValue('active'),
                    created_on: grBridge.getValue('sys_created_on')
                });

                updatedCount++;
            }
        }

        return results;
    }

    // Check artifact type and execute the appropriate function
    var results = [];
    if (artifactType === 'dashboard') {
        gs.info(gs.getMessage('Processing dashboard artifacts...'));
        results = activatePAEDashboard();
    } else if (artifactType === 'report') {
        gs.info(gs.getMessage('Processing report artifacts...'));
        results = activatePAEVisualization();
    } else if (artifactType === 'filter') {
        gs.info(gs.getMessage('Processing filter artifacts...'));
        results = activatePAEFilter();
    } else if (artifactType === 'widget') {
        gs.info(gs.getMessage('Processing widget artifacts...'));
        results = activatePAEWidget();
    } else {
        gs.error(gs.getMessage('Unknown artifact type: {type}', { type: artifactType }));
    }

    // Display results
    for (var i = 0; i < results.length; i++) {
        var record = results[i];
        gs.info(gs.getMessage('Bridge Record: {records}', {records: JSON.stringify(record)}));
    }

    response.setBody({
        results
    });
    response.setStatus(200);
})(request, response);
