class TemplateConfigRetrievalService {
  constructor() {
    this.configResponse = new ConfigResponse();
    this.validationHandler = new ValidationHandler();
    this.errorHandler = new ErrorHandler();
  }

  /*
   * The reason this "retrieveConfigTemplate" function exists is to avoid using the
   * "Mobile Builder Configurations" records when retrieving individual, empty table schemas.
   */
  retrieveConfigTemplate(tableName, overrideValues) {
    if (!tableName)
      this.errorHandler.throwBadRequestError(
        'Invalid input received for getConfiguration: tableName is invalid.'
      );

    // this manditory because we will always require an override for the sys_id
    if (!overrideValues)
      this.errorHandler.throwBadRequestError(
        'Invalid input received for getConfiguration: overrideValues is invalid.'
      );

    if (!overrideValues.hasOwnProperty('sys_id'))
      this.errorHandler.throwBadRequestError(
        'Invalid input received for getConfiguration: overrideValues.sys_id is invalid.'
      );

    const templateSysId = overrideValues.sys_id;
    const includedMetadataFields = overrideValues.includedMetadataFields
      ? overrideValues.includedMetadataFields
      : [];

    let templateConfigNode = this.getTemplateConfigNodeForTable(
      tableName,
      includedMetadataFields
    );
    if (overrideValues.hasOwnProperty('templateValues'))
      templateConfigNode = this.overrideTemplateValues(
        overrideValues.templateValues,
        templateConfigNode
      );

    this.configResponse.addConfigNode(
      tableName,
      templateSysId,
      templateConfigNode
    );

    return this.configResponse;
  }

  getElementValue(value) {
    if (value === 0) {
      return value;
    } else if (!value) {
      return '';
    }
    return value;
  }

  getTemplateConfigNodeForTable(tableName, includedMetadataFields) {
    if (!this.validationHandler.isValidTable(tableName))
      this.errorHandler.throwNotFoundError(
        'Does not exist for table: ' + tableName
      );

    if (!this.validationHandler.isTableAccessible(tableName))
      this.errorHandler.throwBadRequestError(
        'Is not accessible for table: ' + tableName
      );

    // we use the grs because this is a non-transactional function
    // if it were transactional we'd use the daoCache
    const grs = new GlideRecordSecure(tableName);
    grs.newRecord();
    const elements = grs.getElements();
    const returnObject = {};

    // value and displayValue are included because the front end expects them to be in the object
    elements.forEach(function (element) {
      const elementName = element.getName();
      const value = this.getElementValue(grs.getValue(elementName));
      const elementTable = element.getTableName();
      const type = element.getED().getInternalType();
      const displayValue = this.getElementValue(element.getDisplayValue());

      // // we do not want to provide metadata fields unless specificly requested.
      if (
        elementTable === 'sys_metadata' &&
        includedMetadataFields.indexOf(elementName) === -1
      )
        return;

      returnObject[elementName] = {
        value: value,
        type: type,
        displayValue: displayValue,
      };
    }, this);

    return returnObject;
  }

  overrideTemplateValues(overrideTemplateValues, templateConfigNode) {
    const newTemplateConfigNode = templateConfigNode;
    // First, we itterate over the field names of a glide record that should be replaced.
    for (const fieldName in overrideTemplateValues) {
      // Second, we itterate on the properties of the record that should be replaced.
      for (const propertyName in overrideTemplateValues[fieldName]) {
        const override = overrideTemplateValues[fieldName][propertyName];

        // We create the field if it does not exist so the FE may provide custome fields when needed
        if (!newTemplateConfigNode.hasOwnProperty(fieldName))
          newTemplateConfigNode[fieldName] = {};

        newTemplateConfigNode[fieldName][propertyName] = override;
      }
    }
    return newTemplateConfigNode;
  }
}

module.exports = TemplateConfigRetrievalService;
