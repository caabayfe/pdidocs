(function executeRule(current, previous /*null when async*/ ) {

    if (current.operation() === "insert")
        insertNavTabs(current.getValue('profile'), current.search_source);

    if (current.operation() === "delete")
        deleteNavTabs(current.getValue('profile'), current.search_source);

    if (current.operation() === "update") {

        if (current.profile != previous.profile) {
            //profile field changed so delete NavTabs from configs using old profile		
            deleteNavTabs(previous.getValue('profile'), previous.search_source);
        } else {
            //source field changed so delete NavTabs from configs using current profile
            deleteNavTabs(current.getValue('profile'), previous.search_source);
        }

        if (current.exclude_in_regular_search != previous.exclude_in_regular_search && current.exclude_in_regular_search == true) {
            //Exclude in Regular Search changed from unchecked to checked, so delete NavTabs from configs using current 		
            deleteNavTabs(current.getValue('profile'), current.search_source);
        }

        insertNavTabs(current.getValue('profile'), current.search_source);
    }

    function deleteNavTabs(profile, source) {
        //Fetch all Configs that's use the updated search profile
        var configsGr = new GlideRecord('sys_search_context_config');
        configsGr.addQuery('search_profile', profile);
        configsGr.query();

        //For each config that delete the corresponding NavTab Record
        while (configsGr.next()) {
            var navTabGr = new GlideRecord('sys_search_filter');
            navTabGr.addQuery('search_context_config', configsGr.getValue('sys_id'));
            navTabGr.addQuery('ais_search_source', source);
            navTabGr.query();
            if (navTabGr.next()) {
                navTabGr.deleteRecord();
            }
        }
    }

    function insertNavTabs(profile, source) {

        // When Exclude in Regular Search is checked, we don't want to create a tab for it
        if (current.exclude_in_regular_search == true)
            return;

        //Fetch all Configs that's use the updated search profile
        var configsGr = new GlideRecord('sys_search_context_config');
        configsGr.addQuery('search_profile', profile);
        configsGr.query();

        //For each config that uses this profile insert a new NavTab Record
        var isExistingSource = !current.search_source.name.nil();
        while (configsGr.next()) {
            var navTabGr = new GlideRecord('sys_search_filter');
            navTabGr.addQuery('search_context_config', configsGr.getValue('sys_id'));
            //Get the largest 'order' for the current configs NavTabs
            navTabGr.orderByDesc('order');
            navTabGr.query();
            navTabGr.next();
            var maxOrder = parseInt(navTabGr.getValue('order')) || 0;

            //Create record
            navTabGr.initialize();
            navTabGr.order = maxOrder + 100;
            navTabGr.search_context_config = configsGr.getValue('sys_id');
            navTabGr.ais_search_source = source;
            if (isExistingSource) {
                navTabGr.name = current.search_source.name;
                var sourceTable = current.search_source.datasource.source;
                navTabGr.label = ((new GlideRecord(sourceTable)).getClassDisplayValue());
            }
            navTabGr.insert();
        }
    }
}(current, previous));
