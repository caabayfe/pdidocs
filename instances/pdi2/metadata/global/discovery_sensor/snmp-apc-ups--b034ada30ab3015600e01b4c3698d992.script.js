/**
 * Implements a sensor for devices with APC UPS capability (SNMP PowerNet-MIB).
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
        
        var MemoryTable = GlideMemoryTable;

        var inputs   = new MemoryTable( 'inputs',  'upsInputLineIndex,upsInputFrequency,upsInputVoltage,upsInputCurrent,upsInputTruePower' );
        var outputs  = new MemoryTable( 'outputs', 'upsOutputLineIndex,upsOutputPercentLoad,upsOutputVoltage,upsOutputCurrent,upsOutputPower' );
        var alarms   = new MemoryTable( 'alarms',  'upsAlarmId,upsAlarmType,upsAlarmTime,upsAlarmCategory' );
        var attached = g_disco_functions.getXMLMemoryTable( 'attached', this.document, '//ups/upsConfig/upsBasicConfig/upsBasicConfigDeviceEntry' );
        
        // process the attached devices list to get our attached devices string...
        var attachedDevices = '';
        attached.first();
        while (attached.next()) {
            var dn = attached.getValue('deviceName');
            if (dn) {
                if (attachedDevices.length > 0)
                    attachedDevices += ', ';
                attachedDevices += dn;
            }
        }
        
        var upsSoftwareVersion   = XMLUtil.getText(    this.document, '//ups/upsIdent/upsAdvIdent/upsAdvIdentFirmwareRevision'              );
        var batteryStatus        = XMLUtil.getTextInt( this.document, '//ups/upsBattery/upsBasicBattery/upsBasicBatteryStatus'              );
        var secondsOnBattery     = XMLUtil.getTextInt( this.document, '//ups/upsBattery/upsBasicBattery/upsBasicBatteryTimeOnBattery'       ) / 100;
        var batteryLastReplaced  = XMLUtil.getText(    this.document, '//ups/upsBattery/upsBasicBattery/upsBasicBatteryLastReplaceDate'     );
        var estMinsRemaining     = XMLUtil.getTextInt( this.document, '//ups/upsBattery/upsAdvBattery/upsAdvBatteryRunTimeRemaining'        ) / (60 * 100);
        var estChargeRemaining   = XMLUtil.getTextInt( this.document, '//ups/upsBattery/upsAdvBattery/upsAdvBatteryCapacity'                );
        var estHPChargeRemaining = XMLUtil.getTextInt( this.document, '//ups/upsBattery/upsHighPrecBattery/upsHighPrecBatteryCapacity'      ) / 10.0;
        var batteryVoltage       = XMLUtil.getTextInt( this.document, '//ups/upsBattery/upsAdvBattery/upsAdvBatteryActualVoltage'           );
        var batteryHPVoltage     = XMLUtil.getTextInt( this.document, '//ups/upsBattery/upsHighPrecBattery/upsHighPrecBatteryActualVoltage' ) / 10.0;
        var batteryCurrent       = XMLUtil.getTextInt( this.document, '//ups/upsBattery/upsAdvBattery/upsAdvBatteryCurrent'                 );
        var batteryHPCurrent     = XMLUtil.getTextInt( this.document, '//ups/upsBattery/upsHighPrecBattery/upsHighPrecBatteryCurrent'       ) / 10.0;
        var batteryTemperature   = XMLUtil.getTextInt( this.document, '//ups/upsBattery/upsAdvBattery/upsAdvBatteryTemperature'             );
        var batteryHPTemperature = XMLUtil.getTextInt( this.document, '//ups/upsBattery/upsHighPrecBattery/upsHighPrecBatteryTemperature'   ) / 10.0;
        var basicOutput          = XMLUtil.getText(    this.document, '//ups/upsState/upsBasicState/upsBasicStateOutputState'               );
        var advAbnormal          = XMLUtil.getText(    this.document, '//ups/upsState/upsAdvState/upsAdvStateAbnormalConditions'            );
        var advSymmetra3Phase    = XMLUtil.getText(    this.document, '//ups/upsState/upsAdvState/upsAdvStateSymmetra3PhaseSpecificFaults'  );
        var advDP300E            = XMLUtil.getText(    this.document, '//ups/upsState/upsAdvState/upsAdvStateDP300ESpecificFaults'          );
        var advSymmetra          = XMLUtil.getText(    this.document, '//ups/upsState/upsAdvState/upsAdvStateSymmetraSpecificFaults'        );
        var advSmartUPS          = XMLUtil.getText(    this.document, '//ups/upsState/upsAdvState/upsAdvStateSmartUPSSpecificFaults'        );
        var outputSource         = XMLUtil.getTextInt( this.document, '//ups/upsOutput/upsBasicOutput/upsBasicOutputStatus'                 ) + 100;
        var outputFrequency      = XMLUtil.getTextInt( this.document, '//ups/upsOutput/upsAdvOutput/upsAdvOutputFrequency'                  );
        var outputHPFrequency    = XMLUtil.getTextInt( this.document, '//ups/upsOutput/upsHighPrecOutput/upsHighPrecOutputFrequency'        ) / 10.0;
        var outputVoltage        = XMLUtil.getTextInt( this.document, '//ups/upsOutput/upsAdvOutput/upsAdvOutputVoltage'                    );
        var outputHPVoltage      = XMLUtil.getTextInt( this.document, '//ups/upsOutput/upsHighPrecOutput/upsHighPrecOutputVoltage'          ) / 10.0;
        var outputCurrent        = XMLUtil.getTextInt( this.document, '//ups/upsOutput/upsAdvOutput/upsAdvOutputCurrent'                    );
        var outputHPCurrent      = XMLUtil.getTextInt( this.document, '//ups/upsOutput/upsHighPrecOutput/upsHighPrecOutputCurrent'          ) / 10.0;
        var outputLoad           = XMLUtil.getTextInt( this.document, '//ups/upsOutput/upsAdvOutput/upsAdvOutputLoad'                       );
        var outputHPLoad         = XMLUtil.getTextInt( this.document, '//ups/upsOutput/upsHighPrecOutput/upsHighPrecOutputLoad'             ) / 10.0;
        var inputFrequency       = XMLUtil.getTextInt( this.document, '//ups/upsInput/upsAdvInput/upsAdvInputFrequency'                     );
        var inputHPFrequency     = XMLUtil.getTextInt( this.document, '//ups/upsInput/upsHighPrecInput/upsHighPrecInputFrequency'           ) / 10.0;
        var inputVoltage         = XMLUtil.getTextInt( this.document, '//ups/upsInput/upsAdvInput/upsAdvInputLineVoltage'                   );
        var inputHPVoltage       = XMLUtil.getTextInt( this.document, '//ups/upsInput/upsHighPrecInput/upsHighPrecInputLineVoltage'         ) / 10.0;
        var nomOutputVoltage     = XMLUtil.getTextInt( this.document, '//ups/upsConfig/upsAdvConfig/upsAdvConfigRatedOutputVoltage'         );
        var lowXferVoltage       = XMLUtil.getTextInt( this.document, '//ups/upsConfig/upsAdvConfig/upsAdvConfigLowTransferVolt'            );
        var highXferVoltage      = XMLUtil.getTextInt( this.document, '//ups/upsConfig/upsAdvConfig/upsAdvConfigHighTransferVolt'           );
        var audibleStatus        = XMLUtil.getTextInt( this.document, '//ups/upsConfig/upsAdvConfig/upsAdvConfigAlarm'                      );
        var model_id             = XMLUtil.getText(    this.document, '//upsMIB/upsObjects/upsIdent/upsIdentModel'                          );
        var manufacturer         = XMLUtil.getText(    this.document, '//upsMIB/upsObjects/upsIdent/upsIdentManufacturer'                   );

        var makeAndModel         = MakeAndModelJS.fromNames(manufacturer, model_id, 'hardware');

        // map the APC alarm config codes to the generic codes...
        var apcToGeneric = [1, 2, 2, 1, 3];
        if ((audibleStatus < 0) || (audibleStatus > 4))
            audibleStatus = 0;
        audibleStatus = apcToGeneric[audibleStatus];
        
        // some processing of the retrieved values...
        var battLastReplacedGD = new GlideDate();
        battLastReplacedGD.setDisplayValue(batteryLastReplaced);
        if (estHPChargeRemaining > 0) 
            estChargeRemaining = estHPChargeRemaining;
        if (batteryHPVoltage > 0) 
            batteryVoltage = batteryHPVoltage;
        if (batteryHPCurrent > 0) 
            batteryCurrent = batteryHPCurrent;
        if (batteryHPTemperature > 0) 
            batteryTemperature = batteryHPTemperature;
        if (outputHPFrequency > 0)
            outputFrequency = outputHPFrequency;
        if (outputHPVoltage > 0)
            outputVoltage = outputHPVoltage;
        if (outputHPCurrent > 0)
            outputCurrent = outputHPCurrent;
        if (outputHPLoad > 0)
            outputLoad = outputHPLoad;
        if (inputHPFrequency > 0)
            inputFrequency = inputHPFrequency;
        if (inputHPVoltage > 0)
            inputVoltage = inputHPVoltage;
            
        // synthesize output power (since we can't read it directly), and synthesize an output entry...
        var outputPower = (outputVoltage * outputCurrent).toFixed(2);


        outputs.addRow();
        outputs.setValue( 'upsOutputLineIndex',   1             );
        outputs.setValue( 'upsOutputPercentLoad', outputLoad    );
        outputs.setValue( 'upsOutputVoltage',     outputVoltage );
        outputs.setValue( 'upsOutputCurrent',     outputCurrent );
        outputs.setValue( 'upsOutputPower',       outputPower   );
        
        // synthesize an input entry... ,,,upsInputCurrent,upsInputTruePower
        inputs.addRow();
        inputs.setValue( 'upsInputLineIndex', 1              );
        inputs.setValue( 'upsInputFrequency', inputFrequency );
        inputs.setValue( 'upsInputVoltage',   inputVoltage   );
            
        // process all our alarms...
        this.extractAlarms( alarms, 'APC Basic',            basicOutput       );
        this.extractAlarms( alarms, 'APC Abnormal',         advAbnormal       );
        this.extractAlarms( alarms, 'APC Symmetra 3-Phase', advSymmetra3Phase );
        this.extractAlarms( alarms, 'APC Symmetra',         advDP300E         );
        this.extractAlarms( alarms, 'APC DP300E',           advSymmetra       );
        this.extractAlarms( alarms, 'APC Smart-UPS',        advSmartUPS       );

        // update the CI's fields...
        current.ups_software_version         = upsSoftwareVersion;
        current.attached_devices             = attachedDevices;
        current.battery_status               = batteryStatus;
        current.seconds_on_battery           = secondsOnBattery;
        current.battery_last_replaced        = battLastReplacedGD;
        current.est_mins_remaining           = estMinsRemaining;
        current.est_charge_remaining         = estChargeRemaining;
        current.battery_voltage              = batteryVoltage;
        current.battery_current              = batteryCurrent;
        current.battery_temperature          = batteryTemperature;
        current.output_source                = outputSource;
        current.output_freq                  = outputFrequency;
        current.nom_output_volt              = nomOutputVoltage;
        current.audible_alarm_status         = audibleStatus;
        current.low_voltage_transfer_point   = lowXferVoltage;
        current.high_voltage_transfer_point  = highXferVoltage;
        current.manufacturer                 = makeAndModel.getManufacturerSysID();
        current.model_id                     = makeAndModel.getModelNameSysID();

        
        var uir = new GenericUPSInputsReconciler(  this.getCmdbCi(), inputs  );
        var uor = new GenericUPSOutputsReconciler( this.getCmdbCi(), outputs );
        var uar = new GenericUPSAlarmsReconciler(  this.getCmdbCi(), alarms  );
        uir.process();
        uor.process();
        uar.process();
        
        var sni = new SNMPNetworkInterfaces();
        sni.process(this.getCmdbCi(), this.document, false, g_probe.getAgent(), 
                    g_probe.getEccQueueRecord().getValue('sys_id'));
    },
    
    /*
     * Extracts the alarms from the given bits (a string of up to 64 1s and 0s), using the given category and putting the results into the given alarms 
     * XMLMemoryTable.
     */
    extractAlarms: function(alarms, category, bits) {
        if (!bits)
            return;

        var ourBits = ''+bits;
        for (var i = 1; i <= ourBits.length; i++) {
            var ourBit = ourBits.substr(ourBits.length - i, 1);
            if (ourBit == '1') {
                var gr = new GlideRecord('ups_alarm');
                gr.addQuery('category', category);
                gr.addQuery('id', '' + i);
                gr.query();
                if (gr.next()) {
                    alarms.addRow();
                    alarms.setValue('upsAlarmId', category + '-' + i);
                    alarms.setValue('upsAlarmCategory', category);
                }
            }
        }
    },
    
    type: 'APCUPSSensor'
});
