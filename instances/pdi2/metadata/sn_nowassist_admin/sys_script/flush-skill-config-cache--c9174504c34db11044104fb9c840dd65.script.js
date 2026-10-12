(function executeRule(current, previous /*null when async*/ ) {
    var cacheUtil = new NowAssistCacheUtil();
    cacheUtil.flushNACache('CONFIG', current.getValue('skill_config'));
})(current, previous);
