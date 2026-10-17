/**
 * userPreferenceUtils
 * @param args
 * @return {{getUserPreference: (function(*): boolean)}}
 */
function include(...args) {
  const userPrefs = args[1];

  /**
   * getUserPreference method returns user preference value.
   *
   * @param preference
   * @return {boolean}
   */
  const getUserPreference = (preference) => {
    if (userPrefs[preference] != undefined)
      return userPrefs[preference] === 'true' || userPrefs[preference] === true;

    return false;
  };

  return {
    getUserPreference: getUserPreference,
  };
}
