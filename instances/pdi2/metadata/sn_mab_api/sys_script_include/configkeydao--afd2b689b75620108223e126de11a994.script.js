class ConfigKeyDAO {
  constructor() {
    this.glideRecord = new GlideRecord('sys_sg_mobile_builder_config');
    this.familyVersionMap = {
      australia: 29,
      zurich: 28,
      yokohama: 27,
    };
  }

  getFamilyVersionNumber() {
    var sessionService = new sn_mab_api.SessionService();
    var familyVersion = sessionService.getFamilyVersion();

    return this.familyVersionMap[familyVersion];
  }

  evaluateCompatibility(familyVersion, gr) {
    var evaluator = new GlideScopedEvaluator();
    evaluator.putVariable('FAMILY_VERSION', familyVersion);

    return evaluator.evaluateScript(gr, 'compatible', null);
  }

  getClosestCompatible(compatibleRecords, familyVersion) {
    const comparisonMap = compatibleRecords.reduce((acc, record) => {
      const versionNumber = record.compatible.match(/\d+/g);
      const absoluteValue = Math.abs(versionNumber - familyVersion);
      if (acc[absoluteValue]) {
        // If for some reason there's even a duplicate when comparing the differences from the
        // family version, still throw the old overlapping versions error
        new sn_mab_api.ErrorHandler().throwBadConfigError(
          gs.getMessage(
            '{0} contains overlapping versioned mobile builder configs',
            versionedDuplicateConfigKey
          )
        );
        return acc
      }
      return { ...acc, [absoluteValue]: record }
    }, {});

    const lowestDifference = Math.min(...Object.keys(comparisonMap));
    return comparisonMap[lowestDifference];
  }

  /**
   *
   * @param configKeys {[]}
   * @return {null|*|{TreeConfigurationNode}}
   */
  getTreeConfigByConfigKeys(configKeys) {
    var gr = this.glideRecord;
    var familyVersionNumber = this.getFamilyVersionNumber();

    gr.addQuery('config_key', 'IN', configKeys.join(','));
    gr.orderByDesc('config_key');

    gr.query();

    if (gr.getRowCount() > 1) {
      var compatibleRecords = [];
      var emptyCompatibleRecords = [];
      while (gr.next()) {
        var tn = new sn_mab_api.TreeConfigurationNode(gr);
        if (
          tn.compatible &&
          this.evaluateCompatibility(familyVersionNumber, gr)
        ) {
          compatibleRecords.push(tn);
        } else if (!tn.compatible) {
          emptyCompatibleRecords.push(tn);
        }
      }

      if (compatibleRecords.length > 1) {
        return this.getClosestCompatible(compatibleRecords, familyVersionNumber);
      }
      if (emptyCompatibleRecords.length > 1) {
        var baseDuplicateConfigKey = emptyCompatibleRecords[0].configKey;
        new sn_mab_api.ErrorHandler().throwBadConfigError(
          gs.getMessage(
            '{0} contains overlapping base mobile builder configs',
            baseDuplicateConfigKey
          )
        );
      }

      if (compatibleRecords.length === 1) {
        return compatibleRecords[0];
      }

      if (emptyCompatibleRecords.length === 1) {
        return emptyCompatibleRecords[0];
      }
    }
    if (gr.next()) return new sn_mab_api.TreeConfigurationNode(gr);

    return null;
  }
}

module.exports = ConfigKeyDAO;
