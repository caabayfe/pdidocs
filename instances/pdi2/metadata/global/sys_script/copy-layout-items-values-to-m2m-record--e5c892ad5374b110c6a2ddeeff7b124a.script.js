(function executeRule(current, previous /*null when async*/ ) {
    var layoutItem = current.ux_form_action_layout_item;
    var DISPLAY_TYPE = {
        BUTTON: "0",
        OVERFLOW_MENU: "1"
    };
    current.variant = layoutItem ? layoutItem.color : 'secondary';
    current.order = layoutItem ? layoutItem.order : 0;
    current.display_type = layoutItem && layoutItem.overflow ? DISPLAY_TYPE.OVERFLOW_MENU : DISPLAY_TYPE.BUTTON;
    current.icon = layoutItem ? layoutItem.icon : "";
})(current, previous);
