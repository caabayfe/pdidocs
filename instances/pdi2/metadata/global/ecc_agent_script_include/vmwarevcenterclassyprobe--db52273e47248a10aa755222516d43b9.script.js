/* jshint -W030 */
ObjectPolyfill;
ArrayPolyfill;

var VMWarevCenterClassyProbe = Class.create();

(function() {


    //////////////////////////////////////////////////////////////////////////

    VMWarevCenterClassyProbe.prototype = Object.extendsObject(AProbe, {

        run: function() {
            var GlideHTTPClient = Packages.com.glide.communications.HTTPClient;
            var httpClient = new GlideHTTPClient();
            var source = probe.getParameter('source');
            response = setUpvCenterSession(httpClient, source);
            if (response.status != '200') {
                var message = 'VMWarevCenterClassyProbe:' + source + ' is unable to classify as a Vcenter';
                if (response) message += ',Response = ' + JSON.stringify(response);
                this.debug(message);
            }
            this.createOutputResult(JSON.stringify(response));
        },

        type: 'VMWarevCenterClassyProbe'
    });

    function setUpvCenterSession(httpClient, source) {
        var IPAddress = Packages.com.snc.commons.networks.IPAddress;
        var status;
        var response;
        var getSessionvCenterURL = IPAddress.fromString(source).isV4() ? 'https://' + source + '/rest/com/vmware/cis/session' : 'https://[' + source + ']/rest/com/vmware/cis/session';
        var credentials = getCredentials("vmware");
        var PostMethod = Packages.org.apache.commons.httpclient.methods.PostMethod;
        var sessionAPIHeader = 'ServiceNow Discovery';
        while (credentials.hasNext() && (status != '200')) {
            var credential = credentials.next();
            postMethod = new PostMethod(getSessionvCenterURL);
            postMethod.setHeader('vmware-use-header-authn', sessionAPIHeader);
            httpClient.setBasicAuth(credential.getUsername(), credential.getPassword());

            try {
                status = (httpClient.executeMethod(postMethod)) + '';
                response = postMethod.getResponseBodyAsString();
                try {
                    response = JSON.parse(response);
                } catch (err) {
                    // Case when the response of httpClient is not in JSON format
                    // represents source doesn't contains Vcenter
                    response = (response.value.hasOwnProperty('messages') && response.value.messages[0].hasOwnProperty('default_message')) ?
                        response.value.messages[0].default_message : 'Session cannot be established';
                }

                if (status == '200') {
                    response.status = status;
                    return response;
                } else
                    response = (response.value.hasOwnProperty('messages') && response.value.messages[0].hasOwnProperty('default_message')) ?
                    response.value.messages[0].default_message : 'Session cannot be established';

            } catch (ex) {
                if (typeof ex == 'object')
                    response = ex.getMessage() || ex + '';
                else if (typeof ex == 'string' && ex.length)
                    response = ex;
                else
                    response = 'Session cannot be established';
            }
        }
        return response;
    }

    function getCredentials(type) {
        if (this.probe != null)
            return this.probe.getCredentials(type);
        else
            return null;
    }

})();
