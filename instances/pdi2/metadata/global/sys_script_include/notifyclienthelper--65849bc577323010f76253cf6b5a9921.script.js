var NotifyClientHelper = Class.create();
NotifyClientHelper.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    /**
     * Validate if the url is accessible and its content is of a valid MIME type
     * @returns boolean
     **/
    isValidURL: function(url) {
        var result = {
            status: false,
            message: ""
        };
        //call clean URL method to remove trailing space and to replace " " with "%20"
        url = this.cleanURL(url);
        var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
        // check if url is valid
        if (!regex.test(url)) {
            result.message = gs.getMessage("Invalid absolute URL");
            return JSON.stringify(result);
        }
        // try to access the url
        var rest = new sn_ws.RESTMessageV2();
        rest.setHttpMethod('get');
        rest.setEndpoint(url);
        // execute the request
        var response = rest.execute();
        // check if the status is ok
        if (response.getStatusCode() != 200) {
            result.message = gs.getMessage("URL unreachable, status code is '{0}' ", response.getStatusCode());
            return JSON.stringify(result);
        }
        // check if the mime type is ok
        var mimeType = response.getHeader('Content-Type') + '';
        if (mimeType) {
            var type = (mimeType.split(';')[0]).toLowerCase();
            var notifyMimeType = new GlideRecord('notify_mime_type');
            notifyMimeType.query('mime_type', type);
            if (!notifyMimeType.hasNext()) {
                result.message = gs.getMessage("The file type '{0}' is not supported", type);
                return JSON.stringify(result);
            }
        } else {
            result.message = gs.getMessage("Error while retrieving MIME type");
            return JSON.stringify(result);
        }

        result.status = true;
        return JSON.stringify(result);
    },
    cleanURL: function(url) {
        return url.trim().replace(" ", "%20");
    },
    client_isValidUrl: function() {
        var url = this.getParameter('sysparm_url');
        return this.isValidURL(url);
    },
    type: 'NotifyClientHelper'
});
