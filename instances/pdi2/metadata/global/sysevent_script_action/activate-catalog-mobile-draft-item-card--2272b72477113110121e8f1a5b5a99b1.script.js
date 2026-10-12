
    //Refer fix_activate_draft_item_card.xml while making changes
var scriptPrefix = "fix_activate_draft_item_card: Script_action: ";
gs.info(scriptPrefix + "Started executing the script");
activateDraftItemCard();
gs.info(scriptPrefix + "Ended executing the script");

function activateDraftItemCard() {
    var gr = new GlideRecord("sys_sg_view_config");
    gr.setWorkflow(false);
    if (gr.get("89998916c3a03110547aab8f8740dd34")) {
        //If it is already active by fix script we don't need to update.
        if (gr.getValue("active") == 1) {
            gs.info(scriptPrefix + "Draft item card is already active");
            return;
        }

        var gcd = GlideCollisionDetector.get();
        if (gs.nil(gcd)) {
            gs.info(scriptPrefix + "Error in initiating GlideCollisionDetector.");
            return;
        }
        //If card is customised by customer we don't update it.
        if (gcd.containsKey(gr.getValue("sys_update_name"))) {
            gs.info(scriptPrefix + "Draft item card is customised.");
            return;
        }


        gr.setValue("active", true);
        if (gr.update())
            gs.info(scriptPrefix + "Draft item card having sys_id {0} successfully activated.", gr.getUniqueValue());
        else
            gs.info(scriptPrefix + "Not able to Activate the Draft item card having sys_id {0}", gr.getUniqueValue());
    } else {
        gs.info(scriptPrefix + "Draft item card not found.");
    }
}
