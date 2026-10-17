var tableName = 'sys_flow_data';

    var defDict = new GlideRecord('sys_dictionary');
    defDict.addQuery('name', tableName);
    defDict.addQuery('element', 'definition');
    defDict.query();
    if (defDict.next()) {
        defDict.setValue('read_only', true);
        defDict.update();
        gs.info('Set "definition" field to read-only on ' + tableName);
    } else {
        gs.warn('Could not find "definition" field on ' + tableName);
    }

    var domainDict = new GlideRecord('sys_dictionary');
    domainDict.addQuery('name', tableName);
    domainDict.addQuery('element', 'sys_domain');
    domainDict.query();
    if (domainDict.next()) {
        domainDict.setValue('read_only', true);
        domainDict.update();
        gs.info('Set "sys_domain" field to read-only on ' + tableName);
    } else {
        gs.warn('Could not find "sys_domain" field on ' + tableName);
    }
