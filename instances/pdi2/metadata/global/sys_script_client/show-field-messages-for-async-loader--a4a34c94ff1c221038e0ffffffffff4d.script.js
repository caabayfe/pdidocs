function onLoad() {
	getMessage("Note: Enabling this feature will load your page faster by delaying load of this specific widget.", function(msgString) {
        g_form.showFieldMsg('async_load', msgString, 'info');
    });
	getMessage("Note: Admin can dynamically define the height & width based on Instance option.", function(msgString) {
        g_form.showFieldMsg('advanced_placeholder_dimensions', msgString, 'info');
    });
	getMessage("Note: To avoid layout shift & retain the original placeholder, select the checkbox", function(msgString) {
        g_form.showFieldMsg('preserve_placeholder_size', msgString, 'info');
    });
}
