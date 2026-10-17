(function() {
    var PROP_NAME = 'cmdb.dependent.ci.cascade.op.enabled';

    gs.log("CMDB Data Manager - dependent ci property fix script - checking for existence of " + PROP_NAME);
    var grSysProp = new GlideRecord('sys_properties');
    grSysProp.addQuery('name', PROP_NAME);
    grSysProp.query();
    if (grSysProp.hasNext()) {
        gs.log("CMDB Data Manager - dependent ci property fix script - Found " + PROP_NAME + " customized on instance, doing nothing");
        return;
    }

    var grTask = new GlideRecord('cmdb_data_management_task');
    grTask.addEncodedQuery('policy_id=523284e87301011026f6aa114df6a753^ORpolicy_id=e23d4a9973f2701026f6aa114df6a741^ORpolicy_id=54618b76533130108cabddeeff7b12c2^state=3');
    grTask.setLimit(1);
    grTask.query();
    var isDependentCiPolicyInUse = grTask.hasNext();
    gs.log("CMDB Data Manager - dependent ci property fix script - " + (isDependentCiPolicyInUse ? "FOUND" : "DID NOT FIND") + " at least 1 dependent CI task");

    createDependentCiSysProp(isDependentCiPolicyInUse);

    function createDependentCiSysProp(value) {
        var newSysProp = new GlideRecord('sys_properties');
        newSysProp.setValue('name', PROP_NAME);
        newSysProp.setValue('value', value + "");
        newSysProp.setValue('description', 'Enables the dependent CI cleanup features of CMDB Data Manager'); // description is Translated Text type field
        newSysProp.setNewGuidValue('5ce87fb04302021002f939603ab8f2a5'); // OOB sys_id for the cmdb.dependent.ci.cascade.op.enabled system property
        var newSysId = newSysProp.insert();
        gs.log("CMDB Data Manager - dependent ci property fix script - Inserted new record " + PROP_NAME + " with value " + value + " and sysId " + newSysId);
    }

})();
