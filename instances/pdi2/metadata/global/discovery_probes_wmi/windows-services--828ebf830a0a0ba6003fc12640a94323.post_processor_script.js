new ProbePostProcessor({

    process : function() {  
		var dataArray = [];
		var dataArrayList = g_array_util.ensureArray(output.Win32_Service);

        for (var i = 0; i < dataArrayList.length; i++) {
            var element = dataArrayList[i];
            var dataArrayDef = {};

            dataArrayDef.name             = element.Name;
            dataArrayDef.display_name     = element.DisplayName;
            dataArrayDef.path_name        = element.PathName;
            dataArrayDef.service_state    = element.State;
            dataArrayDef.start_mode       = element.StartMode;
            dataArrayDef.service_type     = element.ServiceType;
            dataArrayDef.process_id       = element.ProcessId;
            dataArrayDef.can_be_paused    = element.AcceptPause;
            dataArrayDef.can_be_stopped   = element.AcceptStop;
            dataArrayDef.desktop_interact = element.DesktopInteract;
            dataArrayDef.account          = element.StartName;

            dataArray.push(dataArrayDef);
        }
		
		if(dataArray.length > 0)
			related_data.data_array = dataArray;		
	},
   
    type: "ProbePostProcessor"
});
