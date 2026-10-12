main();

function isBreakdownFilter(filterProps) {
    if (!filterProps.datasource)
        return false;

    if (
        filterProps.datasource.type === 'indicator' &&
        filterProps.datasource.payload &&
        Object.keys(filterProps.datasource.payload).length > 1
    )
        return true;

    if (
        filterProps.datasource.type === 'pa' &&
        filterProps.datasource.breakdown &&
        Object.keys(filterProps.datasource.breakdown).length > 1
    )
        return true;

    return false;
}

function findAllBreakdownFiltersCallback(findAllBreakdownFiltersGR) {
    var breakdownFilters = [];
    while (findAllBreakdownFiltersGR.next()) {
        var filterSysId = findAllBreakdownFiltersGR.getValue('sys_id');
        var filterProps = findAllBreakdownFiltersGR.getValue('component_props');

        // in case of empty component_props
        if (!filterProps) {
            gs.info('Empty component_props for filter (par_dashboard_widget sys_id): ' + filterSysId + '. This record is skipped.');
            continue;
        }

        filterProps = JSON.parse(filterProps);

        // in case of the filter not being a breakdown filter
        if (!isBreakdownFilter(filterProps)) {
            gs.info('Not a breakdown filter (par_dashboard_widget sys_id): ' + filterSysId + '. This record is skipped.');
            continue;
        }

        // here we have only breakdown filters
        if (filterProps.filterComponentType === 'multiselect') { // they are already multiselect so no need to fix them
            gs.info('Breakdown filter (par_dashboard_widget sys_id): ' + filterSysId + ' is already multiselect. This record is skipped.');
            continue;
        }

        // here we have only breakdown filters that are singleselect and need to be updated to multiselect
        // next we have to determine if they are migrated filters in order to update them
        gs.info('Found single select breakdown filter (par_dashboard_widget sys_id): ' + filterSysId);
        breakdownFilters.push(filterSysId);
    }
    return breakdownFilters;
}

function findAllMigratedBreakdownFiltersCallback(isMigratedFilterGR) {
    // everything that this returns finds is a migrated filter
    // because we are searching in par_coreui_migration_bridge_widget table
    // which contains only migrated widgets
    var migratedFilters = [];
    while (isMigratedFilterGR.next()) {
        if (!isMigratedFilterGR.dashboard_widget) {
            gs.info('Empty dashboard_widget for migrated filter (par_coreui_migration_bridge_widget sys_id): ' + isMigratedFilterGR.sys_id + '. This record is skipped.');
            continue;
        }
        var migratedFilterSysId = isMigratedFilterGR.dashboard_widget.sys_id.toString();
        gs.info('Found migrated breakdown filter (par_dashboard_widget sys_id): ' + migratedFilterSysId);
        migratedFilters.push(migratedFilterSysId);
    }
    return migratedFilters;
}

function updateAllMigratedSingleSelectBreakdownFiltersCallback(updateFiltersGR) {
    var updatedRecordsCounter = 0;
    while (updateFiltersGR.next()) {
        var filterProps = updateFiltersGR.getValue('component_props');
        filterProps = JSON.parse(filterProps);
        filterProps.filterComponentType = 'multiselect';
        updateFiltersGR.component_props = JSON.stringify(filterProps);
        updateFiltersGR.update();
        updatedRecordsCounter++;
        gs.info('Breakdown filter (par_dashboard_widget sys_id): ' + updateFiltersGR.sys_id + ' updated to multiselect.');
    }
    return updatedRecordsCounter;
}

function main() {
    if (pm.isZboot()) {
        gs.info('This script is not intended to be run on Zboot. End of script execution.');
        return;
    }

    gs.info('Starting the script to update breakdown filters to multiselect...');

    var counter = 0;
    var findAllBreakdownFiltersGR = new GlideRecord('par_dashboard_widget');
    findAllBreakdownFiltersGR.addEncodedQuery('component=226449101138d0dff1abe0e1566c8b2a'); //filter macroponent
    findAllBreakdownFiltersGR.query();
    var breakdownFilters = findAllBreakdownFiltersCallback(findAllBreakdownFiltersGR);
    gs.info('Found in total: ' + breakdownFilters.length + ' single select breakdown filters.');

    var isMigratedFilterGR = new GlideRecord('par_coreui_migration_bridge_widget');
    isMigratedFilterGR.addEncodedQuery('dashboard_widgetIN' + breakdownFilters.join(','));
    isMigratedFilterGR.query();
    var migratedFilters = findAllMigratedBreakdownFiltersCallback(isMigratedFilterGR);
    gs.info('Found in total: ' + migratedFilters.length + ' migrated breakdown filters.');


    var updateFiltersGR = new GlideRecord('par_dashboard_widget');
    updateFiltersGR.addEncodedQuery('sys_idIN' + migratedFilters.join(','));
    updateFiltersGR.query();
    gs.info('Found ' + updateFiltersGR.getRowCount() + ' migrated single select breakdown filters in par_dashboard_widget table.');
    var updatedRecordsCounter = updateAllMigratedSingleSelectBreakdownFiltersCallback(updateFiltersGR);

    gs.info('Total breakdown filters updated to multiselect: ' + updatedRecordsCounter);
    gs.info('End of the script to update breakdown filters to multiselect...');
}
