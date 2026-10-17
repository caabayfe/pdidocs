var AppFamilyInfoService = Class.create();
AppFamilyInfoService.prototype = {
    initialize: function() {
        this.PACKAGE_CACHE = {};
    },

    getPackageApp: function (packageId, scopeId) {
        var res = {
            'name': 'Unknown',
            'id': 'unk',
            'appSysId': null,
        };
        var key = packageId + '~' + scopeId;
        if (Object.prototype.hasOwnProperty.call(this.PACKAGE_CACHE.hasOwnProperty, key))
            return this.PACKAGE_CACHE[key];

        if (gs.nil(packageId) && gs.nil(scopeId)) {
            this.PACKAGE_CACHE[key] = {
                'name': 'Global',
                'id': 'global',
                'appSysId': null,
            };
            return this.PACKAGE_CACHE[key];
        }

        var af = new GlideRecord('ua_app_family');
        if (packageId) {
            af.addQuery('app_id', '=', packageId).addOrCondition('app_id', '=', 'com.' + packageId).addOrCondition('app_id', '=', 'com.snc.' + packageId);
        }
        if (scopeId) {
            af.addQuery('scope', '=', scopeId);
        }
        af.addQuery('level', '=', 1);
        af.query();

        if (af.getRowCount() > 1) {
            gs.info('Multiple app families (' + af.getRowCount() + ') were found for the package {' + packageId + '}.');
        }

        if (af.next()) {
            var appEntSysId = null;
            var appEntitlement = new GlideRecord('license_family');
            appEntitlement.addQuery('family_id', '=', af.getValue('lineage_id'));
            appEntitlement.query();
            if (appEntitlement.next()) {
                appEntSysId = appEntitlement.getUniqueValue();
            }
            res = {
                'name': af.getValue('lineage_name'),
                'id': af.getValue('lineage_id'),
                'appSysId': appEntSysId,
            };
        }
        this.PACKAGE_CACHE[key] = res;
        return res;
    },

    type: 'AppFamilyInfoService'
};
