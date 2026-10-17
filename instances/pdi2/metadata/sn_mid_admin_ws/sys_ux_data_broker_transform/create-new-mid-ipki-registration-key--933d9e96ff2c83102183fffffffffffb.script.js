function transform(input) {
    return new sn_mid_admin_ws.MidSetupService().createRegistrationKey(
          input.assignedToUserSysId,                                                                           
          input.validityInMinutes
      );
}
