function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    // Enable the "View CMDB Group CIs" button only when a cmdb group is selected
    var buttons = $$("button[gsft_id='b516fef07fa200101952baf8befa9195']");
    for (var i = 0; i < buttons.length; i++) {
        if (newValue)
            Form.Element.enable(buttons[i]);
        else
            Form.Element.disable(buttons[i]);
    }
}
