function onClick(g_form) {
    if (typeof getMessage == 'function')
        getMessage('Some items are inactive and will not be copied', alert);
    else
        alert('Some items are inactive and will not be copied');

    // Call the UI Action and skip the 'onclick' function
    g_form.submit(g_form.getActionName());

}
