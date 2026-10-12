class SessionService {
  constructor() {
    this.mabApiPropertyNamePrefix = 'sn_mab_api.';
    this.mabApiAllowedPropertyNames = [
      'glide.appcreator.company.code',
      'glide.appcreator.company.friendly_name',
      'instance_name',
      'glide.sg.image_recognition.search.enable',
      'glide.ui.polaris.experience',
    ];
    this.validVersions = ['australia','zurich','yokohama'];
    this.fallBackVersion = 'zurich';
    this.familyVersionMap = {
      australia: 29,
      zurich: 28,
      yokohama: 27,
    };

    this.pluginManager = new GlidePluginManager();
    this.nowAssistSkillWrapper = new NowAssistSkillWrapper();
  }

  getFamilyVersion() {
    var rawFamilyVersion = gs.getProperty('glide.buildname');
    return this.determineFamilyVersion(rawFamilyVersion);
  }

  getSessionInfo(requestedData) {
    var propertyKeys = requestedData.propertyKeys;
    var preferenceNames = requestedData.preferenceNames;
    var buildNameKey = 'glide.buildname';
    var familyVersionNumberKey = 'glide.familyVersionNumber';
    var aisEnabledKey = 'isAisEnabled';
    var genAiEnabledKey = 'isGenAiEnabled';
    var sessionInfo = {};
    var user = gs.getUser();

    sessionInfo.userId = gs.getUserID();
    sessionInfo.firstName = user.getFirstName();
    sessionInfo.lastName = user.getLastName();
    sessionInfo.fullName = user.getDisplayName();
    sessionInfo.roles = user.getRoles();
    sessionInfo.textDirection = this._getTextDirection();

    if (propertyKeys && propertyKeys.length > 0)
      sessionInfo.propertyValues = this._getPropertyValues(propertyKeys);
    else sessionInfo.propertyValues = {};

    if (preferenceNames && preferenceNames.length > 0)
      sessionInfo.preferenceValues =
        this._getUserPreferenceValues(preferenceNames);

    var rawFamilyVersion = gs.getProperty(buildNameKey);
    var familyVersion = this.determineFamilyVersion(rawFamilyVersion);
    sessionInfo.propertyValues[buildNameKey] = familyVersion;
    sessionInfo.propertyValues[familyVersionNumberKey] =
      this.familyVersionMap[familyVersion];
    
    const isAisEnabled = this._getAisStatus();
    sessionInfo[aisEnabledKey] = isAisEnabled;

    const isGenAiEnabled = this._getGenAiStatus();
    sessionInfo[genAiEnabledKey] = isGenAiEnabled;

    return sessionInfo;
  }

  _getSession() {
    return gs.getSession();
  }

  _getLanguageId() {
    return this._getSession().getLanguage();
  }

  _getTextDirection() {
    var languageId = this._getLanguageId();
    var langaugeGr = new GlideRecord('sys_language');
    langaugeGr.addQuery('id', languageId);
    langaugeGr.query();
    return langaugeGr.next() ? langaugeGr.getValue('text_direction') : null;
  }

  _getPropertyValues(propertyKeys) {
    var propertyValues = {};

    propertyKeys.forEach(function (key) {
      if (
        key &&
        (key.startsWith(this.mabApiPropertyNamePrefix) ||
          this.mabApiAllowedPropertyNames.indexOf(key) != -1)
      ) {
        var propertyValue = gs.getProperty(key);
        if (propertyValue) propertyValues[key] = propertyValue;
      } else gs.warn(gs.getMessage('{0} property is not accessible through the MAB API', key));
    }, this);

    return propertyValues;
  }

  _getUserPreferenceValues(preferenceNames) {
    var preferenceValues = {};

    preferenceNames.forEach(function (name) {
      var preferenceValue = gs.getUser().getPreference(name);
      if (preferenceValue) preferenceValues[name] = preferenceValue;
    }, this);

    return preferenceValues;
  }

  _getAisStatus() {
    return new AiHealthStatus().areAllSystemsOperationalForAisInMab();
  }

    _getGenAiStatus() {
        return this.isNowAssistInstalled() && this._isNowAssistCardMappingSkillAvailable();
    }

    _isNowAssistCardMappingSkillAvailable() {
        try {
            this.nowAssistSkillWrapper.validateCardMappingSkillIsAvailable();
            return true;
        } catch (error) {
            return false;
        }
    }

  /**
   * Removes spacial characters, changes toLowerCase and trims trailing and leading whitespace
   * @param {string} familyVersion
   */
  scrubFamilyVersion(familyVersion) {
    var specialCharactersRemoved = familyVersion.replace(/[^\w\s]/gi, '');
    return specialCharactersRemoved.trim().toLowerCase();
  }

  /**
   * Tries to match the scrubbed family version against our list of validVersions.
   * If there is no match then it defaults to our fallBackVersion.
   * @param {string} familyVersion
   * @returns {string} validFamilyVersion
   */
  determineFamilyVersion(familyVersion) {
    var scrubbedFamilyVersion = this.scrubFamilyVersion(familyVersion);
    for (var i = 0; i < this.validVersions.length; i++) {
      var validVersion = this.validVersions[i];
      if (scrubbedFamilyVersion.includes(validVersion)) return validVersion;
    }
    return this.fallBackVersion;
  }

  isNowAssistInstalled() {
    return this.pluginManager.isActive('com.now_assist_core');
  }
}

module.exports = SessionService;
