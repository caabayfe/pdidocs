var apiKeyGr = new GlideRecord('ecc_agent_webserver_api_key');
if (apiKeyGr.isValid()) {
    var domainsOfMigratedKeys = [];
    apiKeyGr.queryNoDomain();
    while (apiKeyGr.next()) {
        var domainName = apiKeyGr.getDisplayValue("sys_domain");
        domainsOfMigratedKeys.push(domainName);
        gs.info('Mid Web Server upgrade: Migrating API Key for domain {0}', domainName);
        var apiKeyCredGr = new GlideRecord('mid_webserver_api_key_credentials');
        apiKeyCredGr.sys_domain = apiKeyGr.sys_domain;
        apiKeyCredGr.name = 'api_key_' + domainName;
        apiKeyCredGr.expires = '0';
        apiKeyCredGr.setDisplayValue('authentication_key', apiKeyGr.api_key);
        apiKeyCredGr.active = '1';
        apiKeyCredGr.setWorkflow(false);
        apiKeyCredGr.insert();
    }
    var numMigratedKeys = domainsOfMigratedKeys.length;
    if (numMigratedKeys > 0) {
        gs.info('Mid Web Server upgrade: Migrated {0} API Keys for domains: {1}', numMigratedKeys, domainsOfMigratedKeys.join(","));
        gs.info('Mid Web Server upgrade: Truncating ecc_agent_webserver_api_key table');
        gs.truncateTable('ecc_agent_webserver_api_key');
        if (numMigratedKeys > parseInt(gs.getProperty("mid.webserver.max.api.keys", "10")))
            gs.setProperty("mid.webserver.max.api.keys", numMigratedKeys.toString());
    } else
        gs.info('Mid Web Server upgrade: No API Keys migrated');
} else
    gs.info('Mid Web Server upgrade: ecc_agent_webserver_api_key table does not exist. Skipping API Keys migration as no migration is required');
