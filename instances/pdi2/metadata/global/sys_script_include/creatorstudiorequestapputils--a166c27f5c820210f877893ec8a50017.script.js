var CreatorStudioRequestAppUtils = Class.create();
CreatorStudioRequestAppUtils.creatorStudioScopeId = '81ac5fe1c7442110408bc8d6f2c260d1';
CreatorStudioRequestAppUtils.updateAppDependencyMinVersion = function(scopeId) {
    // If any breaking changes are added to sn_creatorstudio_task table, this
    // version must be updated!!
    var requestAppDependencyMinVersion = '25.1.2';

    if (!scopeId) {
        throw new Error("scopeId is required");
    }

    if (gs.getCallerScopeName() !== 'sn_creatorstudio') {
        throw new Error("must be called from sn_creatorstudio scope");
    }

    var requestAppConfigGR = new GlideRecord('sn_creatorstudio_request_app_config');
    if (!requestAppConfigGR.get('sys_scope', scopeId))
        throw new Error('Must be a request app created with Creator Studio');

    var dependencyGR = new GlideRecord('sys_package_dependency_m2m');
    dependencyGR.addQuery('sys_package', scopeId);
    dependencyGR.addQuery('dependency', CreatorStudioRequestAppUtils.creatorStudioScopeId);
    dependencyGR.setLimit(1);
    dependencyGR.query();

    if (dependencyGR.next()) {
        dependencyGR.setValue('min_version', requestAppDependencyMinVersion);
        dependencyGR.update();
    }
};
CreatorStudioRequestAppUtils.baseTableExtendsTask = function(tableName) {
    if (gs.getCallerScopeName() !== 'sn_creatorstudio') {
        throw new Error("must be called from sn_creatorstudio scope");
    }
    if (!tableName)
        throw new Error('Must provide a table name');

    var table = new global.TableUtils(tableName);

    try {
        var baseTable = global.JSON.stringify(table.getAbsoluteBase());
        return global.JSON.parse(baseTable) === 'task';
    } catch (e) {
        throw new Error('Error extracting base table for ' + tableName);
    }
};
CreatorStudioRequestAppUtils.tableIsPublic = function(tableName) {
    if (gs.getCallerScopeName() !== 'sn_creatorstudio') {
        throw new Error("must be called from sn_creatorstudio scope");
    }
    var tableGr = new GlideRecord('sys_db_object');
    tableGr.addQuery('name', tableName);
    tableGr.addQuery('read_access', 'true');
    tableGr.addQuery('update_access', 'true');
    tableGr.addQuery('create_access', 'true');
    tableGr.setLimit(1);
    tableGr.query();

    if (!tableGr.next())
        return false;

    return tableGr.getValue('access') !== 'package_private';
};
CreatorStudioRequestAppUtils.hasRequestType = function(tableName) {
    if (gs.getCallerScopeName() !== 'sn_creatorstudio') {
        throw new Error("must be called from sn_creatorstudio scope");
    }
    if (!tableName)
        throw new Error('Must provide a table name');

    var table = new global.TableUtils(tableName);

    try {
        // getTables() includes table + its direct ancestors
        var ancestors = JSON.stringify(table.getTables());
        var tableGr = new GlideRecord('sys_dictionary');
        tableGr.addQuery('name', 'IN', JSON.parse(ancestors));
        tableGr.addQuery('element', 'request_type');
        tableGr.query();

        return tableGr.next() && tableGr.getValue('reference') === 'sc_cat_item_producer';
    } catch (e) {
        throw new Error('Error extracting base table for ' + tableName);
    }
};
CreatorStudioRequestAppUtils.prototype = {
    initialize: function() {
        throw new Error('CreatorStudioRequestAppUtils is not to be instantiated.');
    },
    type: 'CreatorStudioRequestAppUtils'
};
