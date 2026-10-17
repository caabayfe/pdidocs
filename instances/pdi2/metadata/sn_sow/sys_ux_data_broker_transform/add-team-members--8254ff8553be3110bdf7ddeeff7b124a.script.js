function transform(input) {
    return addTeamMembers(input.teamId, input.userIds);

    function addTeamMembers(teamId, userIds) {
        if (!teamId || !userIds.length)
            return { error: gs.getMessage("invalid input") };

        var teamGr = new GlideRecordSecure('sys_user_group');
        teamGr.get(teamId);
        if (!teamGr.canWrite())
            return { error: gs.getMessage("no write access")};

        var resp = [];

        /* GR insert is restricted if session user does not have write access to the group */
        var gr = new GlideRecord('sys_user_grmember');
        for (var i = 0; i < userIds.length; i++) {
            gr.initialize();
            gr.setValue('group', teamId);
            gr.setValue('user', userIds[i]);
            resp.push(gr.insert());
        }

        return resp;
    }
}
