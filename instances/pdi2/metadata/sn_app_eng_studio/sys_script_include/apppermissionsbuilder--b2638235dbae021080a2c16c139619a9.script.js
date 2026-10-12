var AppPermissionsBuilder = (function() {
    return {
        build: function(applicationSysId) {
            var sysScopeRecord = new GlideRecord('sys_scope');


            if (!sysScopeRecord.get(applicationSysId)) {
                return {};
            }



            return {
                canDelete: sysScopeRecord.canDelete()
            };
        }
    };
})();
