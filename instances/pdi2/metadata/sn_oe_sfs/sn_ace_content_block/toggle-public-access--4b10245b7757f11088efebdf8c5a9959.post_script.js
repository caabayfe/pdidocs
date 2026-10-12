context.props_details.disabled = gs.getCurrentApplicationId() !== '0d5bb8b9730303004ab2369f2ef6a737';
context.props_details.tooltip_text = gs.getCurrentApplicationId() !== '0d5bb8b9730303004ab2369f2ef6a737' ? sn_i18n.Message.getMessage('sn_oe_sfs','Public access setting can only be edited when {application} is the current application. Change the scope to make any updates.', {application: 'virtual agent web client'}) : '';
var rec = new GlideRecord('sys_public');
rec.addQuery('sys_id', '2e4b293773e013004ab2369f2ef6a7a5');
rec.query();
var publicAccess = false;
if (rec.next()) {
    publicAccess = rec.getValue('active');
} 

context.props_details.checked = publicAccess == "1";
