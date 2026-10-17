/* window proxy */
// Added to handle onLoad and onSumbit client script since this object is not initialised.
var csInputs = csInputs || {};
function Window(host, url, globals) {
    this.location = new Location(host, url);
    this.open = function(newUrl) {
        _notifications_.push({
            type: 'launch-window-action',
            url: newUrl
        });
        return new Window(host, newUrl, globals); // TODO: newUrl can be absolute/relative
    };
    this.close = function() {
        return true;
    };
    if (globals) {
        Object.keys(globals).forEach(function(g) {
            this[g] = globals[g];
        });
    }
    this.window = this;
    this.top = this;
}

function Location(host, url) {
    var fullUrl = host + url;

    Object.defineProperty(this, 'href', {
        get: function() {
            return fullUrl;
        },
        set: function(value) {
            _notifications_.push({
                type: 'set-page-url-action',
                url: value
            });
        }
    });

    this.hostname = host;
    this.host = host;
    this.pathname = url;
    this.search = url && url.split('?')[1] || '';

    this.reload = function() {
        _notifications_.push({
            type: 'reload-location-action'
        });
    };
}

var host = csInputs.host || csInputs.url ? csInputs.host : gs.getProperty('glide.servlet.uri');
var url = csInputs.url ? csInputs.url : g_form.getTableName() + '.do?sys_id=' + g_form.getUniqueValue();
csGlobals['window'] = new Window(host, url, csInputs.globals);
csGlobals['location'] = new Location(host, url);
csGlobals['top'] = csGlobals['window'];
csGlobals['parent'] = csGlobals['window'];
csGlobals['open'] = csGlobals['window'].open;
