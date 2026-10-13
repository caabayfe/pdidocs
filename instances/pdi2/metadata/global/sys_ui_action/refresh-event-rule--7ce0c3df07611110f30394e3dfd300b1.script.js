gs.getSession().putClientData('em_refresh_event_id', current.getUniqueValue());

action.setRedirectURL('/em_match_rule_list.do?sysparm_view=refresh_event_rule&sysparm_query=event_classISEMPTY^ORevent_class=' + current.getValue('source'));

gs.addInfoMessage(gs.getMessage("Select an event rule to update with event data and then click \"Refresh Selected\" action"));
