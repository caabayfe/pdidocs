(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
  function _getTemplateSlots(viewTemplateSysId) {
    // fetch view config and view config elements
    var viewTemplateSlot = [];
    var vtsGr = new GlideRecordSecure("sys_sg_view_template_slot");
    vtsGr.addQuery("view_template", viewTemplateSysId);
    vtsGr.query();

    while (vtsGr.next()) {
      var viewTemplateSlotAttributes = [];
      var vtsaGr = new GlideRecordSecure("sys_sg_view_template_slot_attribute");
      vtsaGr.addQuery("view_template_slot", vtsGr.getUniqueValue());
      vtsaGr.query();
      while (vtsaGr.next()) {
        viewTemplateSlotAttributes.push({
          id: vtsaGr.getUniqueValue(),
          attributeName: {
            id: vtsaGr.getValue("name"),
            name: vtsaGr.getDisplayValue("name"),
          },
          description: vtsaGr.getValue("description"),
          value: vtsaGr.getValue("value"),
          translatedValue: vtsaGr.getValue("translated_value"),
        });
      }

      viewTemplateSlot.push({
        id: vtsGr.getUniqueValue(),
        name: vtsGr.getValue("name"),
        type: vtsGr.getDisplayValue("type"),
        templateSlotAttributes: viewTemplateSlotAttributes,
      });
    }

    return viewTemplateSlot;
  }

  // Filter/Search/Pagination Query Paramters
  var pagination = {
    start: Number(request.queryParams["start"]),
    size: Number(request.queryParams["size"]),
  };
  var requestedFilterApplication = request.queryParams["application"];
  var requestedFilterType = request.queryParams["type"];
  var requestedFilterSearch = request.queryParams["search"];
  var requestedSort = request.queryParams["sort"];

  var templateViewGR = new GlideRecordSecure("sys_sg_view_template");

  // Application Filtering
  if (requestedFilterApplication) {
    templateViewGR.addQuery("sys_scope", String(requestedFilterApplication));
  }

  // Type Filtering
  if (requestedFilterType) {
    switch (String(requestedFilterType)) {
      case "defaultTemplates":
        var defaultTemplateSysIds =
          new DefaultTemplateRepository().getDefaultTemplateSysIds();
        templateViewGR.addQuery("sys_id", "IN", String(defaultTemplateSysIds));
        break;
      case "customTemplates":
        var defaultTemplateSysIds =
          new DefaultTemplateRepository().getDefaultTemplateSysIds();
        templateViewGR.addQuery(
          "sys_id",
          "NOT IN",
          String(defaultTemplateSysIds)
        );
        break;
      case "myTemplates":
        var user = gs.getUser();
        var userName = user.getName();
        templateViewGR.addQuery("sys_created_by", userName);
        break;
    }
  }

  // Search Filtering
  if (requestedFilterSearch) {
    var grORName = templateViewGR.addQuery(
      "name",
      "CONTAINS",
      String(requestedFilterSearch)
    );
    grORName.addOrCondition(
      "description",
      "CONTAINS",
      String(requestedFilterSearch)
    );
  }

  // Total Record Count before Pagination
  // GlideRecord.getRecordCount() does not take into account ACLs, and therefore we do not use it
  // This has to be done in a second GlideRecordSecure because a subsequent query() does not return records
  // if the scoped_administration is set to true for the filtering application for the admin user
  var totalRecordCount = 0;
  var totalCountTemplateViewGR = new GlideRecordSecure("sys_sg_view_template");
  totalCountTemplateViewGR.addEncodedQuery(templateViewGR.getEncodedQuery());
  totalCountTemplateViewGR.query();
  while (totalCountTemplateViewGR.next()) {
    if (totalCountTemplateViewGR.canRead()) totalRecordCount++;
  }

  // Sort
  if (requestedSort) {
    switch (String(requestedSort)) {
      case "UpdatedDesc":
        templateViewGR.orderByDesc("sys_updated_on");
        break;
      case "UpdatedAsce":
        templateViewGR.orderBy("sys_updated_on");
        break;
      case "AlphaDesc":
        templateViewGR.orderByDesc("name");
        break;
      case "AlphaAsce": // Default sort
      default:
        templateViewGR.orderBy("name");
    }
  }

  // Pagination
  if (!isNaN(pagination.start) && !isNaN(pagination.size)) {
    templateViewGR.chooseWindow(
      pagination.start,
      pagination.start + pagination.size
    );
  }

  // Payload Construction
  var templateViews = [];
  templateViewGR.query();
  while (templateViewGR.next()) {
    if (templateViewGR.canRead()) {
      var viewTemplateSlots = _getTemplateSlots(
        templateViewGR.getUniqueValue()
      );

      templateViews.push({
        id: templateViewGR.getUniqueValue(),
        name: templateViewGR.getValue("name"),
        description: templateViewGR.getValue("description"),
        application: templateViewGR.getDisplayValue("sys_scope"),
        scope: templateViewGR.getValue("sys_scope"),
        updated: templateViewGR.getValue("sys_updated_on"),
        type: "viewTemplate",
        jsonTemplate: templateViewGR.getValue("template_json"),
        templateSlots: viewTemplateSlots,
      });
    }
  }

  return {
    templates: templateViews,
    totalRecordCount: totalRecordCount,
    paginationWindow: {
      size: pagination.size,
      range: {
        start: pagination.start + 1,
        end: pagination.start + pagination.size,
      },
      excludedCount: pagination.size - templateViews.length,
    },
  };
})(request, response);
