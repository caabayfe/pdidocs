function transform(input) {
          var gr = new GlideRecord('sn_um_upgrade_sessions');
          if (!gr.get(input.upgradeSessionId)) {
            return;
          }

          if(input.isStorePreview){
                gs.info("[Upgrade Console] Setting new tracker as preview-store tracker");
                gr.setValue('upgrade_preview_store', input.upgradePreviewId);
                gr.setValue('upgrade_preview_execution_tracker_store', input.upgradeExecTrackerId);
          }else{
                gs.info("[Upgrade Console] Setting new tracker as preview tracker" + JSON.stringify(input));
                gr.setValue('upgrade_preview', input.upgradePreviewId);
                gr.setValue('upgrade_preview_execution_tracker', input.upgradeExecTrackerId);
          }
          gr.update();

}
