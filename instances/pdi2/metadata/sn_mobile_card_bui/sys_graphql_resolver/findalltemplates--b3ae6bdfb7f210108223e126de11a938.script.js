(function process(env) {
  var gr = new GlideRecordSecure("sys_sg_view_template");

  if (env.getArguments()["filter"]) {
    // Application Filtering
    if (env.getArguments()["filter"]["application"]) {
      gr.addQuery("sys_scope", env.getArguments()["filter"]["application"]);
    }

    // Search Filtering
    if (env.getArguments()["filter"]["search"]) {
      var grORName = gr.addQuery(
        "name",
        "CONTAINS",
        env.getArguments()["filter"]["search"]
      );
      grORName.addOrCondition(
        "description",
        "CONTAINS",
        env.getArguments()["filter"]["search"]
      );
    }

    // Type Filtering
    if (env.getArguments()["filter"]["type"]) {
      switch (env.getArguments()["filter"]["type"]) {
        case "defaultTemplates":
          var defaultTemplateSysIds =
            new DefaultTemplateRepository().getDefaultTemplateSysIds();
          gr.addQuery("sys_id", "IN", String(defaultTemplateSysIds));
          break;
        case "customTemplates":
          var defaultTemplateSysIds =
            new DefaultTemplateRepository().getDefaultTemplateSysIds();
          gr.addQuery("sys_id", "NOT IN", String(defaultTemplateSysIds));
          break;
        case "myTemplates":
          var user = gs.getUser();
          var userName = user.getName();
          gr.addQuery("sys_created_by", userName);
          break;
      }
    }
  }

  // Pagination
  if (env.getArguments()["pagination"]) {
    var start = env.getArguments()["pagination"]["start"];
    var size = env.getArguments()["pagination"]["size"];
    gr.chooseWindow(start, start + size);
  }

  // Sorting
  switch (env.getArguments()["sort"]) {
    case "UpdatedDesc":
      gr.orderByDesc("sys_updated_on");
      break;
    case "UpdatedAsce":
      gr.orderBy("sys_updated_on");
      break;
    case "AlphaDesc":
      gr.orderByDesc("name");
      break;
    case "AlphaAsce": // Default sort
    default:
      gr.orderBy("name");
  }

  gr.query();
  var totalRecordCount = Number(gr.getRowCount());

  return { totalRecordCount: totalRecordCount, templates: gr };
})(env);
