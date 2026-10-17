try{
        gs.log("Starting execution of fix script to update 'type' field in keyboard shortcut records.", "KeyboardShortcutFixScript");

        var gr = new GlideRecord("sys_ux_keyboard_shortcut");
        gr.addNullQuery("type");
        gr.query();

        var totalCount = gr.getRowCount();
        gs.log("Total records found with null type: " + totalCount, "KeyboardShortcutFixScript");
        gr.setValue("type", "global");
        try {
            gr.updateMultiple();
        } catch(updateErr) {
            gs.log("Fix Script Error: Record update operation failed " + updateErr.message, "KeyboardShortcutFixScript");
        }

        gs.log("Completed execution of fix script to update 'type' field in keyboard shortcut records.", "KeyboardShortcutFixScript");
    } catch (err) {
        gs.log("Fix Script Error: " + err.message, "KeyboardShortcutFixScript");
    }
