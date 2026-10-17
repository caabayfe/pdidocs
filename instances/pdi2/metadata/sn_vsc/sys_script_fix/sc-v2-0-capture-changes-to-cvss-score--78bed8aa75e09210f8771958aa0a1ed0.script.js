 
        var scComplianceUtil = new sn_vsc.VSCComplianceUtil(); 
        var gr = new GlideRecord('sn_vsc_instance_hardening_settings'); 
        // sys_id = 'sys_id=e27bb2ac775461108bd73a91fa5a99ae', setting_name = 'Disable External Content URL'
        if (gr.get('e27bb2ac775461108bd73a91fa5a99ae')) {
            scComplianceUtil.updateSettingsInsert(gr.sys_id, gr.compliance_status); 
        }
