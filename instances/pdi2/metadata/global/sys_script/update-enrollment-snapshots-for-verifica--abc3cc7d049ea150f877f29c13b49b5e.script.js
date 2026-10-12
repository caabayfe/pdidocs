(function executeRule(current, previous /*null when async*/ ) {
    //Run this BR on change of auto_enroll flag 
    if (current.auto_enroll != previous.auto_enroll) {
        gs.eventQueue('pwd_verification_type_auto_enroll.update', current, current.sys_id, current.auto_enroll);
    }
})(current, previous);
