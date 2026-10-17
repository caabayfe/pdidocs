(function executeRule(current, previous /*null when async*/) {
 var sysId = current.sys_id;
 var ldc = new sn_cmp_api.DiscoveryServiceScript();
 var ldcList = ldc.getLdcs(sysId);
 if(ldcList.length > 0){
     current.setAbortAction(true);
     gs.addErrorMessage(gs.getMessage("Can't delete service account.LDC's are attached to this service account"));
}

})(current, previous);
