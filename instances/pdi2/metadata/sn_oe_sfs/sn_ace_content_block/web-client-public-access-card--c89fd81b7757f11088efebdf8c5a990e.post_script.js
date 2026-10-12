var rec = new GlideRecord('sys_public');
rec.addQuery('sys_id', '2e4b293773e013004ab2369f2ef6a7a5');
rec.query();
var publicAccess = false;

if (rec.next()) {
    publicAccess = rec.getValue('active')  == "1";
} 
var statusLabel, statusColor, statusIcon;
if (publicAccess) {
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
