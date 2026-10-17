(function executeCondition( /* task glide record */ current) {
    switch (current.getTableName()) {
        case 'incident':
        case 'sc_request':
        case 'sc_req_item':
        case 'change_request':
        case 'interaction':
            return gs.getProperty('sn_sow_collab.enable_requester_in_sidebar_discussion', 'true') == 'false';
        default:
            return false;
    }
})(current);
