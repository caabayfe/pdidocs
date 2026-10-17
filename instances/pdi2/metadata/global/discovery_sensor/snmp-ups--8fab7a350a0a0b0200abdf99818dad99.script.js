/**
 * Implements a sensor for devices with generic UPS capability (SNMP UPS-MIB).
 * 
 * Tom Dilatush tom.dilatush@service-now.com
 */
new DiscoverySensor({
    process: function() {
        this.parseOutput(payload); // from payload global...
    },
        
    parseOutput: function(document) {
        var sgdp = new SNMPGatherDocParts();
        this.document = sgdp.gather(document, g_probe); // Document...
        
        var inputs  = g_disco_functions.getXMLMemoryTable( 'inputs',  this.document, '//upsObjects/upsInput/upsInputEntry'   );
        var outputs = g_disco_functions.getXMLMemoryTable( 'outputs', this.document, '//upsObjects/upsOutput/upsOutputEntry' );
        var bypass  = g_disco_functions.getXMLMemoryTable( 'bypass',  this.document, '//upsObjects/upsBypass/upsBypassEntry' );
        var alarms  = g_disco_functions.getXMLMemoryTable( 'alarms',  this.document, '//upsObjects/upsAlarm/upsAlarmEntry'   );
        
        // scale current and frequency values with the tables...
        inputs.first();
        while (inputs.next()) {
            inputs.setValue(  'upsInputFrequency', inputs.getValueInt( 'upsInputFrequency'  ) / 10.0);
            inputs.setValue(  'upsInputCurrent',   inputs.getValueInt( 'upsInputCurrent'    ) / 10.0);
        }
        bypass.first();
        while (bypass.next())
            bypass.setValue(  'upsBypassCurrent',  bypass.getValueInt( 'upsBypassCurrent'   ) / 10.0);
        outputs.first();
        while (outputs.next())
            outputs.setValue( 'upsOutputCurrent',  outputs.getValueInt( 'upsOutputCurrent'  ) / 10.0);
        
        // add a synthetic alarm category column, since they're all 'OID' on a generic UPS...
        alarms.addColumn('upsAlarmCategory');
        alarms.first();
        while (alarms.next())
            alarms.setValue('upsAlarmCategory', 'OID');
        
        var upsSoftwareVersion   = XMLUtil.getText(    this.document, '//upsObjects/upsIdent/upsIdentUPSSoftwareVersion'         );
        var agentSoftwareVersion = XMLUtil.getText(    this.document, '//upsObjects/upsIdent/upsIdentAgentSoftwareVersion'       );
        var attachedDevices      = XMLUtil.getText(    this.document, '//upsObjects/upsIdent/upsIdentAttachedDevices'            );
        var batteryStatus        = XMLUtil.getTextInt( this.document, '//upsObjects/upsBattery/upsBatteryStatus'                 );
        var secondsOnBattery     = XMLUtil.getTextInt( this.document, '//upsObjects/upsBattery/upsSecondsOnBattery'              );
        var estMinsRemaining     = XMLUtil.getTextInt( this.document, '//upsObjects/upsBattery/upsEstimatedMinutesRemaining'     );
        var estChargeRemaining   = XMLUtil.getTextInt( this.document, '//upsObjects/upsBattery/upsEstimatedChargeRemaining'      );
        var batteryVoltage       = XMLUtil.getTextInt( this.document, '//upsObjects/upsBattery/upsBatteryVoltage'                )  / 10.0;
        var batteryCurrent       = XMLUtil.getTextInt( this.document, '//upsObjects/upsBattery/upsBatteryCurrent'                )  / 10.0;
        var batteryTemperature   = XMLUtil.getTextInt( this.document, '//upsObjects/upsBattery/upsBatteryTemperature'            );
        var inputLineBads        = XMLUtil.getTextInt( this.document, '//upsObjects/upsInput/upsInputLineBads'                   );
        var outputSource         = XMLUtil.getTextInt( this.document, '//upsObjects/upsOutput/upsOutputSource'                   );
        var outputFrequency      = XMLUtil.getTextInt( this.document, '//upsObjects/upsOutput/upsOutputFrequency'                );
        var bypassFrequency      = XMLUtil.getTextInt( this.document, '//upsObjects/upsBypass/upsBypassFrequency'                );
        var nomInputVoltage      = XMLUtil.getTextInt( this.document, '//upsObjects/upsConfig/upsConfigInputVoltage'             );
        var nomInputFreq         = XMLUtil.getTextInt( this.document, '//upsObjects/upsConfig/upsConfigInputFreq'                )  / 10.0;
        var nomOutputVoltage     = XMLUtil.getTextInt( this.document, '//upsObjects/upsConfig/upsConfigOutputVoltage'            );
        var nomOutputFreq        = XMLUtil.getTextInt( this.document, '//upsObjects/upsConfig/upsConfigOutputFreq'               )  / 10.0;
        var ratedOutputVA        = XMLUtil.getTextInt( this.document, '//upsObjects/upsConfig/upsConfigOutputVA'                 );
        var ratedOutputPower     = XMLUtil.getTextInt( this.document, '//upsObjects/upsConfig/upsConfigOutputPower'              );
        var lowBatteryTime       = XMLUtil.getTextInt( this.document, '//upsObjects/upsConfig/upsConfigLowBattTime'              );
        var audibleStatus        = XMLUtil.getTextInt( this.document, '//upsObjects/upsConfig/upsConfigAudibleStatus'            );
        var lowXferVoltage       = XMLUtil.getTextInt( this.document, '//upsObjects/upsConfig/upsConfigLowVoltageTransferPoint'  );
        var highXferVoltage      = XMLUtil.getTextInt( this.document, '//upsObjects/upsConfig/upsConfigHighVoltageTransferPoint' );
        
        // update the CI's fields... 
        current.ups_software_version         = upsSoftwareVersion;
        current.agent_software_version       = agentSoftwareVersion;
        current.attached_devices             = attachedDevices;
        current.battery_status               = batteryStatus;
        current.seconds_on_battery           = secondsOnBattery;
        current.est_mins_remaining           = estMinsRemaining;
        current.est_charge_remaining         = estChargeRemaining;
        current.battery_voltage              = batteryVoltage;
        current.battery_current              = batteryCurrent;
        current.battery_temperature          = batteryTemperature;
        current.input_line_bads              = inputLineBads;
        current.output_source                = outputSource;
        current.output_freq                  = outputFrequency;
        current.bypass_freq                  = bypassFrequency;
        current.nom_input_volt               = nomInputVoltage;
        current.nom_input_freq               = nomInputFreq;
        current.nom_output_volt              = nomOutputVoltage;
        current.nom_output_freq              = nomOutputFreq;
        current.rated_output_va              = ratedOutputVA;
        current.rated_output_power           = ratedOutputPower;
        current.low_battery_threshold_mins   = lowBatteryTime;
        current.audible_alarm_status         = audibleStatus;
        current.low_voltage_transfer_point   = lowXferVoltage;
        current.high_voltage_transfer_point  = highXferVoltage;
        
        var uir = new GenericUPSInputsReconciler(  this.getCmdbCi(), inputs  );
        var uor = new GenericUPSOutputsReconciler( this.getCmdbCi(), outputs );
        var ubr = new GenericUPSBypassReconciler(  this.getCmdbCi(), bypass  );
        var uar = new GenericUPSAlarmsReconciler(  this.getCmdbCi(), alarms  );
        uir.process();
        uor.process();
        ubr.process();
        uar.process();
        
        var sni = new SNMPNetworkInterfaces();
        sni.process(this.getCmdbCi(), this.document, false, g_probe.getAgent(),
                    g_probe.getEccQueueRecord().getValue('sys_id'));
    },
    
    type: 'GenericUPSSensor'
});
