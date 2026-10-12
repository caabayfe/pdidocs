(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var DEFAULT_COMMIT_MODE_SYS_PROPERTY = 'glide.sourcecontrol.default_commit_mode';
    var ALLOW_COMMIT_MODE_SELECTION_SYS_PROPERTY = 'sn_devstudio.vcs.allow_commit_mode_selection';

    var defaultCommitMode = 'exclude_untracked';
    var allowCommitModeSelection = 'true';

    var grProps = new GlideRecord('sys_properties');
    grProps.addEncodedQuery('name=' + DEFAULT_COMMIT_MODE_SYS_PROPERTY + '^ORname=' + ALLOW_COMMIT_MODE_SELECTION_SYS_PROPERTY);
    grProps.query();

    while (grProps.next()) {
        if (grProps.getValue('name') === DEFAULT_COMMIT_MODE_SYS_PROPERTY)
            defaultCommitMode = grProps.getValue('value');
        else if (grProps.getValue('name') === ALLOW_COMMIT_MODE_SELECTION_SYS_PROPERTY)
            allowCommitModeSelection = grProps.getValue('value');
    }

    response.setBody({
        defaultCommitMode: defaultCommitMode,
        allowCommitModeSelection: allowCommitModeSelection
    });
    response.setStatus(200);
})(request, response);
