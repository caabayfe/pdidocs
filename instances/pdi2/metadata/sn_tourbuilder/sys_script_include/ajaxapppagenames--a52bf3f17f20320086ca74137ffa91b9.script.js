var AJAXAppPageNames = Class.create();
AJAXAppPageNames.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    getAppPageNames: function() {
        var pages = {
            portals: [],
            portalPages: [],
            experiencePages: []
        };
        var elem = null;
        // check if sp_page and sp_portal tables exist
        var gr = new GlideRecord('sp_page');
        if (gr.isValid()) {
            gr.orderBy('title');
            gr.query();

            while (gr.next()) {
                elem = {
                    title: GlideStringUtil.escapeHTML(gr.title.toString()),
                    id: GlideStringUtil.escapeHTML(gr.id.toString()),
                    sys_id: gr.sys_id.toString()
                };
                pages.portalPages.push(elem);
            }
        }

        gr = new GlideRecord('sp_portal');
        if (gr.isValid()) {
            gr.orderBy('title');
            gr.query();

            while (gr.next()) {
                elem = {
                    title: GlideStringUtil.escapeHTML(gr.title.toString()),
                    url_suffix: GlideStringUtil.escapeHTML(gr.url_suffix.toString()),
                    sys_id: gr.sys_id.toString()
                };
                pages.portals.push(elem);
            }
        }

        function validateTourJsonInComposition(composition, toursComponentMacroponentSysId) {
            if (!Array.isArray(composition) || composition.length == 0) return false;
            for (var i = 0; i < composition.length; i++) {
                var ele = composition[i];
                // Return true if the current element is the tours element
                if (ele.definition.type == 'MACROPONENT' && ele.definition.id == toursComponentMacroponentSysId) return true;
                // Check in the child elements
                if (ele.overrides && ele.overrides.composition && validateTourJsonInComposition(ele.overrides.composition, toursComponentMacroponentSysId)) return true;
            }
            return false;
        }

        function getAppShellsWithTours() {
            var result = [];
            var toursCompMacroponentSysId = "b404bcf1db06f55d38fb541233300bab"; // sys_ux_macroponent record sys_id of sn-guided-tours component.
            var uxm = new GlideRecord('sys_ux_macroponent');
            uxm.addActiveQuery();
            // Filter to get all appshells
            uxm.addQuery('category=chrome');
            uxm.query();
            while (uxm.next()) {
                var composition = uxm.composition.toString();
                if (composition.indexOf(toursCompMacroponentSysId) >= 0) {
                    // Checking further to eliminate the possibility of having the id in some random string  
                    try {
                        composition = JSON.parse(composition);
                        if (validateTourJsonInComposition(composition, toursCompMacroponentSysId)) {
                            result.push(uxm.sys_id.toString());
                        }
                    } catch (e) {
                        // Error while parsing the composition
                        continue;
                    }
                }
            }
            return result;
        }

        function getExpURLPrefix(scopeName) {
            // for scoped apps, scopename will be x_<company_code>_appname 
            // for example: x_ads_ads_gtd4 here ads is company_code and ads_gtd4 is the name of the app.
            var scopeNameParts = scopeName.split("_");

            if (scopeNameParts.length > 1 && scopeNameParts[0] === 'x') {
                return "x/" + scopeNameParts[1] + "/";
            }

            return "now/";
        }

        gr = new GlideRecord('sys_ux_page_registry');
        if (gr.isValid()) {
            var customAppShellsWithToursJson = getAppShellsWithTours();
            gr.addActiveQuery();
            /* Fetching experiences on base of following conditions
             *. parent_app='Unified Navigation app shell' OR App Shell UI='Workspace App Shell' OR 'Breadcrumb App Shell' OR 'ACE Unified Nav App Shell' OR `Custom AppShells containing tours JSON`
             */
            var appShellsUnderPolaris = [
                'e341e22cc32e2010ea04a5a1d840dd02',
                'c276387cc331101080d6d3658940ddd2',
                '7045b717532d411033cdddeeff7b1275'
            ];
            var query = 'parent_app=c86a62e2c7022010099a308dc7c26022^ORroot_macroponent=' + appShellsUnderPolaris.concat(customAppShellsWithToursJson).join('^ORroot_macroponent=');
            gr.addEncodedQuery(query);
            gr.addNotNullQuery('admin_panel');
            gr.orderBy('title');
            gr.query();
            while (gr.next()) {
                var ar = new GlideRecord('sys_ux_app_route');
                ar.addActiveQuery();
                ar.addQuery('app_config', gr.admin_panel);
                ar.addQuery('parent_macroponent', gr.root_macroponent);
                ar.query();
                if (ar.isValid()) {
                    while (ar.next()) {
                        var page = {
                            pageName: GlideStringUtil.escapeHTML(ar.name.toString()),
                            title: gr.title.toString(),
                            sysId: gr.sys_id.toString(),
                            path: gr.path.toString(),
                            appConfig: GlideStringUtil.escapeHTML(ar.app_config.getDisplayValue()),
                            routeType: ar.route_type.toString(),
                            optionalParameters: ar.optional_parameters.toString(),
                            fields: ar.fields.toString(),
                            url: getExpURLPrefix(gr.sys_scope.scope) + gr.path + '/' + ar.route_type,
                        };
                        pages.experiencePages.push(page);
                    }
                }
            }
        }
        var allPages = new global.JSON().encode(pages);
        return allPages;
    },
    /**
     * Return Application Page Names containing given search string
     * Below API is used in REST API
     */
    getPlatfromPageNames: function(option) {
        var name = unescape(option.name.toString()).toLowerCase().trim(),
            limit = option.limit,
            offset = option.offset,
            totalRecords,
            data = [];
        //skip Form, List, .do or _list.do from the search string.
        var words = name.split(" ");
        var nqs = "", // normalized query string
            qs = "", // original query string.
            all = false,
            form = false,
            endsWith = "",
            list = false,
            i;
        if (words.length > 1) {
            qs = nqs = name.trim();
            endsWith = name.substr(name.lastIndexOf(" "), name.length).trim();
            if ("list".indexOf(endsWith) === 0) {
                nqs = name.substr(0, name.lastIndexOf(" "));
                list = true;
            } else if ("form".indexOf(endsWith) === 0) {
                nqs = name.substr(0, name.lastIndexOf(" "));
                form = true;
            } else {
                all = true;
            }
        } else if (words.length === 1 && words[0] !== "") {
            qs = nqs = words[0].split(".")[0];
            endsWith = qs.substr(qs.lastIndexOf("_"), qs.length).trim();
            if ("_list".indexOf(endsWith) === 0) {
                nqs = qs.substr(0, qs.lastIndexOf("_"));
                list = true;
            } else if (words[0].indexOf(".") > 0) {
                form = true;
            } else {
                all = true;
            }
        } else {
            qs = nqs = "";
            all = true;
        }
        var gr = new GlideRecord('sys_db_object');
        var qc;

        if (all) {
            qc = gr.addQuery('name', 'CONTAINS', qs);
            qc.addOrCondition('name', 'CONTAINS', nqs);
            qc.addOrCondition('label', 'CONTAINS', qs);
            qc.addOrCondition('label', 'CONTAINS', nqs);
        } else {
            qc = gr.addQuery('name', qs);
            qc.addOrCondition('name', nqs);
            qc.addOrCondition('label', qs);
            qc.addOrCondition('label', nqs);
        }

        gr.orderBy('name');
        gr.chooseWindow(offset, offset + limit);
        gr.query();
        totalRecords = gr.getRowCount();
		
        if (all) {
            while (gr.next()) {
                data.push({
                    name: GlideStringUtil.escapeHTML(gr.name.toString() + ".do"),
                    label: GlideStringUtil.escapeHTML(gr.label.toString() + " Form")
                });
                data.push({
                    name: GlideStringUtil.escapeHTML(gr.name.toString() + "_list.do"),
                    label: GlideStringUtil.escapeHTML(gr.label.toString() + " List")
                });
            }
        } else if (form) {
            while (gr.next()) {
                data.push({
                    name: GlideStringUtil.escapeHTML(gr.name.toString() + ".do"),
                    label: GlideStringUtil.escapeHTML(gr.label.toString() + " Form")
                });
            }
        } else if (list) {
            while (gr.next()) {
                data.push({
                    name: GlideStringUtil.escapeHTML(gr.name.toString() + "_list.do"),
                    label: GlideStringUtil.escapeHTML(gr.label.toString() + " List")
                });
            }
        }

        return {
            data: data,
            totalRecords: totalRecords
        };
    },
    type: 'AJAXAppPageNames'
});
