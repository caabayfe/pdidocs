class JsonAttributeService {
  constructor() {
    this.tableFieldMap = {
      sys_sg_view_template: 'template_json',
      sys_sg_item_view: 'item_view_json',
    };
    this.errorHandler = new sn_mab_api.ErrorHandler();
  }

  getJSON(params) {
    if (!(params.table in this.tableFieldMap)) {
      this.errorHandler.throwBadRequestError('Invalid Table:' + params.table);
    }
    var tableDAO = new MobileAppBuilderDAO(params.table);
    var record;
    try {
      record = tableDAO.getRecord(params.sysId);
    } catch (error) {
      this.errorHandler.throwNotFoundError(
        'Record does not exist for table:' + params.table
      );
    }
    if (!record) {
      this.errorHandler.throwNotFoundError(
        'Record does not exist for table:' + params.table
      );
    }
    var filedName = this.tableFieldMap[params.table];
    return this.processJsonElement(record[filedName]);
  }

  processJsonElement(jsonData) {
    var elementProcessor = new global.ItemViewElementProcessor();
    return elementProcessor.getItemViewElementsIds(jsonData.value);
  }
}

module.exports = JsonAttributeService;
