// SMS & Email Code Verification Type
  // add default parameters if there is not already
  handleDefaults();

  function handleDefaults() {
      gs.include('PwdVerificationParameterUtility');

      var utility = new PwdVerificationParameterUtility();

      var deviceType = "SMS";
      var complexityForEmail;
      var expiryForEmail;
      var pauseWindowForEmail;
      var maxPerDayForEmail;
      //Since Email verification params values are not coming from properties unlike SMS verification
      if (current.type.sys_id == '47cf0e830b233200572a6f3ef6673a00') {
          deviceType = "email";
          complexityForEmail = 6;
          expiryForEmail = 10;
          pauseWindowForEmail = 2;
          maxPerDayForEmail = 10;
      }

      // start fresh if changing type.
      if (!gs.nil(previous) && current.type.sys_id != previous.type.sys_id) {
          utility.clearOthers(['complexity', 'expiry', 'pause_window', 'max_per_day']);
      }
      // add the params.
      utility.addParamWithProperty('complexity', "password_reset.sms.default_complexity", 100,
          gs.getMessage("Number of digits in the verification code that is sent to the user's {0} device", deviceType), complexityForEmail);

      utility.addParamWithProperty('expiry', "password_reset.sms.expiry", 200,
          gs.getMessage('Number of minutes before the {0} verification code expires', deviceType), expiryForEmail);

      utility.addParamWithProperty('pause_window', "password_reset.sms.pause_window", 300,
          gs.getMessage('Number of minutes before the user can attempt to send another {0} verification code to the device', deviceType), pauseWindowForEmail);

      utility.addParamWithProperty('max_per_day', "password_reset.sms.max_per_day", 400,
          gs.getMessage('Maximum number of {0} verification codes to send to a particular device in one day', deviceType), maxPerDayForEmail);
  }
