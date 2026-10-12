(function(context, pageParams, blockcontext) {
    function getRecordCount(table, encodedQuery, checkActiveRecord) {
        try {
            var ga = new GlideAggregate(table);
            ga.addAggregate('COUNT');
            if (encodedQuery) ga.addEncodedQuery(encodedQuery);
            if (checkActiveRecord) ga.addQuery('active', true);
            ga.query();
            return ga.next() ? ga.getAggregate("COUNT") : 0;
        } catch (err) {
            gs.error(err);
        }
        return 0;
    }

    function getStatusMessage(cardKey, totalRecordCount, activeRecordCount) {
        switch (cardKey) {
            case 'PASSWORD_RESET_AGENTS':
                return totalRecordCount == 0 ? gs.getMessage('No user assigned to the role') : gs.getMessage('{0} user(s) assigned to the role', totalRecordCount);
            case 'CREDENTIAL_STORES':
                return totalRecordCount == 0 ? gs.getMessage('No credential store available') : gs.getMessage('{0} credential store(s) available', totalRecordCount);
            case 'PASSWORD_RESET_PROCESSES':
                if (totalRecordCount == 0) return gs.getMessage('No process defined');
                return activeRecordCount == 0 ?
                    gs.getMessage('{0} process(es) defined, none active', totalRecordCount) :
                    gs.getMessage('{0} process(es) defined, {1} active', [totalRecordCount, activeRecordCount]);
            case 'VERIFICATION':
                return totalRecordCount == 0 ? gs.getMessage('No verification defined') : gs.getMessage('{0} verification(s) created', totalRecordCount);
            case 'PROCESS_MAPPING':
                return totalRecordCount == 0 ? gs.getMessage('No verification mapped') : gs.getMessage('{0} verification(s) mapped', totalRecordCount);
            case 'UXF_ROUTES_MAPPING':
                return totalRecordCount == 0 ? gs.getMessage('No mapping available') : gs.getMessage('{0} mapping(s) available', totalRecordCount);
            case 'PASSWORD_POLICIES':
                if (totalRecordCount == 0) return gs.getMessage('No policy configured');
                return totalRecordCount == 1 ? gs.getMessage('{0} policy configured', totalRecordCount) : gs.getMessage('{0} policies configured', totalRecordCount);
        }
    }

    function getHighlightColor(totalRecordCount, activeRecordCount) {
        return totalRecordCount == 0 ? 'purple' : (activeRecordCount == null || activeRecordCount == totalRecordCount) ? 'positive' : 'warning';
    }

    function buildCardStatus(cardKey, table, encodedQuery, checkActiveRecord) {
        var totalRecordCount = getRecordCount(table, encodedQuery);
        var activeRecordCount = checkActiveRecord ? getRecordCount(table, encodedQuery, true) : null;
        return {
            status: {
                message: getStatusMessage(cardKey, totalRecordCount, activeRecordCount),
                color: getHighlightColor(totalRecordCount, activeRecordCount)
            }
        };
    }

    return {
        isDataFetched: true,
        PASSWORD_RESET_AGENTS: buildCardStatus('PASSWORD_RESET_AGENTS', 'sys_user_has_role', 'role.name=password_reset_service_desk'),
        CREDENTIAL_STORES: buildCardStatus('CREDENTIAL_STORES', 'pwd_cred_store'),
        PASSWORD_RESET_PROCESSES: buildCardStatus('PASSWORD_RESET_PROCESSES', 'pwd_process', 'public_access=false', true),
        VERIFICATION: buildCardStatus('VERIFICATION', 'pwd_verification'),
        PROCESS_MAPPING: buildCardStatus('PROCESS_MAPPING', 'pwd_map_proc_to_verification'),
        UXF_ROUTES_MAPPING: buildCardStatus('UXF_ROUTES_MAPPING', 'pwd_reset_uxf_route_mapping'),
        PASSWORD_POLICIES: buildCardStatus('PASSWORD_POLICIES', 'password_policy')
    };
})(context, pageParams, blockcontext);
