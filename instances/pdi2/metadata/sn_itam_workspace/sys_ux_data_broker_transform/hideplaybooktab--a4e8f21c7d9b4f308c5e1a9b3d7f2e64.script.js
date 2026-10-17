function transform(input) {
    // Generic entry point for the shared SRP Playbook tab. All table-specific
    // decisions live in sn_itam_workspace.PlaybookTabProvider extensions, which
    // PlaybookTabUtil dispatches to by table. No hard-coding here.
    return new sn_itam_workspace.PlaybookTabUtil().hidePlaybookTab(input.table, input.sysId);
}
