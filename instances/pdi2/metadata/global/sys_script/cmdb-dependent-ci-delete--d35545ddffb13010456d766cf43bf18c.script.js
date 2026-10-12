(function executeRule(current, previous /*null when async*/ ) {

    var parentCi = current.parent;
    var childCi = current.child;
    var parentClassName = current.parent.sys_class_name;
    var childClassName = current.child.sys_class_name;

    var dependentCIHelper = new DependentCIHelper();
    if (!gs.nil(parentClassName) && dependentCIHelper.isDependentClass(parentClassName) && SNC.CMDBDataManagerScriptableApis.isOrphanedDependent(parentCi)) {
        dependentCIHelper.addOrphanCIToLedger(parentCi);
    }

    if (!gs.nil(childClassName) && dependentCIHelper.isDependentClass(childClassName) && SNC.CMDBDataManagerScriptableApis.isOrphanedDependent(childCi)) {
        dependentCIHelper.addOrphanCIToLedger(childCi);
    }

})(current, previous);
