var gr = new GlideRecord("sys_ux_app_route");
gr.get(current.route);
answer = UxFrameworkScriptables.evaluateRoutePermission(gr.getUniqueValue(), gr.getValue("parent_macroponent"), "read");
