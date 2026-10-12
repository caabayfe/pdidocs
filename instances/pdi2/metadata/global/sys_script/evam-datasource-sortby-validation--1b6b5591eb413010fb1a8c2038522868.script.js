(function executeRule(current, previous /*null when async*/ ) {
    var sortType = SNC.EVAMUXFDatasourceSortUtils.getSortTypeByTableAndField(current.table, current.sort_by);
    var m2mDataSets = new GlideRecord('sys_ux_composite_data_m2m_datasource');
    m2mDataSets.addQuery('datasource', current.sys_id);
    m2mDataSets.query();
    while (m2mDataSets.next()) {
        if (SNC.EVAMUXFDatasourceSortUtils.hasMismatchedSortType(m2mDataSets.dataset, current.sys_id, sortType)) {
            gs.addErrorMessage('The SortBy type from the Datasource needs to match' +
                ' the SortBy type from all Datasources within the same EVAM Definition');
            current.setAbortAction(true);
            current.sort_by = previous.sort_by;
            // remove the mapping created by the UI submit action as the sort type is invalid
            if (current.isNewRecord()) {
                if (!SNC.EVAMUXFDatasourceSortUtils.deleteEVAMMapping(m2mDataSets.dataset, current.sys_id))
                    gs.warn('Unable to delete EVAM Mapping dataset =' + dataset + ', datasource=' + datasource);
            }
            break;
        }
    }

})(current, previous);
