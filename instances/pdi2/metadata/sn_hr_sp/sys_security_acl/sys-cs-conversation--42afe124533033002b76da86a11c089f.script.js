answer = false;
var connectHandoff;
if (gs.getUser().getRoles().indexOf('sn_hr_sp.esc_admin') > -1) {
    connectHandoff = new GlideRecord('sys_cs_connect_handoff');
    if (connectHandoff.get('cs_conversation', current.getUniqueValue()) && connectHandoff.connect_group.table == 'chat_queue_entry' && hr_PortalUtil.isPreChatQueue(connectHandoff.connect_group.document.queue))
        answer = true;
}
