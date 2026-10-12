var CreatorStudioEmailScript = Class.create();
CreatorStudioEmailScript.prototype = {
    initialize: function() {
        this.content = '';
        this.styles = {
            heading: "text-align: center; font-size: 24px; font-weight: 600;",
            paragraph: "margin-bottom: 24px;",
            textCenter: "text-align: center;",
            button: 'display: inline-block; border-radius: 100px; background-color: #3A57E9; padding: 10px 24px; color: white; text-decoration:none;',
            footer: 'height: 87px; background-color: #032d42; ; text-align: center; font-size: 12px; color: #ffffff; line-height: 20px; font-weight: normal; font-style: normal; font-family: Open Sans;',
        };
        this.currentYear = new GlideDateTime().getYearLocalTime();
        this.csworkspaceID = "53ba520177d2311055f78f71ef5a99e8";
    },
    addHeading: function(heading) {
        this.content += '<h1 style="' + this.styles.heading + '">' + heading + '</h1>';
    },
    addText: function(text, hasMarginBottom) {
        if (hasMarginBottom) {
            this.content += '<p style="' + this.styles.paragraph + '">' + text + '</p>';
        } else {
            this.content += '<p>' + text + '</p>';
        }
    },
    addButton: function(text, goToUrl) {
        if (goToUrl) {
            this.content += '<p style="' + this.styles.textCenter + '"><a style="' + this.styles.button + '" href="' + goToUrl + '">' + text + '</a></p>';
        }
    },
    addInfo: function(name, value) {
        this.content += '<p><strong>' + name + ' : </strong>' + value + '</p>';
    },

    addFooter: function(text) {
        var copyrightMessage = gs.getMessage('{0}{1} ServiceNow | All Rights Reserved', ['&copy; ', this.currentYear]);
        this.content += '<table style="width: 100%";><tbody><tr><td style="' + this.styles.footer + '"><p>' + text + '<br>' + copyrightMessage + '</p></td></tr></tbody></table>';
    },

    getRequestUrl: function(current) {
        var baseUri = gs.getProperty('glide.servlet.uri');
        var sysClassName = current.getValue("sys_class_name");
        var sysId = current.getValue("sys_id");
        return `${baseUri}now/nav/ui/classic/params/target/${sysClassName}.do%3Fsys_id%3D${sysId}`;
    },

    getTasksUrl: function(current) {
        var baseUri = gs.getProperty('glide.servlet.uri');
        var number = current.getDisplayValue("number");
        return `${baseUri}now/nav/ui/classic/params/target/sn_creatorstudio_new_application_admin_task_list.do%3Fsysparm_query%3Dparent.number%253D${number}`;
    },

    getWorkspaceUrl: function(current) {
        var baseUri = gs.getProperty('glide.servlet.uri');
        var sysClassName = current.getValue("sys_class_name");
        var sysId = current.getValue("sys_id");
        var wsPath = this.getWorkspacePath();
        return `${baseUri}${wsPath}/record/${sysClassName}/${sysId}`;
    },

    getSubmittedRequestUrl: function(current) {
        var baseUri = gs.getProperty('glide.servlet.uri');
        var sysClassName = current.getValue("sys_class_name");
        var sysId = current.getValue("sys_id");
        return `${baseUri}now/nav/ui/classic/params/target/${sysClassName}.do%3Fsys_id%3D${sysId}`;
    },

    getWorkspacePath: function() {
        var wsPath = new GlideRecord("sys_ux_page_registry");
        if (wsPath.get(this.csworkspaceID)) {
            return "/now/" + wsPath.path;
        }
        return;

    },

    getAppNameFromTable: function(tableName) {
        var tableObject = new GlideRecord("sys_db_object");
        tableObject.addQuery("name", tableName);
        tableObject.query();
        if (tableObject.next()) {
            return tableObject.getDisplayValue("sys_scope");
        }
    },

    getBody: function() {
        return '<style>* {font-family: Arial, sans-serif, "open sans"}</style><div style="font-family: Arial, sans-serif, "open sans" !important; color: #333E3F;">' + this.content + '</div>';
    },

    getAppUrl: function(current) {
        var url = current.getDisplayValue("studio_url");
        var appId = current.getDisplayValue("u_app_id");
        return url.replace("{sys_id}", appId);
    },

    type: 'CreatorStudioEmailScript'
};
