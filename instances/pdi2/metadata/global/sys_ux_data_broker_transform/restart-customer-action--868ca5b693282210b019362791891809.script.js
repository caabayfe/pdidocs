function transform(input) {
    new global.CriticalUpdateUtil().triggerNewPlaybookUponRestart(input.sys_id);
}
