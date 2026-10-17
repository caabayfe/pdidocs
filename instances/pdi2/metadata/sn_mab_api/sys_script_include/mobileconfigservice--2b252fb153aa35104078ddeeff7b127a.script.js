class MobileConfigService {
  constructor() {}

  getTypes() {
    const mobileConfigs = [];
    const mobileAppGR = new GlideRecord('sys_sg_mobile_application');
    mobileAppGR.orderBy('name');
    mobileAppGR.query();

    while (mobileAppGR.next()) {
      const label = mobileAppGR.getValue('name');
      const id = mobileAppGR.getValue('client_type_header');
      mobileConfigs.push({ label, id });
    }

    return mobileConfigs;
  }
}

module.exports = MobileConfigService;
