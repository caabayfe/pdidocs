(function executeRule(current, previous /*null when async*/ ) {
    if (current.user.user_name == 'sharedservice.worker')
        gs.setProperty("glide.ml.shared_worker.validation.status", "false");
})(current, previous);
