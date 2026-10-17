(function executeRule(current, previous /*null when async*/ ) {
    // Add your code here
    var verificationMapGr = new GlideRecord('pwd_map_proc_to_verification');
    verificationMapGr.initialize();
    verificationMapGr.setValue('process', current.sys_id);
    verificationMapGr.setValue('verification', '12c34f0deb6001006a668c505206fefd');
    verificationMapGr.insert();
})(current, previous);
