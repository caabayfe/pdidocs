(function executeRule(current, previous /*null when async*/ ) {
    current.hashed_user_id = (new GlideDigest().getSHA256Hex(current.sys_id)).toLowerCase();
})(current, previous);
