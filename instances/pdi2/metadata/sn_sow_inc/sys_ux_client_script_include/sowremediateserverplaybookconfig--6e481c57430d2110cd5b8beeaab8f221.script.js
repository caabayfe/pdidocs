function include({imports}) { 
    let SowRemediateServerPlaybookConfigSNC = imports['sn_sow_inc.SowRemediateServerPlaybookConfigSNC']();
    class SowRemediateServerPlaybookConfig extends SowRemediateServerPlaybookConfigSNC {

    }
    return SowRemediateServerPlaybookConfig;
}
