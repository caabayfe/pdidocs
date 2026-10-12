class ApplicationService {
  constructor() {
    this.errorHandler = new ErrorHandler();
  }

  getApplications(queryParams) {
    var allApps = [];
    var applicationName =
      queryParams.applicationName && queryParams.applicationName[0]
        ? queryParams.applicationName[0]
        : '';

    allApps = this._getCustomApps(applicationName);
    var global = this._getGlobalScope();
    if (global !== null) allApps.push(global);
    return allApps;
  }

  _getGlobalScope() {
    var gr = new GlideRecordSecure('sys_scope');
    if (gr.get('global')) return this._getAppDetails(gr);
    else return null;
  }

  _getCustomApps(applicationName) {
    var gr = new GlideRecordSecure('sys_app'),
      application = [];

    gr.addQuery('private', false);
    if (!gs.nil(applicationName))
      gr.addQuery('name', 'CONTAINS', applicationName);
    gr.orderByDesc('sys_created_on');
    gr.query();

    while (gr.next()) {
      application.push(this._getAppDetails(gr));
    }

    var storeAppGR = new GlideRecordSecure('sys_store_app');
    storeAppGR.addQuery('private', false);
    storeAppGR.addQuery('active', true);
    if (!gs.nil(applicationName))
      storeAppGR.addQuery('name', 'CONTAINS', applicationName);
    storeAppGR.orderByDesc('sys_created_on');
    storeAppGR.query();

    while (storeAppGR.next()) {
      application.push(this._getAppDetails(storeAppGR));
    }

    return application;
  }

  _getAppDetails(app) {
    var details = {};

    details.sysId = app.getValue('sys_id');
    details.shortDescription = app.getValue('short_description') || '';
    details.name = app.name.toString();
    details.scope = app.getValue('scope');
    details.active = !!app.getValue('active');
    details.sysCreatedBy = app.getDisplayValue('sys_created_by');
    details.sysUpdatedBy = app.getDisplayValue('sys_updated_by');
    details.sysCreatedOn = app.getDisplayValue('sys_created_on');
    details.sysUpdatedOn = app.getDisplayValue('sys_updated_on');
    return details;
  }
}

module.exports = ApplicationService;
