(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
  // Private Helper Functions
  function _returnEmptyResult() {
    return {
      cards: [],
      totalRecordCount: 0,
      paginationWindow: {
        size: 0,
        range: {
          start: 0,
          end: 0,
        },
        excludedCount: 0,
      },
    };
  }

  function _getViewConfigElements(viewConfigSysId) {
    // fetch view config and view config elements
    var viewConfigElements = [];
    var vceGr = new GlideRecordSecure("sys_sg_view_config_element");
    vceGr.addQuery("view_config", viewConfigSysId);
    vceGr.query();

    while (vceGr.next()) {
      var viewConfigElementAttributes = [];
      var vceaGr = new GlideRecordSecure(
        "sys_sg_view_config_element_attribute"
      );
      vceaGr.addQuery("view_config_element", vceGr.getUniqueValue());
      vceaGr.query();
      while (vceaGr.next()) {
        viewConfigElementAttributes.push({
          sysId: vceaGr.getUniqueValue(),
          name: vceaGr.getDisplayValue("name"),
          description: vceaGr.getValue("description"),
          value: vceaGr.getValue("value"),
          translatedValue: vceaGr.getValue("translated_value"),
        });
      }

      var tsGr = vceGr.view_template_slot.getRefRecord();

      // TODO: Clean up naming convention between BE/FE
      viewConfigElements.push({
        sysId: vceGr.getUniqueValue(),
        name: vceGr.getValue("name"),
        cardTemplateElement: vceGr.getValue("view_template_slot"),
        cardTemplateElementDisplayName:
          vceGr.getDisplayValue("view_template_slot"),
        viewConfigElementAttribute: viewConfigElementAttributes,
        templateSlot: {
          name: tsGr.getValue("name"),
          type: tsGr.getValue("type"),
        },
      });
    }

    return viewConfigElements;
  }

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

  function _getTemplateView(templateSysId) {
    var templateViewGR = new GlideRecordSecure("sys_sg_view_template");
    var viewTemplateSlots = _getTemplateSlots(templateSysId);

    templateViewGR.get(templateSysId);

    return {
      id: templateViewGR.getUniqueValue(),
      name: templateViewGR.getValue("name"),
      description: templateViewGR.getValue("description"),
      application: templateViewGR.getDisplayValue("sys_scope"),
      scope: templateViewGR.getValue("sys_scope"),
      updated: templateViewGR.getValue("sys_updated_on"),
      type: "viewTemplate",
      jsonTemplate: templateViewGR.getValue("template_json"),
      templateSlots: viewTemplateSlots,
    };
  }

  // Filter/Search/Pagination Query Paramters
  var pagination = {
    start: Number(request.queryParams["start"]),
    size: Number(request.queryParams["size"]),
  };
  var requestedFilterApplication = request.queryParams["application"];
  var requestedFilterApplet = request.queryParams["applet"];
  var requestedFilterTable = request.queryParams["table"];
  var requestedFilterSearch = request.queryParams["search"];
  var requestedSort = request.queryParams["sort"];

  var mobileViewGR = new GlideRecordSecure("sys_sg_view_config");

  // Application Filtering
  if (requestedFilterApplication) {
    mobileViewGR.addQuery("sys_scope", String(requestedFilterApplication));
  }

  // Table Filtering
  if(requestedFilterTable) {
	  mobileViewGR.addQuery("table", String(requestedFilterTable));
  }

  // Applet Filtering
  if (requestedFilterApplet) {
    var screenGr = new GlideRecordSecure("sys_sg_screen");
    if (screenGr.get(String(requestedFilterApplet))) {
      var className = screenGr.getValue("sys_class_name");
      if (
        className === "sys_sg_list_screen" ||
        className === "sys_sg_map_screen"
      ) {
        // get mobile view sys id ref
        // list -> item view -> item view stream -> master item +-> embedded screen

        // sys_sg_list_screen
        var lsSysId = screenGr.getUniqueValue();

        // sys_sg_item_stream_segment
        var issGr = new GlideRecordSecure("sys_sg_item_stream_segment");
        issGr.addQuery("screen", lsSysId);
        issGr.query();
        issGr.next();
        var issSysId = issGr.getUniqueValue();

        // sys_sg_item_stream
        var m2mIssGr = new GlideRecordSecure("sys_sg_item_stream_m2m_segment");
        m2mIssGr.addQuery("segment", issSysId);
        m2mIssGr.query();
        m2mIssGr.next();
        var isSysId = m2mIssGr.getValue("item_stream");

        // sys_sg_master_item
        var m2mIsGr = new GlideRecordSecure(
          "sys_sg_item_stream_m2m_master_item"
        );
        m2mIsGr.addQuery("item_stream", isSysId);
        m2mIsGr.query();
        m2mIsGr.next();
        var miSysId = m2mIsGr.getValue("master_item");

        // sys_sg_master_item - view config
        var miGr = new GlideRecordSecure("sys_sg_master_item");
        miGr.get(miSysId);
        var viewConfigSysId = miGr.getValue("view_config");

        // sys_sg_form_screen
        var esSysId = miGr.getValue("embedded_screen");
        var esGr = new GlideRecordSecure("sys_sg_form_screen"); // it's really a ref to sys_sg_screen
        esGr.get(esSysId);
        var secondViewConfigSysId = esGr.getValue("view_config");

        var grOR = mobileViewGR.addQuery("sys_id", viewConfigSysId);
        grOR.addOrCondition("sys_id", secondViewConfigSysId);
      } else if (className === "sys_sg_form_screen") {
        // sys_sg_form_screen
        var fGr = new GlideRecordSecure("sys_sg_form_screen"); // it's really a ref to sys_sg_screen
        fGr.get(screenGr.getUniqueValue());

        var viewConfigSysId = fGr.getValue("view_config");

        mobileViewGR.addQuery("sys_id", viewConfigSysId);
      }
    } else {
      return _returnEmptyResult();
    }
  }

  // Search Filtering
  if (requestedFilterSearch) {
    var grORName = mobileViewGR.addQuery(
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
  var totalCountMobileViewGR = new GlideRecordSecure("sys_sg_view_config");
  totalCountMobileViewGR.addEncodedQuery(mobileViewGR.getEncodedQuery());
  totalCountMobileViewGR.query();
  while (totalCountMobileViewGR.next()) {
    if (totalCountMobileViewGR.canRead()) totalRecordCount++;
  }

  // Sort
  if (requestedSort) {
    switch (String(requestedSort)) {
      case "UpdatedDesc":
        mobileViewGR.orderByDesc("sys_updated_on");
        break;
      case "UpdatedAsce":
        mobileViewGR.orderBy("sys_updated_on");
        break;
      case "AlphaDesc":
        mobileViewGR.orderByDesc("name");
        break;
      case "AlphaAsce": // Default sort
      default:
        mobileViewGR.orderBy("name");
    }
  }

  // Pagination
  if (!isNaN(pagination.start) && !isNaN(pagination.size)) {
    mobileViewGR.chooseWindow(
      pagination.start,
      pagination.start + pagination.size
    );
  }

  // Payload Construction
  var mobileViews = [];
  mobileViewGR.query();
  while (mobileViewGR.next()) {
    if (mobileViewGR.canRead()) {
      var templateView = _getTemplateView(mobileViewGR.getValue("template"));
      var viewConfigElements = _getViewConfigElements(
        mobileViewGR.getUniqueValue()
      );

      mobileViews.push({
        sys_id: mobileViewGR.getUniqueValue(),
        name: mobileViewGR.getValue("name"),
        description: mobileViewGR.getValue("description"),
        application: mobileViewGR.getDisplayValue("sys_scope"),
        scope: mobileViewGR.getValue("sys_scope"),
        updated: mobileViewGR.getValue("sys_updated_on"),
        type: "viewConfig",
        templateView: templateView,
        viewConfigElements: viewConfigElements,
      });
    }
  }

  return {
    cards: mobileViews,
    totalRecordCount: totalRecordCount,
    paginationWindow: {
      size: pagination.size,
      range: {
        start: pagination.start + 1,
        end: pagination.start + pagination.size,
      },
      excludedCount: pagination.size - mobileViews.length,
    },
  };
})(request, response);
