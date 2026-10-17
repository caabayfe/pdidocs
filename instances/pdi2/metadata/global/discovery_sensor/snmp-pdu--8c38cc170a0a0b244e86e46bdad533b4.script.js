/**
 * Implements a sensor for devices with APC PDU capability (SNMP PowerNet-MIB).
 * 
 * Mike Currie mike.currie@service-now.com
 */
new DiscoverySensor({
    process: function() {
        this.parseOutput(payload); // from payload global...
    },
        
    parseOutput: function(document) {
        this.document = document;
        var current_load_amps      = XMLUtil.getText( this.document, '//apc/products/hardware/rPDU/rPDULoad/rPDULoadStatus/rPDULoadStatusEntry/rPDULoadStatusLoad');
        current.hardware_version   = XMLUtil.getText( this.document, '//apc/products/hardware/masterswitch/sPDUIdent/sPDUIdentHardwareRev');
        current.firmware_version   = XMLUtil.getText( this.document, '//apc/products/hardware/masterswitch/sPDUIdent/sPDUIdentFirmwareRev' );
        current.date_of_man        = XMLUtil.getText( this.document, '//apc/products/hardware/masterswitch/sPDUIdent/sPDUIdentDateOfManufacture' );
        var model_number           = XMLUtil.getText( this.document, '//apc/products/hardware/masterswitch/sPDUIdent/sPDUIdentModelNumber' ) ;
        current.master_state       = XMLUtil.getText( this.document, '//apc/products/hardware/masterswitch/sPDUMasterControl/sPDUMasterState');
        current.current_load_state = XMLUtil.getText( this.document, '//apc/products/hardware/rPDU/rPDULoad/rPDULoadStatus/rPDULoadStatusEntry/rPDULoadStatusLoadState');
        current.outlet_count       = XMLUtil.getText( this.document, '//apc/products/hardware/rPDU/rPDUIdent/rPDUIdentDeviceNumOutlets');
        current.current_load_amps  = parseInt(current_load_amps, 10 ) / 10.0;
        
        var load  = g_disco_functions.getXMLMemoryTable( 'load',  this.document, '//rPDU/rPDULoad/rPDULoadStatus/rPDULoadStatusEntry'   );
        var outlets  = g_disco_functions.getXMLMemoryTable( 'outlets',  this.document, '//rPDU/rPDUOutlet/rPDUOutletStatus/rPDUOutletStatusEntry'   );
        
        var makeAndModel =  MakeAndModelJS.fromNames('APC', model_number, 'hardware');
        current.manufacturer = makeAndModel.getManufacturerSysID();
        current.model_id = makeAndModel.getModelNameSysID();
        load.first();
        if (load.next()){
            current.current_load_amps = parseInt(load.getValue('rPDULoadStatusLoad'), 10) /10.0;
            current.current_load_state = load.getValue('rPDULoadStatusLoadState');
        }
        
        outlets.first();
        var reconciler = new ApcPduOutletReconciler(  this.getCmdbCi(), outlets  );
        reconciler.process();
        
        var sni = new SNMPNetworkInterfaces();
        sni.process(this.getCmdbCi(), this.document, false, g_probe.getAgent(), g_probe.getEccQueueRecord().getValue('sys_id'));
    },

    type: 'APCPDUSensor'
});
