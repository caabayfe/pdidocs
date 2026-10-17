function onLoad() {
   var communicationChannels = g_scratchpad.sp_communication_channels ? JSON.parse(g_scratchpad.sp_communication_channels) : null;
   if (!communicationChannels || (typeof communicationChannels === 'object' && Object.keys(communicationChannels).length === 0))
      g_form.setVisible('communication_channels', false);
   else
      g_form.setVisible('communication_channels', true);
}
