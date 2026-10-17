function include({ imports }) {
  function getApplicationInstallationHighlightedValue(installationStatus) {

    const installationStatusValueToDisplayValueMap = {
      true: 'Installed',
      false: 'Not installed',
      'update': 'Needs update',
      'updated': 'updated_uppercase'
    };
    const installationStatusValueToColorValueMap = {
      true: 'positive',
      false: 'critical',
      'update': 'high',
      'updated': 'positive'
    };
    const defaultInstallationStatusValue = false;

    return {
      label: installationStatusValueToDisplayValueMap[installationStatus] || installationStatusValueToDisplayValueMap[defaultInstallationStatusValue],
      color: installationStatusValueToColorValueMap[installationStatus] || installationStatusValueToColorValueMap[defaultInstallationStatusValue]
    };
  }

  function getApplicationLicensingHighlightedValue(licensingStatus) {
    const licensingStatusValueToDisplayValueMap = {
      'yes': 'Included in subscription',
      'no': 'Not included in subscription',
      'not_applicable': 'Check subscription'
    };
    const licensingStatusValueToColorValueMap = {
      'yes': 'positive',
      'no': 'critical',
      'not_applicable': 'low'
    };
    const defaultLicensingStatusValue = 'not_applicable';

    return {
      label: licensingStatusValueToDisplayValueMap[licensingStatus] || licensingStatusValueToDisplayValueMap[defaultLicensingStatusValue],
      color: licensingStatusValueToColorValueMap[licensingStatus] || licensingStatusValueToColorValueMap[defaultLicensingStatusValue]
    };
  }

  return { getApplicationInstallationHighlightedValue, getApplicationLicensingHighlightedValue };
}
