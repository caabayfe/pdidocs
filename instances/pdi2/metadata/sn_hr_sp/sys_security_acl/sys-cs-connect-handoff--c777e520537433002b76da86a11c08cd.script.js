answer = false;
if (gs.getUser().getRoles().indexOf('sn_hr_sp.esc_admin') > -1 && current.connect_group.table == 'chat_queue_entry' && hr_PortalUtil.isPreChatQueue(current.connect_group.document.queue))
    answer = true;
