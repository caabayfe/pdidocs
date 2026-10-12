var ExperimentDao = Class.create();
ExperimentDao.prototype = {
  initialize: function () {
    this.TABLE_NAME = "sn_experiment_core_experiment";
  },

  /**
   * Gets an experiment by sys_id and returns an ExperimentDao
   * @param {String} sysId - The sys_id of the experiment record
   * @returns {Experiment|null} Experiment object or null if not found
   */
  getExperimentBySysId: function (sysId) {
    if (!sysId) {
      gs.warn("ExperimentDao.getExperimentBySysId: sysId is required");
      return null;
    }

    var gr = new GlideRecord(this.TABLE_NAME);
    if (gr.get(sysId)) {
      return new Experiment().initializeWithGr(gr);
    }
    return null;
  },

  /**
   * Gets raw experiment GR by key
   * @param {String} key - The key field value
   * @returns {Experiment|null} Experiment GR or null if not found
   */
  getExperimentGrByKey: function (key) {
    if (!key) {
      gs.warn("ExperimentDao.getExperimentByKey: key is required");
      return null;
    }

    var gr = new GlideRecord(this.TABLE_NAME);
    gr.addQuery("key", key);
    gr.query();

    if (gr.next()) {
      return gr;
    }
    return null;
  },

  /**
   * Gets an experiment by key and returns an ExperimentDao
   * @param {String} key - The key field value
   * @returns {Experiment|null} Experiment object or null if not found
   */
  getExperimentByKey: function (key) {
    if (!key) {
      gs.warn("ExperimentDao.getExperimentByKey: key is required");
      return null;
    }

    var gr = new GlideRecord(this.TABLE_NAME);
    gr.addQuery("key", key);
    gr.query();

    if (gr.next()) {
      return new Experiment().initializeWithGr(gr);
    }
    return null;
  },

  /**
   * Saves an Experiment object to the sn_experiment_core_experiment table
   * @param {Experiment} experiment - The Experiment object to save
   * @returns {String|null} The sys_id of the saved record, or null if save failed
   */
  saveExperiment: function (experiment) {
    if (!experiment || typeof experiment !== "object") {
      gs.error("ExperimentDao.saveExperiment: Valid Experiment object is required");
      return null;
    }

    try {
      var gr = new GlideRecord(this.TABLE_NAME);
      var sysId = experiment.getSysId();
      var isUpdate = false;

      if (gr.get(sysId)) {
        isUpdate = true;
      }

      if (!isUpdate) {
        gr.initialize();
        gr.setNewGuidValue(sysId);
        // For new feature flag experiment, opt out by deafult
        if(experiment.getCategory() === ExperimentationConstants.EXPERIMENT_CATEGORY.FEATURE_FLAG)
          gr.setValue("opt_out", true);
      }

      gr.setValue("name", experiment.getName());
      gr.setValue("description", experiment.getDescription());
      gr.setValue("start_time", experiment.getStartDate());
      gr.setValue("stickiness", experiment.getStickiness());
      gr.setValue("status", experiment.getStatus());
      gr.setValue("key", experiment.getKey());
      gr.setValue("instance_type", experiment.getInstanceType());
      gr.setValue("category", experiment.getCategory());
      gr.setValue("segment", experiment.getSegment());
      gr.setValue("feature_flag", experiment.getFeatureFlag());
      gr.setValue("is_ga", experiment.getIsGA());

      if (experiment.getCategory() === ExperimentationConstants.EXPERIMENT_CATEGORY.FEATURE_FLAG && experiment.getIsGA()) {
        gr.setValue("opt_out", false);
      }

      gr.update();
      return gr.getUniqueValue();
    } catch (error) {
      gs.error("ExperimentDao.saveExperiment: Error saving experiment to database: " + error.message);
      return null;
    }
  },

  type: "ExperimentDao",
};
