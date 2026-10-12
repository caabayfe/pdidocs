/*
 * Migrate all active search sources to the Agent Workspace search configuration
 *
 *   In previous releases, Agent Workspace had a global search configuration,
 *   and queried all active search sources.  Now, we support multiple workspaces
 *   where each workspace has its own search configuration.
 */
function migrateAgentWorkspaceSearchSources() {
    var AW_SEARCH_CONFIG_ID = "4961e3e7871033000929717936cb0ba7";
    var NEXT_EXPERIENCE_SEARCH_CONFIG_ID = "c861cea2c7022010099a308dc7c26041";
    var SEARCH_CONFIG_TABLE = "sys_search_context_config";
    var SEARCH_SOURCE_TABLE = "sys_search_source";
    var SEARCH_CONFIG_TO_SOURCE_TABLE = "m2m_search_context_config_search_source";

    // get the agent workspace search configuration

    var awSearchConfig = new GlideRecord(SEARCH_CONFIG_TABLE);
    awSearchConfig.get(AW_SEARCH_CONFIG_ID);

    var configId = awSearchConfig.getValue("sys_id");
    var configName = awSearchConfig.getValue("name");

    gs.debug(configName, "Agent Workspace config name");
    gs.debug(configId, "Agent Workspace config id");

    // get a list of sources already associated to the agent workspace search configuration and Next experience configuration

    var awSourceJoins = new GlideRecord(SEARCH_CONFIG_TO_SOURCE_TABLE);
    var sacQC = awSourceJoins.addQuery("search_context_config", AW_SEARCH_CONFIG_ID);
    sacQC.addOrCondition("search_context_config", NEXT_EXPERIENCE_SEARCH_CONFIG_ID);
    awSourceJoins.query();

    var awSourceIds = [];
    while (awSourceJoins.next()) {
        var awSourceId = awSourceJoins.getValue("source");
        awSourceIds.push(awSourceId);
    }

    gs.debug(awSourceIds, "Agent Workspace & Next Experience search sources");

    // get a list of all active search sources that are not present in either Agent Workspace or Next Experience

    var allActiveSources = new GlideRecord(SEARCH_SOURCE_TABLE);
    allActiveSources.addActiveQuery();
    allActiveSources.addQuery('sys_id', 'NOT IN', awSourceIds.join(','));
    allActiveSources.orderBy("sys_created_on");
    allActiveSources.query();

    // for each active search source, if it's not already associated to the
    // Agent Workspace configuration or Next Experience, add it.

    var order = 0;
    while (allActiveSources.next()) {
        var activeSourceId = allActiveSources.getValue("sys_id");
        order += 100;
        gs.debug(activeSourceId, "adding source to Agent Workspace config");
        awSourceJoins.initialize();
        awSourceJoins.search_context_config = AW_SEARCH_CONFIG_ID;
        awSourceJoins.source = activeSourceId;
        awSourceJoins.order = order;
        awSourceJoins.insert();

    }
}

migrateAgentWorkspaceSearchSources();
