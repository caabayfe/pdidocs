function transform(input) {
    var table = input.table;
    var result = {
        isCompatible: false
    };

    function checkCompatibility(dbo) {
        // Check if table belongs to CMDB Workspace scope
        if (dbo.sys_scope == 'c8ab76825371201032b7ddeeff7b1280')
            return true;
        if (dbo.access == 'package_private')
            return false;
        return !!(dbo.create_access && dbo.delete_access && dbo.update_access);
    }

    var dbo = new GlideRecord('sys_db_object');
    dbo.addQuery('name', table);
    dbo.setLimit(1);
    dbo.query();
    if (dbo.next()) {
        result.isCompatible = checkCompatibility(dbo);
    }

    return result;
}
