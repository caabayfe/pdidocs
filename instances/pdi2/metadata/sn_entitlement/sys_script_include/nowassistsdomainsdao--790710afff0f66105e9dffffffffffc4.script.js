var NowAssistsDomainsDao = Class.create();
NowAssistsDomainsDao.prototype = {
    initialize: function() {},

    doesDomainTableExist: function() {
        return gs.tableExists('domain');
    },

    insertDomainData: function(allDomainData, accrualTime) {
        var gr = new GlideRecord('now_assists_domains');
        allDomainData.forEach(function(data) {
            gr.initialize();
            gr.setValue('name', data.name);
            gr.setValue('sys_domain', data.group);
            gr.setValue(LicensingEngineDBConstants.ACCRUAL_TIME, accrualTime.getValue());
            gr.setValue('used_assists', Number(data.totalAssists)); // Convert string to number
            gr.insert();
        });
    },

    type: 'NowAssistsDomainsDao'
};
