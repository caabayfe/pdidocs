function onChange(control, oldValue, newValue, isLoading) {
    if (!newValue) {
        return;
    }
    var message = '';
    if (newValue === 'now_icon') {
        message = getMessage('Enter a valid now-icon name without file extensions like .svg or .png.');
    } else if (newValue === 'image') {
        message = getMessage('Enter an icon name from DB images with valid extensions (svg, png, jpg, jpeg, etc.).');
    }
    if (message) {
        g_form.showFieldMsg('icon_type', message, 'info');
    }
}
