updateDevices();

function updateDevices() {
   var device = new GlideRecord('cmn_notif_device');
   device.addQuery('service_provider', current.sys_id);
   device.query();
   while(device.next()) {
      device.setForceUpdate(true);
      device.update();
   }
}
