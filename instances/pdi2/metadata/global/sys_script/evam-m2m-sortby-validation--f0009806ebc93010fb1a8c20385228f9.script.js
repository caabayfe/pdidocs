(function executeRule(current, previous /*null when async*/ ) {
    var datasource = new GlideRecord('sys_ux_composite_datasource');
    datasource.addQuery('sys_id', current.datasource);
    datasource.addQuery('active', true);
    datasource.query();
    if (!datasource.next())
        return;

    var sortType = SNC.EVAMUXFDatasourceSortUtils.getSortTypeByTableAndField(datasource.table, datasource.sort_by);
    if (SNC.EVAMUXFDatasourceSortUtils.hasMismatchedSortType(current.dataset, current.datasource, sortType)) {
        gs.addErrorMessage('The SortBy type from the Datasource needs to match' +
            ' the SortBy type from all Datasources within the same EVAM Definition');
        current.setAbortAction(true);
    }

})(current, previous);
