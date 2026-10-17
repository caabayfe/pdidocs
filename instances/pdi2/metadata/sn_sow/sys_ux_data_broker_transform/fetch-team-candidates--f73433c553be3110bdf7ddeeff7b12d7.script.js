function transform(input) {
    return fetchTeamCandidates(input.teamId, input.searchTerm, input.limit);

    function fetchTeamCandidates(teamId, searchTerm, limit) {
        var gr = new GlideRecordSecure('sys_user');
        gr.addActiveQuery();
        var resp = [];

        var teamMemberIds = _fetchMemberIds(teamId);
        if (teamMemberIds.length > 0)
            gr.addQuery('sys_id', 'NOT IN', teamMemberIds);

        if (searchTerm)
            gr.addQuery('name', 'CONTAINS', searchTerm);

        gr.orderBy('name');

        if (limit)
            gr.setLimit(limit);

        gr.query();
        while (gr.next()) {
            /* response is designed for list item prop e.g. typeahead-multi */
            resp.push({
                id: gr.getUniqueValue(),
                label: gr.getValue('name'),
                sublabel: gr.getValue('email')
            });
        }

        return resp;
    }

    function _fetchMemberIds(teamId) {
        if (!teamId)
            return [];

        var memberIds = [];
        var gr = new GlideRecordSecure('sys_user_grmember');
        gr.addQuery('group', teamId);
        gr.query();
        while (gr.next()) {
            memberIds.push(gr.getValue('user'));
        }

        return memberIds;
    }
}
