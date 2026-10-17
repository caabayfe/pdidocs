(function() {
  data.analytics_enabled = GlideProperties.getBoolean("glide.analytics.enabled");
  data.sp_analytics_plugin_active = GlidePluginManager.isActive('com.glide.service-portal.analytics');
  data.onTextMessage = sn_i18n.Message.getMessage("user-preferences-on-toggle-label", "On");
  data.offTextMessage = sn_i18n.Message.getMessage("user-preferences-off-toggle-label", "Off");
  data.privacyPolicyLink = GlideProperties.get("glide.analytics.privacy.link");

  var grRecord = $sp.getPortalRecord();
  var channelObj = $sp.getRecordElements(grRecord, 'communication_channels');
  var channelList = [];
  var channelValues = channelObj.communication_channels.value ? channelObj.communication_channels.value.split(',') : [];
  var channelDisplayValues = channelObj.communication_channels.display_value ? channelObj.communication_channels.display_value.split(',') : [];

  for (var i = 0; i < channelValues.length; i++) {
      channelList.push({ display: channelDisplayValues[i].trim(), value: channelValues[i].trim()});
  }
  channelList.sort(function(a, b) {
      return a.display.localeCompare(b.display);
  });

  data.channelList = channelList;
  data.hasChannelValues = (channelValues.length > 0);

  // populate the 'data' object
  // e.g., data.table = $sp.getValue('table');
  data.sysUserID = $sp.getParameter("sys_id");
  if (!data.sysUserID)
      data.sysUserID = gs.getUser().getID();
  var sysUserGR = new GlideRecord("sys_user");
  data.userExists = sysUserGR.get(data.sysUserID) && sysUserGR.canRead();

  if (data.userExists) {
    sysUserGR = GlideScriptRecordUtil.get(sysUserGR).getRealRecord();
    data.table = sysUserGR.getRecordClassName();
    data.name = sysUserGR.getValue("name");
    var loggedInSysUserID = gs.getUser().getID();
    data.connectEnabled = GlidePluginManager().isActive('com.glide.connect');
    data.liveProfileID = "";
    data.dateTimeFormat = gs.getDateTimeFormat();

    //get live profile id for sending connect messages
    if (GlidePluginManager().isActive('com.glideapp.live_common')) {
      var liveProfileGR = new GlideRecord("live_profile");
      liveProfileGR.addQuery("document", data.sysUserID);
      liveProfileGR.query();
      if (liveProfileGR.next()) {
        data.liveProfileID = liveProfileGR.getValue("sys_id");
        data.liveProfileModel = $sp.getForm("live_profile", data.liveProfileID)._fields;
        // live_profile short_description is shown here as "Bio", so popup label/hint must reflect that
        if (data.liveProfileModel.short_description) {
          data.liveProfileModel.short_description.label = gs.getMessage("Bio");
          data.liveProfileModel.short_description.hint = gs.getMessage("Biography");
        }
      } else
        data.connectEnabled = false; //can't find a live profile for this user, so lets not integrate Connect
    }

    data.isLoggedInUsersProfile = loggedInSysUserID.equals(data.sysUserID);
    var sysUserForm = $sp.getForm(data.table, data.sysUserID);
    data.sysUserView = sysUserForm._view;
    data.sysUserModel = sysUserForm._fields;
    data.sysUserModelList = [];



    //get state preferences
    data.preferencesEnabled = getPreferencesEnabled();

    data.continuousAuthCorrelationId = data.preferencesEnabled.isEligibleForContinuousAuthentication ? g_scratchpad.caCorrelationId : '';

    //get the user Preferences of the user
    data.userPreferences = getUserPreferences(data.sysUserID);
    data.userAnalyticsDetails = getUserAnalyticsDetails();
    data.preferredChannels = data.userPreferences.preferred_channels.value;
    if (data.preferredChannels)
        data.preferredChannelsList = data.preferredChannels.split(',');

    data.themeVariantMappings = getThemeVariants();
    data.variantSelector = data.themeVariantMappings ? $sp.getWidget('theme-variant-selector') : "";
  }

    //get the certificate header
    if (input.action == "certRegister") {
      var request = GlideTransaction.get().getRequest();
      var certHeader = request.getHeader("X-Client-Cert");
      if (!certHeader) {
        data.certHeader = "false";
        data.certErrorMsg = gs.getMessage("Failed to register PIV/CAC certificate to the user account. Please close your browser, ensure your card is inserted and try again");
      }	
    }

  function getUserAnalyticsDetails() {
    var userAnalyticsDetails = $sp.getUserTrackingDetails();
    return JSON.parse(userAnalyticsDetails);
  }

  // returns the user preferences from the platform
  function getUserPreferences(userID){
    var user = GlideUser.getUserByID(userID);
    var analyticsPreference = user.getPreference('enable_analytics');
    var preferred_channels = user.getPreference('sp_preferred_communication_channels');
    // If user's analytics preference exists in User Preferences, then delete the entry in the table
    // this analytics preference logic needs to be removed later
    if(analyticsPreference != null) {
      user.setPreference('enable_analytics', null);
      analyticsPreference = (analyticsPreference == 'true');
    }
    return {
      accessibility: {
        key: 'glide.ui.accessibility',
        value: user.getPreference('glide.ui.accessibility') == 'true'
      },
      voiceInput: {
        key: 'glide.ui.accessibility.voice_input.nava',
        value: user.getPreference('glide.ui.accessibility.voice_input.nava') == 'true'
      },
      analytics: {
        key: 'enable_analytics',
        value: analyticsPreference
      },
      preferred_channels: {
          key: 'preferred_channels',
          value: preferred_channels
      }
    }
  }

  // read the proper state so we can show/hide preferences in the preferences table
  function getPreferencesEnabled() {
    var showEncryption = pm.isActive('com.glide.encryption') && 
        gs.getProperty('glide_encryption.cle_replatforming_with_kmf') !== 'opt_in' && 
        new SNC.ConcoursePickerGenerator().hasMultipleEncryptionChoices();
        
    //Enabling certificate based authentication per portal
    var portalRecord = $sp.getPortalRecord();
    if (portalRecord && (portalRecord.getValue('enable_certificate_based_authentication') == 1))
      var cert_based_auth = gs.getProperty('glide.authenticate.mutual.enabled', 'false') == 'true';

    // Show voice input toggle only if the portal uses AI native chat/dialog AND the admin has enabled voice_input in the assistant's deployment config
    var voiceInputEnabled = false;
    var aiNativeExperience = $sp.isAINativeChatEnabled() ? 'ai_native_chat' : ($sp.isAINativeDialogEnabled() ? 'ai_native_dialog' : '');
    if (portalRecord && aiNativeExperience) {
      var deploymentId = new PortalNAChatUtils().getNowAssistDeploymentId(portalRecord.getValue('sys_id'), aiNativeExperience);
      if (deploymentId) {
        var attrGR = new GlideRecord('sys_now_assist_deployment_config_attributes');
        attrGR.addQuery('deployment_config.now_assist_deployment', deploymentId);
        attrGR.addQuery('name', 'voice_input_enabled');
        attrGR.query();
        voiceInputEnabled = attrGR.next() && attrGR.getValue('value') == 'true';
      }
    }

    return {
      // show preferences only if the sys_id of the url is the same user that is logged on
    preferencesPanelEnabled : GlideStringUtil.nil($sp.getParameter('sys_id')) || $sp.getParameter('sys_id') == gs.getUserID(),

      //certain properties are visible in some cases
      languageEnabled : pm.isActive('com.glide.i18n') && gs.getProperty('glide.ui.language_picker.enabled', 'true') == 'true',
      timezoneEnabled: gs.hasRole(gs.getProperty('glide.timezone_changer.roles')),
      encryptionEnabled: showEncryption,
      mfaEnabled: gs.getProperty('glide.authenticate.multifactor', "false") == "true",
      certAuthEnabled: cert_based_auth,
      trustedDeviceEnabled: gs.getProperty('glide.authenticate.preauth.allow.trusted.device', "false") == "true" && gs.getProperty('glide.authenticate.auth.policy.enabled', "false") == "true" && new GlideImpersonate().isImpersonating() == false,
      identityCenterEnabled : pm.isActive('com.snc.identity_center') && !gs.getUser().getRoles().contains("snc_external"),
      isEligibleForContinuousAuthentication : SNC.HighAssuranceUtil.isEligibleForContinuousAuthentication() && !SNC.HighAssuranceUtil.isCertificateBasedAuthentication(),
      voiceInputEnabled: voiceInputEnabled,
      softPinEnrollmentEnabled: gs.getProperty('glide.auth_factors.softpin.enrollment.enabled', 'false') == 'true'
    }
  }

  function getThemeVariants() {
    var variantMappings = JSON.parse($sp.getPortalM2mThemeSysIds($sp.getValue('sys_id')));
    if (variantMappings.length > 0)
      variantMappings.unshift({
        name: "Default",
        sys_id: null
      });
    return variantMappings;
  }
})();
