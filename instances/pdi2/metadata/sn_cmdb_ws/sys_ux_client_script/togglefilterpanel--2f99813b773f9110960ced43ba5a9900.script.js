function script({ api, event, helpers, imports }) {
    //toggleFilterPanel script in Map Search Filter UI Controller; fired after the filter button toggle is clicked
    const { cloneDeep } = imports['sn_cmdb_ws.unifiedMapUtils']();

    var filterControls = cloneDeep(api.state.filterControls);
    filterControls.filterPanel.isHidden = !filterControls.filterPanel.isHidden;
    api.setState('filterControls', filterControls);
}
