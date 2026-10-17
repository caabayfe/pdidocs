 var scComplianceUtil = new sn_vsc.VSCComplianceUtil();
 var cvssScoreChangedSettings = ["e9b42471dd185210f877477f3179ce0c", "4dd30a1143334210a0d25dc36ab8f281", "a46598c8d5001110fa9bdbc0c4c2abab", "3c6598c8d5001110fa9bdbc0c4c2abbc", "47321930774031101b803a91fa5a9951", "2f0270de773411108bd73a91fa5a9968", "ee321930774031101b803a91fa5a9929", "1165d8c8d5001110fa9bdbc0c4c2ab51", "d22f14d8770111108bd73a91fa5a99f1", "54703da8778111108bd73a91fa5a997a", "dd837df0774111108bd73a91fa5a99a9", "a3d7f1f4774111108bd73a91fa5a992d", "ea7bb2ac775461108bd73a91fa5a99a2", "e6321930774031101b803a91fa5a990b", "43321930774031101b803a91fa5a9946"];
 var gr = new GlideRecord('sn_vsc_instance_hardening_settings');
 for (var i = 0; i < cvssScoreChangedSettings.length; i++) {
     if (gr.get(cvssScoreChangedSettings[i])) {
         scComplianceUtil.updateSettingsInsert(gr.sys_id, gr.compliance_status);
     }
 }
