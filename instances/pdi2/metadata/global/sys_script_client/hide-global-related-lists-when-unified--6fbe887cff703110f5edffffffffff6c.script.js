function onLoad() {
    //Check if this Layout is already Unified
    if (g_form.getValue('use_layout_items_only') === 'true') {
        //Hide RL : All Global UI Actions &  RL : All Global Declarative Actions
        g_form.hideRelatedList('REL:60b6515760315110f877bd764b84bcaf');
        g_form.hideRelatedList('REL:0ae675c0536d30109706ddeeff7b120c');
    } else if (!g_form.isNewRecord() && g_form.getControl('unify_actions')) {
        //Add Info message about unify
        g_form.addInfoMessage(getMessage('Unify actions to merge Form Action Layout Items, Global UI Actions, and Global DAs into a single consolidated list. This will make it easy to control the display of actions in the layout including order, visibility, and color treatment. After merging, actions will no longer automatically be inherited and new global actions will need to be manually added to the layout. This cannot be undone.'));

    }
}
