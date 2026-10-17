var previewActive = gs.getProperty('com.glide.cs.settings.show_message_preview', 'false') === 'true';
var statusLabel, statusColor, statusIcon;
if (previewActive) {
    statusLabel = gs.getMessage('ON').toUpperCase();
    statusColor = 'positive';
    statusIcon = 'check-outline';
} else {
    statusLabel = gs.getMessage('OFF').toUpperCase();
    statusColor = 'gray';
    statusIcon = 'ban-outline';
}
context.props_details.footer_highlight = {
    label: statusLabel,
    color: statusColor,
    icon: statusIcon,
    variant: 'secondary'
};
context.props_details.show_border=true;
