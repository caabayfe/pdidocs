(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
  // Filter/Search/Pagination Query Paramters
  var pagination = {
    start: Number(request.queryParams["start"]),
    size: Number(request.queryParams["size"]),
  };
  var requestedFilterApplication = request.queryParams["application"];
  var requestedFilterApplet = request.queryParams["applet"];
  var requestedFilterSearch = request.queryParams["search"];
  var requestedSort = request.queryParams["sort"];

  var itemViewGR = new GlideRecordSecure("sys_sg_item_view");

  // Application Filtering
  if (requestedFilterApplication) {
    itemViewGR.addQuery("sys_scope", String(requestedFilterApplication));
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
        var itemViewSysId = miGr.getValue("item_view");

        // sys_sg_form_screen
        var esSysId = miGr.getValue("embedded_screen");
        var esGr = new GlideRecordSecure("sys_sg_form_screen"); // it's really a ref to sys_sg_screen
        esGr.get(esSysId);
        var secondItemViewSysId = esGr.getValue("item_view");

        var grOR = itemViewGR.addQuery("sys_id", itemViewSysId);
        grOR.addOrCondition("sys_id", secondItemViewSysId);
      } else if (className === "sys_sg_form_screen") {
        // sys_sg_form_screen
        var fGr = new GlideRecordSecure("sys_sg_form_screen"); // it's really a ref to sys_sg_screen
        fGr.get(screenGr.getUniqueValue());

        var itemViewSysId = fGr.getValue("item_view");

        itemViewGR.addQuery("sys_id", itemViewSysId);
      }
    }
  }

  // Search Filtering
  if (requestedFilterSearch) {
    var grORName = itemViewGR.addQuery(
      "name",
      "CONTAINS",
      String(requestedFilterSearch)
    );
    grORName.addOrCondition(
      "short_description",
      "CONTAINS",
      String(requestedFilterSearch)
    );
  }

  // Total Record Count before Pagination
  // GlideRecord.getRecordCount() does not take into account ACLs, and therefore we do not use it
  // This has to be done in a second GlideRecordSecure because a subsequent query() does not return records
  // if the scoped_administration is set to true for the filtering application for the admin user
  var totalRecordCount = 0;
  var totalCountItemViewGR = new GlideRecordSecure("sys_sg_item_view");
  totalCountItemViewGR.addEncodedQuery(itemViewGR.getEncodedQuery());
  totalCountItemViewGR.query();
  while (totalCountItemViewGR.next()) {
    if (totalCountItemViewGR.canRead()) totalRecordCount++;
  }

  // Sort Filtering
  if (requestedSort) {
    switch (String(requestedSort)) {
      case "UpdatedDesc":
        itemViewGR.orderByDesc("sys_updated_on");
        break;
      case "UpdatedAsce":
        itemViewGR.orderBy("sys_updated_on");
        break;
      case "AlphaDesc":
        itemViewGR.orderByDesc("name");
        break;
      case "AlphaAsce": // Default sort
      default:
        itemViewGR.orderBy("name");
    }
  }

  // Pagination
  if (!isNaN(pagination.start) && !isNaN(pagination.size)) {
    itemViewGR.chooseWindow(
      pagination.start,
      pagination.start + pagination.size
    );
  }

  var itemViews = [];
  itemViewGR.query();
  while (itemViewGR.next()) {
    if (itemViewGR.canRead()) {
      itemViews.push({
        sys_id: itemViewGR.getUniqueValue(),
        name: itemViewGR.getValue("name"),
        description: itemViewGR.getValue("short_description"),
        application: itemViewGR.getDisplayValue("sys_scope"),
        scope: itemViewGR.getValue("sys_scope"),
        updated: itemViewGR.getValue("sys_updated_on"),
        type: "itemView",
        item_view_json: itemViewGR.getValue("item_view_json"),
      });
    }
  }

  return {
    legacyCards: itemViews,
    totalRecordCount: totalRecordCount,
    paginationWindow: {
      size: pagination.size,
      range: {
        start: pagination.start + 1,
        end: pagination.start + pagination.size,
      },
      excludedCount: pagination.size - itemViews.length,
    },
  };
})(request, response);
