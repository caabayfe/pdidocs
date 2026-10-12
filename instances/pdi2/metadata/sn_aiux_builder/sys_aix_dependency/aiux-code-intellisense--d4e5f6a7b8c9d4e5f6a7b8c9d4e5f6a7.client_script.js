
// ---------------------------------------------------------------------------
// wb-code-intellisense
// ---------------------------------------------------------------------------
// Headless widget — provides autocomplete definitions, hover tooltips,
// signature help, and completion source for wb-ds-code-editor.
// Registered as AIUX_Code_Intellisense service in the dependency registry.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Autocomplete definitions
// ---------------------------------------------------------------------------

// Lit framework
const _AC_LIT = [
    { label: 'html',     type: 'function', detail: 'lit - tagged template',   importSource: 'lit', sig: 'html`...`', ret: 'TemplateResult', params: null },
    { label: 'css',      type: 'function', detail: 'lit - tagged template',   importSource: 'lit', sig: 'css`...`', ret: 'CSSResult', params: null },
    { label: 'nothing',  type: 'constant', detail: 'lit - sentinel',          importSource: 'lit' },
    { label: 'svg',      type: 'function', detail: 'lit - SVG template',      importSource: 'lit', sig: 'svg`...`', ret: 'SVGTemplateResult', params: null },
    { label: 'repeat',   type: 'function', detail: 'lit - repeat directive',  importSource: 'lit/directives/repeat.js', sig: 'repeat(items, keyFn, template)', ret: 'DirectiveResult', params: { items: 'Iterable to repeat over', keyFn: 'Key function for identity', template: 'Template function (item, index) => TemplateResult' } },
    { label: 'classMap', type: 'function', detail: 'lit - classMap directive', importSource: 'lit/directives/class-map.js', sig: 'classMap(classInfo)', ret: 'DirectiveResult', params: { classInfo: 'Object mapping class names to booleans' } },
    { label: 'styleMap', type: 'function', detail: 'lit - styleMap directive', importSource: 'lit/directives/style-map.js', sig: 'styleMap(styleInfo)', ret: 'DirectiveResult', params: { styleInfo: 'Object mapping CSS props to values' } },
    { label: 'ifDefined', type: 'function', detail: 'lit - ifDefined directive', importSource: 'lit/directives/if-defined.js', sig: 'ifDefined(value)', ret: 'DirectiveResult', params: { value: 'Value or undefined; if undefined attribute is removed' } },
    { label: 'guard',    type: 'function', detail: 'lit - guard directive',   importSource: 'lit/directives/guard.js', sig: 'guard(deps, valueFn)', ret: 'DirectiveResult', params: { deps: 'Array of dependencies to watch', valueFn: 'Function that returns the value' } },
    { label: 'until',    type: 'function', detail: 'lit - until directive',   importSource: 'lit/directives/until.js', sig: 'until(...values)', ret: 'DirectiveResult', params: { values: 'Promises or values, last wins' } },
    { label: 'unsafeHTML', type: 'function', detail: 'lit - render raw HTML', importSource: 'lit/directives/unsafe-html.js', sig: 'unsafeHTML(value)', ret: 'DirectiveResult', params: { value: 'HTML string to render' } },
    { label: 'ContextConsumer', type: 'class', detail: 'lit - context consumer', importSource: 'lit', sig: 'new ContextConsumer(host, {context, subscribe?, callback})', ret: 'ContextConsumer', params: { host: 'LitElement host', context: 'Context object', 'subscribe?': 'Boolean - re-fire on changes', callback: 'Function called with context value' } },
];

// UX Kit base classes
const _AC_UXKIT = [
    { label: 'AIUXWidgetElement', type: 'class', detail: '@servicenow/aiux-components-core - base widget class', importSource: '@servicenow/aiux-components-core',
      sig: 'class MyWidget extends AIUXWidgetElement', ret: 'class', params: null },
    { label: 'WithData', type: 'function', detail: '@servicenow/aiux-components-core - mixin for server data binding', importSource: '@servicenow/aiux-components-core',
      sig: 'WithData(BaseClass)', ret: 'class', params: { BaseClass: 'Base class to extend (usually AIUXWidgetElement)' } },
    { label: 'AIUXElement', type: 'class', detail: '@servicenow/aiux-components-core - base for design-system components (no data/server)', importSource: '@servicenow/aiux-components-core',
      sig: 'class MyComponent extends AIUXElement', ret: 'class', params: null },
    { label: 'UxKitElement', type: 'class', detail: 'ux_kit/core - low-level base', importSource: 'ux_kit/core' },
];

// Top-level service names (auto-import the service itself)
const _AC_SERVICES = [
    { label: 'i18n',                    type: 'variable', detail: '@servicenow/aiux-services - i18n service',             importSource: '@servicenow/aiux-services' },
    { label: 'notifications',           type: 'variable', detail: '@servicenow/aiux-services - notifications service',    importSource: '@servicenow/aiux-services' },
    { label: 'locationService',         type: 'variable', detail: '@servicenow/aiux-services - location/routing service', importSource: '@servicenow/aiux-services' },
    { label: 'recordWatcherService',    type: 'variable', detail: '@servicenow/aiux-services - reactive GlideRecord',    importSource: '@servicenow/aiux-services' },
    { label: 'themeService',            type: 'variable', detail: '@servicenow/aiux-services - theme mode service',      importSource: '@servicenow/aiux-services' },
    { label: 'mobileAppBridgeService',  type: 'variable', detail: '@servicenow/aiux-services - mobile bridge service',   importSource: '@servicenow/aiux-services' },
    { label: 'userPreferencesService',   type: 'variable', detail: '@servicenow/aiux-services - user preferences service', importSource: '@servicenow/aiux-services' },
    { label: 'ariaLive', type: 'variable', detail: '@servicenow/aiux-services - ARIA live region announcer', importSource: '@servicenow/aiux-services' },
    // @servicenow/aiux-utils
    { label: 'snHttp',       type: 'variable', detail: '@servicenow/aiux-utils - HTTP client',      importSource: '@servicenow/aiux-utils',
      sig: 'snHttp', ret: '{get, post, put, delete, patch}', params: null },
    { label: 'CHAT_CHANNEL', type: 'constant', detail: '@servicenow/aiux-utils - chat channel constant', importSource: '@servicenow/aiux-utils' },
    { label: 'getUser',            type: 'function', detail: '@servicenow/aiux-utils - current user info', importSource: '@servicenow/aiux-utils' },
    { label: 'getSessionLanguage', type: 'function', detail: '@servicenow/aiux-utils - session language code (e.g. "en")', importSource: '@servicenow/aiux-utils' },
    { label: 'setAiuxGlobal',      type: 'function', detail: '@servicenow/aiux-utils - set value in window.NOW.aiux', importSource: '@servicenow/aiux-utils' },
    { label: 'getAiuxGlobal',      type: 'function', detail: '@servicenow/aiux-utils - get value from window.NOW.aiux', importSource: '@servicenow/aiux-utils' },
    // @servicenow/aiux-context
    { label: 'routeContext',            type: 'variable', detail: '@servicenow/aiux-context - route context for ContextConsumer',              importSource: '@servicenow/aiux-context' },
    { label: 'experienceContext',       type: 'variable', detail: '@servicenow/aiux-context - experience context for ContextConsumer',         importSource: '@servicenow/aiux-context' },
    { label: 'userPreferencesContext',  type: 'variable', detail: '@servicenow/aiux-context - user preferences context for ContextConsumer',   importSource: '@servicenow/aiux-context' },
    { label: 'widgetRenderingContext',  type: 'variable', detail: '@servicenow/aiux-context - widget origin tracking context',                 importSource: '@servicenow/aiux-context' },
    { label: 'mobileAppBridgeContext',  type: 'variable', detail: '@servicenow/aiux-context - mobile app bridge context for ContextConsumer',  importSource: '@servicenow/aiux-context' },
];

// Service methods with signatures
const _AC_SVCMETHODS = [
    // i18n
    { label: 'i18n.getMessage',   type: 'method', detail: 'i18n - get translated string', service: 'i18n', importSource: '@servicenow/aiux-services',
      sig: 'i18n.getMessage(key, args?)', ret: 'string', params: { key: 'Message key string or {message,code,comment} object', 'args?': 'Optional substitution array' } },
    { label: 'i18n.loadMessages', type: 'method', detail: 'i18n - bulk load',             service: 'i18n', importSource: '@servicenow/aiux-services',
      sig: 'i18n.loadMessages()', ret: 'Promise<void>', params: null },
    { label: 'i18n.loadMessage',  type: 'method', detail: 'i18n - load single message',   service: 'i18n', importSource: '@servicenow/aiux-services',
      sig: 'i18n.loadMessage(key)', ret: 'Promise<string>', params: { key: 'Message key to load' } },
    // notifications
    { label: 'notifications.add',                    type: 'method', detail: 'notifications - add custom', service: 'notifications', importSource: '@servicenow/aiux-services',
      sig: 'notifications.add(notification)', ret: 'string', params: { notification: '{type, message, duration?, actions?}' } },
    { label: 'notifications.addInfoNotification',    type: 'method', detail: 'notifications - info',     service: 'notifications', importSource: '@servicenow/aiux-services',
      sig: 'notifications.addInfoNotification(msg)', ret: 'string', params: { msg: 'Info message string' } },
    { label: 'notifications.addSuccessNotification', type: 'method', detail: 'notifications - success',  service: 'notifications', importSource: '@servicenow/aiux-services',
      sig: 'notifications.addSuccessNotification(msg)', ret: 'string', params: { msg: 'Success message string' } },
    { label: 'notifications.addWarningNotification', type: 'method', detail: 'notifications - warning',  service: 'notifications', importSource: '@servicenow/aiux-services',
      sig: 'notifications.addWarningNotification(msg)', ret: 'string', params: { msg: 'Warning message string' } },
    { label: 'notifications.addErrorNotification',   type: 'method', detail: 'notifications - error',    service: 'notifications', importSource: '@servicenow/aiux-services',
      sig: 'notifications.addErrorNotification(msg)', ret: 'string', params: { msg: 'Error message string' } },
    { label: 'notifications.remove',  type: 'method', detail: 'notifications - remove by id',  service: 'notifications', importSource: '@servicenow/aiux-services',
      sig: 'notifications.remove(id)', ret: 'void', params: { id: 'Notification id returned by add()' } },
    { label: 'notifications.clear',   type: 'method', detail: 'notifications - clear all',     service: 'notifications', importSource: '@servicenow/aiux-services',
      sig: 'notifications.clear()', ret: 'void', params: null },
    { label: 'notifications.getNotifications', type: 'method', detail: 'notifications - get all active', service: 'notifications', importSource: '@servicenow/aiux-services',
      sig: 'notifications.getNotifications()', ret: 'Array', params: null },
    { label: 'notifications.subscribe', type: 'method', detail: 'notifications - subscribe to changes', service: 'notifications', importSource: '@servicenow/aiux-services',
      sig: 'notifications.subscribe(callback)', ret: 'Unsubscribe', params: { callback: 'Function called when notifications change' } },
    // locationService
    { label: 'locationService.navigate', type: 'method', detail: 'location - navigate',    service: 'locationService', importSource: '@servicenow/aiux-services',
      sig: 'locationService.navigate(path, opts?)', ret: 'void', params: { path: 'Target path string', 'opts?': '{replace?, state?}' } },
    { label: 'locationService.path',      type: 'method', detail: 'location - current path', service: 'locationService', importSource: '@servicenow/aiux-services',
      sig: 'locationService.path()', ret: 'string', params: null },
    { label: 'locationService.param',     type: 'method', detail: 'location - get param',    service: 'locationService', importSource: '@servicenow/aiux-services',
      sig: 'locationService.param(key)', ret: 'string|null', params: { key: 'URL parameter name' } },
    { label: 'locationService.subscribe', type: 'method', detail: 'location - watch changes', service: 'locationService', importSource: '@servicenow/aiux-services',
      sig: 'locationService.subscribe(callback)', ret: 'Unsubscribe', params: { callback: 'Function called on route change' } },
    { label: 'locationService.replace',   type: 'method', detail: 'location - replace URL',  service: 'locationService', importSource: '@servicenow/aiux-services',
      sig: 'locationService.replace(path)', ret: 'void', params: { path: 'New path (replaces history)' } },
    { label: 'locationService.back',      type: 'method', detail: 'location - go back',      service: 'locationService', importSource: '@servicenow/aiux-services',
      sig: 'locationService.back()', ret: 'void', params: null },
    { label: 'locationService.params',    type: 'method', detail: 'location - all route params', service: 'locationService', importSource: '@servicenow/aiux-services',
      sig: 'locationService.params()', ret: 'Object', params: null },
    { label: 'locationService.page',      type: 'method', detail: 'location - current page name', service: 'locationService', importSource: '@servicenow/aiux-services',
      sig: 'locationService.page()', ret: 'string', params: null },
    { label: 'locationService.fullPath',  type: 'method', detail: 'location - full path with experience', service: 'locationService', importSource: '@servicenow/aiux-services',
      sig: 'locationService.fullPath()', ret: 'string', params: null },
    { label: 'locationService.experience', type: 'method', detail: 'location - experience name', service: 'locationService', importSource: '@servicenow/aiux-services',
      sig: 'locationService.experience()', ret: 'string', params: null },
    { label: 'locationService.hash',      type: 'method', detail: 'location - URL hash',        service: 'locationService', importSource: '@servicenow/aiux-services',
      sig: 'locationService.hash()', ret: 'string', params: null },
    { label: 'locationService.search',    type: 'method', detail: 'location - search string',   service: 'locationService', importSource: '@servicenow/aiux-services',
      sig: 'locationService.search()', ret: 'string', params: null },
    { label: 'locationService.searchParam', type: 'method', detail: 'location - get search param', service: 'locationService', importSource: '@servicenow/aiux-services',
      sig: 'locationService.searchParam(key)', ret: 'string|null', params: { key: 'Search parameter name' } },
    { label: 'locationService.hasSearchParam', type: 'method', detail: 'location - check search param', service: 'locationService', importSource: '@servicenow/aiux-services',
      sig: 'locationService.hasSearchParam(key)', ret: 'boolean', params: { key: 'Search parameter name' } },
    { label: 'locationService.url',       type: 'method', detail: 'location - current URL',     service: 'locationService', importSource: '@servicenow/aiux-services',
      sig: 'locationService.url()', ret: 'string', params: null },
    { label: 'locationService.absUrl',    type: 'method', detail: 'location - absolute URL',    service: 'locationService', importSource: '@servicenow/aiux-services',
      sig: 'locationService.absUrl()', ret: 'string', params: null },
    { label: 'locationService.updateSearchParams', type: 'method', detail: 'location - update search params', service: 'locationService', importSource: '@servicenow/aiux-services',
      sig: 'locationService.updateSearchParams(params)', ret: 'void', params: { params: 'Object of key/value pairs to merge' } },
    { label: 'locationService.setSearchParams', type: 'method', detail: 'location - replace all search params', service: 'locationService', importSource: '@servicenow/aiux-services',
      sig: 'locationService.setSearchParams(params)', ret: 'void', params: { params: 'Object of key/value pairs' } },
    { label: 'locationService.removeSearchParam', type: 'method', detail: 'location - remove search param', service: 'locationService', importSource: '@servicenow/aiux-services',
      sig: 'locationService.removeSearchParam(key)', ret: 'void', params: { key: 'Search parameter name to remove' } },
    { label: 'locationService.setHash',   type: 'method', detail: 'location - set URL hash',    service: 'locationService', importSource: '@servicenow/aiux-services',
      sig: 'locationService.setHash(hash)', ret: 'void', params: { hash: 'Hash value' } },
    { label: 'locationService.clearHash', type: 'method', detail: 'location - clear URL hash',  service: 'locationService', importSource: '@servicenow/aiux-services',
      sig: 'locationService.clearHash()', ret: 'void', params: null },
    { label: 'locationService.onBeforeNavigate', type: 'method', detail: 'location - hook before navigation', service: 'locationService', importSource: '@servicenow/aiux-services',
      sig: 'locationService.onBeforeNavigate(callback)', ret: 'Unsubscribe', params: { callback: 'Function called before navigation; return false to cancel' } },
    // recordWatcherService
    { label: 'recordWatcherService.createReactiveWatcher', type: 'method', detail: 'recordWatcher - reactive GlideRecord', service: 'recordWatcherService', importSource: '@servicenow/aiux-services',
      sig: 'recordWatcherService.createReactiveWatcher(host, table, filter, cb)', ret: 'Watcher', params: { host: 'LitElement host', table: 'Table name', filter: 'Encoded query', cb: 'Callback on change' } },
    // themeService
    { label: 'themeService.getThemeMode', type: 'method', detail: 'theme - get current mode', service: 'themeService', importSource: '@servicenow/aiux-services',
      sig: 'themeService.getThemeMode()', ret: 'string', params: null },
    { label: 'themeService.setThemeMode', type: 'method', detail: 'theme - set mode',         service: 'themeService', importSource: '@servicenow/aiux-services',
      sig: 'themeService.setThemeMode(mode)', ret: 'void', params: { mode: '"dark" | "light"' } },
    // mobileAppBridgeService
    { label: 'mobileAppBridgeService.isMobileApp', type: 'method', detail: 'mobileBridge - check if running in mobile app', service: 'mobileAppBridgeService', importSource: '@servicenow/aiux-services',
      sig: 'mobileAppBridgeService.isMobileApp()', ret: 'boolean', params: null },
    { label: 'mobileAppBridgeService.isInitialized', type: 'method', detail: 'mobileBridge - check if bridge is initialized', service: 'mobileAppBridgeService', importSource: '@servicenow/aiux-services',
      sig: 'mobileAppBridgeService.isInitialized()', ret: 'boolean', params: null },
    { label: 'mobileAppBridgeService.getBridge', type: 'method', detail: 'mobileBridge - get bridge instance', service: 'mobileAppBridgeService', importSource: '@servicenow/aiux-services',
      sig: 'mobileAppBridgeService.getBridge()', ret: 'Object', params: null },
    { label: 'mobileAppBridgeService.init', type: 'method', detail: 'mobileBridge - initialize bridge', service: 'mobileAppBridgeService', importSource: '@servicenow/aiux-services',
      sig: 'mobileAppBridgeService.init()', ret: 'void', params: null },
    { label: 'mobileAppBridgeService.destroy', type: 'method', detail: 'mobileBridge - destroy bridge', service: 'mobileAppBridgeService', importSource: '@servicenow/aiux-services',
      sig: 'mobileAppBridgeService.destroy()', ret: 'void', params: null },
    // userPreferencesService
    { label: 'userPreferencesService.isReduceMotionEnabled', type: 'method', detail: 'userPrefs - check reduced motion', service: 'userPreferencesService', importSource: '@servicenow/aiux-services',
      sig: 'userPreferencesService.isReduceMotionEnabled()', ret: 'boolean', params: null },
    { label: 'userPreferencesService.getUserPreference', type: 'method', detail: 'userPrefs - get a preference value', service: 'userPreferencesService', importSource: '@servicenow/aiux-services',
      sig: 'userPreferencesService.getUserPreference(name, defaultValue?)', ret: 'any', params: { name: 'Preference name', 'defaultValue?': 'Fallback value if not set' } },
    { label: 'userPreferencesService.setUserPreference', type: 'method', detail: 'userPrefs - set preference in memory', service: 'userPreferencesService', importSource: '@servicenow/aiux-services',
      sig: 'userPreferencesService.setUserPreference(name, value)', ret: 'void', params: { name: 'Preference name', value: 'New value' } },
    { label: 'userPreferencesService.saveUserPreference', type: 'method', detail: 'userPrefs - persist preference to server', service: 'userPreferencesService', importSource: '@servicenow/aiux-services',
      sig: 'userPreferencesService.saveUserPreference(name, value)', ret: 'Promise<Object>', params: { name: 'Preference name', value: 'String or boolean value to persist' } },
    { label: 'userPreferencesService.getBooleanPreferenceValue', type: 'method', detail: 'userPrefs - get preference as boolean', service: 'userPreferencesService', importSource: '@servicenow/aiux-services',
      sig: 'userPreferencesService.getBooleanPreferenceValue(name, defaultValue?)', ret: 'boolean', params: { name: 'Preference name', 'defaultValue?': 'Default boolean' } },
    { label: 'userPreferencesService.subscribe', type: 'method', detail: 'userPrefs - watch a preference for changes', service: 'userPreferencesService', importSource: '@servicenow/aiux-services',
      sig: 'userPreferencesService.subscribe(name, callback)', ret: 'Unsubscribe', params: { name: 'Preference name to watch', callback: 'Function(newValue, oldValue, name)' } },
    { label: 'userPreferencesService.getUserPreferences', type: 'method', detail: 'userPrefs - get all preferences', service: 'userPreferencesService', importSource: '@servicenow/aiux-services',
      sig: 'userPreferencesService.getUserPreferences()', ret: 'Map<string, any>', params: null },
    { label: 'userPreferencesService.fetchLanguages', type: 'method', detail: 'userPrefs - fetch available languages', service: 'userPreferencesService', importSource: '@servicenow/aiux-services',
      sig: 'userPreferencesService.fetchLanguages()', ret: 'Promise<{items, selectedItem, enabled}>', params: null },
    // ariaLive (from @servicenow/aiux-services)
    { label: 'ariaLive.announce', type: 'method', detail: 'ariaLive - announce message to screen readers', service: 'ariaLive', importSource: '@servicenow/aiux-services',
      sig: 'ariaLive.announce(message, politeness?, options?)', ret: 'void', params: { message: 'Text to announce', 'politeness?': '"polite" | "assertive" | "off"', 'options?': '{clearAfter?: number, atomic?: boolean}' } },
    { label: 'ariaLive.announcePolite', type: 'method', detail: 'ariaLive - polite announcement', service: 'ariaLive', importSource: '@servicenow/aiux-services',
      sig: 'ariaLive.announcePolite(message, options?)', ret: 'void', params: { message: 'Text to announce', 'options?': '{clearAfter?: number, atomic?: boolean}' } },
    { label: 'ariaLive.announceAssertive', type: 'method', detail: 'ariaLive - assertive (urgent) announcement', service: 'ariaLive', importSource: '@servicenow/aiux-services',
      sig: 'ariaLive.announceAssertive(message, options?)', ret: 'void', params: { message: 'Text to announce', 'options?': '{clearAfter?: number, atomic?: boolean}' } },
    { label: 'ariaLive.clear', type: 'method', detail: 'ariaLive - clear pending announcements', service: 'ariaLive', importSource: '@servicenow/aiux-services',
      sig: 'ariaLive.clear()', ret: 'void', params: null },
    { label: 'ariaLive.isInitialized', type: 'method', detail: 'ariaLive - check if initialized', service: 'ariaLive', importSource: '@servicenow/aiux-services',
      sig: 'ariaLive.isInitialized()', ret: 'boolean', params: null },
    { label: 'ariaLive.initialize', type: 'method', detail: 'ariaLive - initialize the service', service: 'ariaLive', importSource: '@servicenow/aiux-services',
      sig: 'ariaLive.initialize()', ret: 'void', params: null },
    { label: 'ariaLive.destroy', type: 'method', detail: 'ariaLive - destroy the service', service: 'ariaLive', importSource: '@servicenow/aiux-services',
      sig: 'ariaLive.destroy()', ret: 'void', params: null },
    // snHttp (from @servicenow/aiux-utils)
    { label: 'snHttp.get',    type: 'method', detail: 'snHttp - GET request',    service: 'snHttp', importSource: '@servicenow/aiux-utils',
      sig: 'snHttp.get(url, config?)', ret: 'Promise<Response>', params: { url: 'API endpoint path', 'config?': '{headers?, signal?, responseType?, batch?}' } },
    { label: 'snHttp.post',   type: 'method', detail: 'snHttp - POST request',   service: 'snHttp', importSource: '@servicenow/aiux-utils',
      sig: 'snHttp.post(url, body?, config?)', ret: 'Promise<Response>', params: { url: 'API endpoint path', 'body?': '{data} payload', 'config?': '{headers?}' } },
    { label: 'snHttp.put',    type: 'method', detail: 'snHttp - PUT request',    service: 'snHttp', importSource: '@servicenow/aiux-utils',
      sig: 'snHttp.put(url, body?, config?)', ret: 'Promise<Response>', params: { url: 'API endpoint path', 'body?': '{data} payload', 'config?': '{headers?}' } },
    { label: 'snHttp.delete', type: 'method', detail: 'snHttp - DELETE request', service: 'snHttp', importSource: '@servicenow/aiux-utils',
      sig: 'snHttp.delete(url, config?)', ret: 'Promise<Response>', params: { url: 'API endpoint path', 'config?': '{headers?}' } },
    { label: 'snHttp.patch',  type: 'method', detail: 'snHttp - PATCH request',  service: 'snHttp', importSource: '@servicenow/aiux-utils',
      sig: 'snHttp.patch(url, body?, config?)', ret: 'Promise<Response>', params: { url: 'API endpoint path', 'body?': 'Partial update payload', 'config?': '{headers?}' } },
    // standalone utils (from @servicenow/aiux-utils)
    { label: 'getUser', type: 'method', detail: 'utils - get current user info', importSource: '@servicenow/aiux-utils',
      sig: 'getUser()', ret: '{roles, userId, firstName, lastName, name, departmentID} | null', params: null },
    { label: 'getSessionLanguage', type: 'method', detail: 'utils - get session language code', importSource: '@servicenow/aiux-utils',
      sig: 'getSessionLanguage()', ret: 'string', params: null },
    { label: 'setAiuxGlobal', type: 'method', detail: 'utils - set value in window.NOW.aiux', importSource: '@servicenow/aiux-utils',
      sig: 'setAiuxGlobal(key, value)', ret: 'void', params: { key: 'Key name in window.NOW.aiux', value: 'Value to set' } },
    { label: 'getAiuxGlobal', type: 'method', detail: 'utils - get value from window.NOW.aiux', importSource: '@servicenow/aiux-utils',
      sig: 'getAiuxGlobal(key, defaultValue?)', ret: 'any', params: { key: 'Key name in window.NOW.aiux', 'defaultValue?': 'Fallback if not set' } },
];

// Shortcut methods (typing just the method name like "getMessage" auto-imports the service)
const _AC_SHORTCUTS = [
    { label: 'getMessage',   type: 'method', detail: 'i18n.getMessage (shortcut)', service: 'i18n', importSource: '@servicenow/aiux-services',
      sig: 'i18n.getMessage(key, args?)', ret: 'string', params: { key: 'Message key', 'args?': 'Substitution array' } },
    { label: 'navigate',     type: 'method', detail: 'locationService.navigate (shortcut)', service: 'locationService', importSource: '@servicenow/aiux-services',
      sig: 'locationService.navigate(path, opts?)', ret: 'void', params: { path: 'Target path', 'opts?': 'Options' } },
    { label: 'addInfoNotification',    type: 'method', detail: 'notifications shortcut', service: 'notifications', importSource: '@servicenow/aiux-services',
      sig: 'notifications.addInfoNotification(msg)', ret: 'string', params: { msg: 'Message' } },
    { label: 'addSuccessNotification', type: 'method', detail: 'notifications shortcut', service: 'notifications', importSource: '@servicenow/aiux-services',
      sig: 'notifications.addSuccessNotification(msg)', ret: 'string', params: { msg: 'Message' } },
    { label: 'addErrorNotification',   type: 'method', detail: 'notifications shortcut', service: 'notifications', importSource: '@servicenow/aiux-services',
      sig: 'notifications.addErrorNotification(msg)', ret: 'string', params: { msg: 'Message' } },
];

// Instance properties (this.*)
const _AC_INSTANCE = [
    { label: 'this.data',          type: 'property', detail: 'Server script output data',
      sig: 'this.data', ret: 'Object', params: null },
    { label: 'this.server.get',    type: 'method',   detail: 'Call server script',
      sig: 'this.server.get(request)', ret: 'Promise<Response>', params: { request: '{action, data} object sent to server script' } },
    { label: 'this.server.update', type: 'method',   detail: 'Update server data',
      sig: 'this.server.update()', ret: 'Promise<void>', params: null },
    { label: 'this.server.refresh', type: 'method',  detail: 'Refresh server data',
      sig: 'this.server.refresh()', ret: 'Promise<void>', params: null },
    { label: 'this.aiContext',     type: 'property', detail: 'AI context object' },
    { label: 'this.setAiContext',  type: 'method',   detail: 'Update AI context',
      sig: 'this.setAiContext(ctx)', ret: 'void', params: { ctx: 'New AI context object' } },
    { label: 'this.logger',       type: 'property', detail: 'Logger instance' },
    { label: 'this.trackEvent',   type: 'method',   detail: 'Track analytics event',
      sig: 'this.trackEvent(name, data?)', ret: 'void', params: { name: 'Event name', 'data?': 'Event payload' } },
    { label: 'this.deps.services', type: 'property', detail: 'Dependency-injected services' },
    { label: 'this.deps.directives', type: 'property', detail: 'Dependency-injected directives' },
    { label: 'this.renderRoot',   type: 'property', detail: 'Shadow root or element root' },
    { label: 'this.shadowRoot',   type: 'property', detail: 'Shadow DOM root' },
    { label: 'this.updateComplete', type: 'property', detail: 'Promise that resolves after update',
      sig: 'this.updateComplete', ret: 'Promise<boolean>', params: null },
    { label: 'this.isConnected',  type: 'property', detail: 'True if element is in DOM' },
    { label: 'this.requestUpdate', type: 'method',  detail: 'Manually trigger a re-render',
      sig: 'this.requestUpdate(name?, oldValue?)', ret: 'void', params: { 'name?': 'Property name that changed', 'oldValue?': 'Previous value' } },
    { label: 'this.dispatchEvent', type: 'method',  detail: 'Dispatch a custom event',
      sig: 'this.dispatchEvent(event)', ret: 'boolean', params: { event: 'new CustomEvent(name, {detail, bubbles, composed})' } },
    { label: 'this.querySelector', type: 'method',  detail: 'Query light DOM child',
      sig: 'this.querySelector(selector)', ret: 'Element|null', params: { selector: 'CSS selector string' } },
];

// Lit lifecycle methods
const _AC_LIFECYCLE = [
    { label: 'connectedCallback',    type: 'method', detail: 'Lit - element added to DOM',
      sig: 'connectedCallback()', ret: 'void', params: null },
    { label: 'disconnectedCallback', type: 'method', detail: 'Lit - element removed from DOM',
      sig: 'disconnectedCallback()', ret: 'void', params: null },
    { label: 'render',               type: 'method', detail: 'Lit - return template (required)',
      sig: 'render()', ret: 'TemplateResult', params: null },
    { label: 'firstUpdated',        type: 'method', detail: 'Lit - called after first render',
      sig: 'firstUpdated(changedProperties)', ret: 'void', params: { changedProperties: 'Map of changed property names to old values' } },
    { label: 'updated',             type: 'method', detail: 'Lit - called after every render',
      sig: 'updated(changedProperties)', ret: 'void', params: { changedProperties: 'Map of changed property names to old values' } },
    { label: 'willUpdate',          type: 'method', detail: 'Lit - called before update/render',
      sig: 'willUpdate(changedProperties)', ret: 'void', params: { changedProperties: 'Map of changed property names to old values' } },
    { label: 'shouldUpdate',        type: 'method', detail: 'Lit - control whether to re-render',
      sig: 'shouldUpdate(changedProperties)', ret: 'boolean', params: { changedProperties: 'Map of changed property names to old values' } },
    { label: 'requestUpdate',       type: 'method', detail: 'Lit - manually trigger re-render',
      sig: 'requestUpdate(name?, oldValue?)', ret: 'void', params: { 'name?': 'Property name', 'oldValue?': 'Previous value' } },
    { label: 'performUpdate',       type: 'method', detail: 'Lit - override to batch/defer updates',
      sig: 'performUpdate()', ret: 'void', params: null },
    { label: 'getUpdateComplete',   type: 'method', detail: 'Lit - override to await child updates',
      sig: 'getUpdateComplete()', ret: 'Promise<boolean>', params: null },
    { label: 'createRenderRoot',    type: 'method', detail: 'Lit - override to change render target',
      sig: 'createRenderRoot()', ret: 'Element|ShadowRoot', params: null },
    { label: 'attributeChangedCallback', type: 'method', detail: 'Lit - raw attribute change hook',
      sig: 'attributeChangedCallback(name, old, value)', ret: 'void', params: { name: 'Attribute name', old: 'Previous value', value: 'New value' } },
    { label: 'adoptedCallback',     type: 'method', detail: 'Lit - element moved to new document',
      sig: 'adoptedCallback()', ret: 'void', params: null },
    { label: 'onDataChange',        type: 'method', detail: 'AIUXWidgetElement - called when server data updates',
      sig: 'onDataChange(newData, oldData)', ret: 'void', params: { newData: 'Updated data from server', oldData: 'Previous data' } },
];

// Static members
const _AC_STATICS = [
    { label: 'static properties',    type: 'keyword', detail: 'Reactive property definitions' },
    { label: 'static styles',        type: 'keyword', detail: 'css`` tagged template for styles' },
    { label: 'static dependencies',  type: 'keyword', detail: '{ services: [], directives: [] } — or shorthand array' },
    { label: 'static dependencies',  type: 'keyword', detail: 'shorthand — services-only array',
      sig: "static dependencies = ['i18n', 'notifications']", ret: 'void', params: null },
    { label: 'static client_tools',  type: 'keyword', detail: 'AI client tool definitions' },
];

// aiux-kit directives (from @servicenow/aiux-directives)
const _AC_DIRECTIVES = [
    { label: 'spreadProps', type: 'function', detail: '@servicenow/aiux-directives - spread properties onto an element', importSource: '@servicenow/aiux-directives',
      sig: '${spreadProps(obj)}', ret: 'DirectiveResult', params: { obj: 'Object of property/attribute key-value pairs to spread' } },
    { label: 'timeAgo', type: 'function', detail: '@servicenow/aiux-directives - auto-updating relative time label', importSource: '@servicenow/aiux-directives',
      sig: '${timeAgo(timestamp, options?)}', ret: 'DirectiveResult', params: { timestamp: 'Date | number | string', 'options?': '{live?: boolean, formatter?: Function}' } },
    { label: 'liveRegionPolite', type: 'function', detail: '@servicenow/aiux-directives - ARIA polite live region directive', importSource: '@servicenow/aiux-directives',
      sig: '${liveRegionPolite(options?)}', ret: 'DirectiveResult', params: { 'options?': '{atomic?, relevant?, busy?, role?}' } },
    { label: 'liveRegionAssertive', type: 'function', detail: '@servicenow/aiux-directives - ARIA assertive live region directive', importSource: '@servicenow/aiux-directives',
      sig: '${liveRegionAssertive(options?)}', ret: 'DirectiveResult', params: { 'options?': '{atomic?, relevant?, busy?, role?}' } },
    { label: 'getTimeAgo', type: 'function', detail: '@servicenow/aiux-directives - compute relative time data', importSource: '@servicenow/aiux-directives',
      sig: 'getTimeAgo(timestamp)', ret: '{value, unit, isFuture, isJustNow}', params: { timestamp: 'Date | number | string' } },
    { label: 'formatTimeAgo', type: 'function', detail: '@servicenow/aiux-directives - format relative time as string', importSource: '@servicenow/aiux-directives',
      sig: 'formatTimeAgo(timeData)', ret: 'string', params: { timeData: 'Object from getTimeAgo()' } },
];

// aiux-kit base components (HTML element tags)
const _AC_BASE_COMPONENTS = [
    { label: 'aiux-accordion-group', type: 'class', detail: 'aiux-kit - Accordion group | items, multiple, icon, bordered',
      sig: 'aiux-accordion-group', sideEffectImport: true,
      params: { items: 'Array of {title, content, open?}', multiple: 'Allow multiple open items', icon: "'arrow' | 'plus' | none", bordered: 'Show borders', onchange: 'Callback code string' } },
    { label: 'aiux-alert-message', type: 'class', detail: 'aiux-kit - Alert message | type, message, alertTitle, dismissible',
      sig: 'aiux-alert-message', sideEffectImport: true,
      params: { type: "'info' | 'success' | 'warning' | 'error' | 'primary' | 'accent'", message: 'Alert message text', alertTitle: 'Optional title (attr: alert-title)', dismissible: 'Show dismiss button', icon: 'Custom icon name (overrides default type icon)', duration: 'Auto-dismiss in ms (0 = none)' } },
    { label: 'aiux-calendar-component', type: 'class', detail: 'aiux-kit - Calendar component | currentDate, selectedDate',
      sig: 'aiux-calendar-component', sideEffectImport: true,
      params: { currentDate: '{month, year} - displayed month', selectedDate: 'Selected date object' } },
    { label: 'aiux-carousel-slider', type: 'class', detail: 'aiux-kit - Carousel slider | items, showNavigation, autoplay',
      sig: 'aiux-carousel-slider', sideEffectImport: true,
      params: { items: 'Array of slide objects', showNavigation: 'Show prev/next buttons (attr: show-navigation)', showIndicators: 'Show dot indicators (attr: show-indicators)', autoplay: 'Autoplay interval ms', vertical: 'Vertical orientation', alignment: 'Slide alignment string' } },
    { label: 'aiux-dialog', type: 'class', detail: 'aiux-kit - Dialog | open, size, isModal, resizable',
      sig: 'aiux-dialog', sideEffectImport: true,
      params: { open: 'Whether dialog is open', size: "'sm' | 'md' | 'lg' | 'xl' | 'fullscreen'", isModal: 'Render as modal (attr: is-modal)', showCloseButton: 'Show close button (attr: show-close-button)', closeOnEscape: 'Close on Escape (attr: close-on-escape)', preventScroll: 'Prevent body scroll when open (attr: prevent-scroll)', resizable: 'Allow resize', hidePadding: 'Remove padding from header/body/footer (attr: hide-padding)', dialogLabel: 'Accessible label (attr: dialog-label)' } },
    { label: 'aiux-icon', type: 'class', detail: 'aiux-kit - Icon | name, size',
      sig: 'aiux-icon', sideEffectImport: true,
      params: { name: 'Icon name in kebab-case', size: "'xs' | 'sm' | 'md' | 'lg' | 'xl'" } },
    { label: 'aiux-live-region', type: 'class', detail: 'aiux-kit - ARIA live region | mode, atomic, visuallyHidden',
      sig: 'aiux-live-region', sideEffectImport: true,
      params: { mode: "'polite' | 'assertive' | 'off'", atomic: 'ARIA atomic (boolean)', visuallyHidden: 'Hidden but announced (attr: visually-hidden)', regionRole: 'Override ARIA role (attr: region-role)' } },
    { label: 'aiux-loader', type: 'class', detail: 'aiux-kit - Loader/spinner | size, label',
      sig: 'aiux-loader', sideEffectImport: true,
      params: { size: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", label: 'Accessible loading label', animationConfig: 'Lottie animation config object', showFooter: 'Show footer logo (attr: show-footer)' } },
    { label: 'aiux-pagination-nav', type: 'class', detail: 'aiux-kit - Pagination nav | currentPage, totalPages',
      sig: 'aiux-pagination-nav', sideEffectImport: true,
      params: { currentPage: 'Active page number (1-based, attr: current-page)', totalPages: 'Total page count (attr: total-pages)', maxButtons: 'Max page buttons (attr: max-buttons)', showPrevNext: 'Prev/next arrows (attr: show-prev-next)', showFirstLast: 'First/last arrows (attr: show-first-last)', size: "'xs' | 'sm' | 'md' | 'lg' | 'xl'" } },
    { label: 'aiux-tab-group', type: 'class', detail: 'aiux-kit - Tab group | tabs, activeTab, variant',
      sig: 'aiux-tab-group', sideEffectImport: true,
      params: { tabs: 'Array of {label, id, content?, disabled?}', activeTab: 'Active tab id (attr: active-tab)', variant: "'boxed' | 'bordered' | 'lifted'", placement: "'top' | 'bottom'", size: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", name: 'Tab group name', stretch: 'Stretch tabs to fill width', onchange: 'Callback code string' } },
    { label: 'aiux-toast-notification', type: 'class', detail: 'aiux-kit - Toast notification | type, message, position',
      sig: 'aiux-toast-notification', sideEffectImport: true,
      params: { type: "'info' | 'success' | 'warning' | 'error'", message: 'Toast message text', position: 'Screen position string', dismissible: 'Show dismiss button', icon: 'Custom icon name', duration: 'Auto-dismiss in ms', visible: 'Show/hide toast' } },
    { label: 'aiux-time-selector', type: 'class', detail: 'aiux-kit - Time selector | is12Hour, value, size, disabled',
      sig: 'aiux-time-selector', sideEffectImport: true,
      params: { 'is-12-hour': 'Use 12-hour format with AM/PM toggle (default: true)', value: 'Initial time in HH:MM (24-hour) format', disabled: 'Disable all inputs', size: "'sm' | 'md' | 'lg'" } },
];

// Props available per element tag (for in-tag attribute/property suggestions)
// Use .propName for Lit JS property bindings, plain attr-name for HTML attributes
const _AC_COMPONENT_PROPS_MAP = {
    'aiux-accordion-group': [
        { label: '.items',   type: 'property', detail: 'Array - accordion items {title,content,open?}' },
        { label: 'multiple', type: 'property', detail: 'Boolean - allow multiple open items' },
        { label: 'icon',     type: 'property', detail: '"arrow" | "plus" - icon style per item' },
        { label: 'bordered', type: 'property', detail: 'Boolean - show item borders' },
        { label: 'onchange', type: 'property', detail: 'String - callback code; detail: {index,title,open}' },
    ],
    'aiux-alert-message': [
        { label: 'type',               type: 'property', detail: '"info" | "success" | "warning" | "error" | "primary" | "accent"' },
        { label: 'message',            type: 'property', detail: 'String - alert body text' },
        { label: 'alert-title',        type: 'property', detail: 'String - optional title' },
        { label: 'dismissible',        type: 'property', detail: 'Boolean - show dismiss button' },
        { label: 'icon',               type: 'property', detail: 'String - custom icon name (overrides default type icon)' },
        { label: 'duration',           type: 'property', detail: 'Number - auto-dismiss ms (0 = none)' },
        { label: 'autofocus-controls', type: 'property', detail: 'Boolean - autofocus dismiss button on render' },
    ],
    'aiux-calendar-component': [
        { label: '.currentDate',  type: 'property', detail: 'Object - displayed month {month, year}' },
        { label: '.selectedDate', type: 'property', detail: 'Object - selected date' },
    ],
    'aiux-carousel-slider': [
        { label: '.items',          type: 'property', detail: 'Array - slide content items' },
        { label: 'show-navigation', type: 'property', detail: 'Boolean - show prev/next buttons' },
        { label: 'show-indicators', type: 'property', detail: 'Boolean - show dot indicators' },
        { label: 'autoplay',        type: 'property', detail: 'Number - autoplay interval ms (0 = off)' },
        { label: 'alignment',       type: 'property', detail: 'String - slide alignment' },
        { label: 'vertical',        type: 'property', detail: 'Boolean - vertical orientation' },
        { label: 'onchange',        type: 'property', detail: 'String - callback code; detail: {index,previousIndex}' },
    ],
    'aiux-dialog': [
        { label: 'open',                    type: 'property', detail: 'Boolean - whether dialog is open' },
        { label: 'size',                    type: 'property', detail: '"sm" | "md" | "lg" | "xl" | "fullscreen"' },
        { label: 'is-modal',                type: 'property', detail: 'Boolean - render as modal overlay' },
        { label: 'show-close-button',       type: 'property', detail: 'Boolean - show close button' },
        { label: 'close-on-escape',         type: 'property', detail: 'Boolean - close on Escape key' },
        { label: 'close-on-backdrop-click', type: 'property', detail: 'Boolean - close when clicking backdrop' },
        { label: 'prevent-scroll',          type: 'property', detail: 'Boolean - prevent body scroll when modal open' },
        { label: 'resizable',               type: 'property', detail: 'Boolean - allow drag-to-resize' },
        { label: 'hide-padding',            type: 'property', detail: 'Boolean - remove padding from header/body/footer' },
        { label: 'dialog-label',            type: 'property', detail: 'String - aria-label for the dialog' },
        { label: '.customSize',             type: 'property', detail: 'Object - {width, height} in px or CSS units' },
    ],
    'aiux-icon': [
        { label: 'name',        type: 'property', detail: 'String - icon name in kebab-case (e.g. "play-fill")' },
        { label: 'size',        type: 'property', detail: '"xs" | "sm" | "md" | "lg" | "xl"' },
        { label: '.configAria', type: 'property', detail: 'Object - ARIA config {role, label}' },
    ],
    'aiux-live-region': [
        { label: 'mode',            type: 'property', detail: '"polite" | "assertive" | "off"' },
        { label: 'atomic',          type: 'property', detail: 'Boolean - aria-atomic' },
        { label: 'relevant',        type: 'property', detail: 'String - aria-relevant value' },
        { label: 'visually-hidden', type: 'property', detail: 'Boolean - invisible but still announced' },
        { label: 'region-role',     type: 'property', detail: 'String - override aria role' },
    ],
    'aiux-loader': [
        { label: 'size',             type: 'property', detail: '"xs" | "sm" | "md" | "lg" | "xl"' },
        { label: 'label',            type: 'property', detail: 'String - accessible loading label' },
        { label: '.animationConfig', type: 'property', detail: 'Object - Lottie animation config' },
        { label: 'show-footer',      type: 'property', detail: 'Boolean - show footer logo' },
    ],
    'aiux-pagination-nav': [
        { label: 'current-page',    type: 'property', detail: 'Number - active page number (1-based)' },
        { label: 'total-pages',     type: 'property', detail: 'Number - total number of pages' },
        { label: 'max-buttons',     type: 'property', detail: 'Number - max page buttons to show' },
        { label: 'show-prev-next',  type: 'property', detail: 'Boolean - show previous/next arrows' },
        { label: 'show-first-last', type: 'property', detail: 'Boolean - show first/last page arrows' },
        { label: 'size',            type: 'property', detail: '"xs" | "sm" | "md" | "lg" | "xl"' },
        { label: 'onchange',        type: 'property', detail: 'String - callback code; detail: {page,previousPage,totalPages}' },
    ],
    'aiux-tab-group': [
        { label: '.tabs',      type: 'property', detail: 'Array - tab items {label,id,content?,disabled?}' },
        { label: 'active-tab', type: 'property', detail: 'String - active tab id' },
        { label: 'variant',    type: 'property', detail: '"boxed" | "bordered" | "lifted"' },
        { label: 'placement',  type: 'property', detail: '"top" | "bottom"' },
        { label: 'size',       type: 'property', detail: '"xs" | "sm" | "md" | "lg" | "xl"' },
        { label: 'name',       type: 'property', detail: 'String - tab group name' },
        { label: 'stretch',    type: 'property', detail: 'Boolean - stretch tabs to fill width' },
        { label: 'onchange',   type: 'property', detail: 'String - callback code; detail: {id,label,index}' },
    ],
    'aiux-toast-notification': [
        { label: 'type',        type: 'property', detail: '"info" | "success" | "warning" | "error"' },
        { label: 'message',     type: 'property', detail: 'String - toast message text' },
        { label: 'position',    type: 'property', detail: 'String - screen position' },
        { label: 'dismissible', type: 'property', detail: 'Boolean - show dismiss button' },
        { label: 'icon',        type: 'property', detail: 'String - custom icon name' },
        { label: 'duration',    type: 'property', detail: 'Number - auto-dismiss ms' },
        { label: 'visible',     type: 'property', detail: 'Boolean - show/hide the toast' },
        { label: 'ondismiss',   type: 'property', detail: 'String - callback code on dismiss' },
    ],
    'aiux-time-selector': [
        { label: 'is-12-hour', type: 'property', detail: 'Boolean - use 12-hour format with AM/PM toggle (default: true)' },
        { label: 'value',      type: 'property', detail: 'String - initial time in HH:MM (24-hour) format' },
        { label: 'disabled',   type: 'property', detail: 'Boolean - disable all inputs' },
        { label: 'size',       type: 'property', detail: '"sm" | "md" | "lg"' },
    ],
};

// Server-script definitions
const _AC_SERVER = [
    { label: 'data',                      type: 'variable', detail: 'Server output data object',
      sig: 'data', ret: 'Object', params: null },
    { label: 'options',                   type: 'variable', detail: 'Widget options from parent' },
    { label: 'input',                     type: 'variable', detail: 'Client input payload' },
    { label: '$aiux.getWidget',          type: 'method',   detail: '$aiux - fetch nested widget data; returns {properties: {data, ...opts}, tagName}',
      sig: '$aiux.getWidget(widgetId, options?)', ret: '{properties, tagName}', params: { widgetId: 'Widget id or tag name', 'options?': 'Options passed as widget properties' } },
    { label: '$aiux.getPathParameter',   type: 'method',   detail: '$aiux - URL path param (e.g. /chat/:id)',
      sig: '$aiux.getPathParameter(name)', ret: 'string|null', params: { name: 'Parameter name from route pattern' } },
    { label: '$aiux.getSearchParameter', type: 'method',   detail: '$aiux - URL query param (e.g. ?filter=active)',
      sig: '$aiux.getSearchParameter(name)', ret: 'string|null', params: { name: 'Query parameter name' } },
    { label: '$aiux.getParameter',       type: 'method',   detail: '$aiux - get param (experience > page > path > search > request)',
      sig: '$aiux.getParameter(name)', ret: 'string|null', params: { name: 'Parameter name' } },
    { label: 'GlideRecord',   type: 'class',    detail: 'Server - GlideRecord API',
      sig: 'new GlideRecord(tableName)', ret: 'GlideRecord', params: { tableName: 'Table name to query' } },
    { label: 'GlideQuery',    type: 'class',    detail: 'Server - GlideQuery fluent API',
      sig: 'new GlideQuery(tableName)', ret: 'GlideQuery', params: { tableName: 'Table name to query' } },
    { label: 'gs',             type: 'variable', detail: 'Server - GlideSystem' },

    // Logging
    { label: 'gs.info',        type: 'method',   detail: 'gs - log info message',
      sig: 'gs.info(msg, ...args)', ret: 'void', params: { msg: 'Log message', args: 'Substitution values' } },
    { label: 'gs.warn',        type: 'method',   detail: 'gs - log warning message',
      sig: 'gs.warn(msg, ...args)', ret: 'void', params: { msg: 'Log message', args: 'Substitution values' } },
    { label: 'gs.error',       type: 'method',   detail: 'gs - log error message',
      sig: 'gs.error(msg, ...args)', ret: 'void', params: { msg: 'Log message', args: 'Substitution values' } },
    { label: 'gs.debug',       type: 'method',   detail: 'gs - log debug message',
      sig: 'gs.debug(msg, ...args)', ret: 'void', params: { msg: 'Log message', args: 'Substitution values' } },
    { label: 'gs.log',         type: 'method',   detail: 'gs - log message with optional source',
      sig: 'gs.log(msg, source?)', ret: 'void', params: { msg: 'Log message', 'source?': 'Source identifier' } },

    // User / Session
    { label: 'gs.getUser',        type: 'method', detail: 'gs - current GlideUser object',
      sig: 'gs.getUser()', ret: 'GlideUser', params: null },
    { label: 'gs.getUserID',      type: 'method', detail: 'gs - current user sys_id',
      sig: 'gs.getUserID()', ret: 'string', params: null },
    { label: 'gs.getUserName',    type: 'method', detail: 'gs - current user login name',
      sig: 'gs.getUserName()', ret: 'string', params: null },
    { label: 'gs.hasRole',        type: 'method', detail: 'gs - check if current user has role',
      sig: 'gs.hasRole(role)', ret: 'boolean', params: { role: 'Role name e.g. "admin"' } },
    { label: 'gs.isInteractive',  type: 'method', detail: 'gs - true if called from a UI session',
      sig: 'gs.isInteractive()', ret: 'boolean', params: null },
    { label: 'gs.getSession',     type: 'method', detail: 'gs - current GlideSession',
      sig: 'gs.getSession()', ret: 'GlideSession', params: null },

    // System properties
    { label: 'gs.getProperty',    type: 'method', detail: 'gs - get system property value',
      sig: 'gs.getProperty(key, default?)', ret: 'string', params: { key: 'Property name', 'default?': 'Default if not found' } },
    { label: 'gs.setProperty',    type: 'method', detail: 'gs - set system property value',
      sig: 'gs.setProperty(key, value, description?)', ret: 'void', params: { key: 'Property name', value: 'Value to set', 'description?': 'Description' } },

    // Messages
    { label: 'gs.getMessage',      type: 'method', detail: 'gs - get translated UI message',
      sig: 'gs.getMessage(id, ...args)', ret: 'string', params: { id: 'Message key', args: 'Substitution values' } },
    { label: 'gs.addInfoMessage',  type: 'method', detail: 'gs - add info message to session',
      sig: 'gs.addInfoMessage(msg)', ret: 'void', params: { msg: 'Message text' } },
    { label: 'gs.addErrorMessage', type: 'method', detail: 'gs - add error message to session',
      sig: 'gs.addErrorMessage(msg)', ret: 'void', params: { msg: 'Message text' } },

    // Date / Time
    { label: 'gs.now',                  type: 'method', detail: 'gs - current datetime string (UTC)',
      sig: 'gs.now()', ret: 'string', params: null },
    { label: 'gs.nowDate',              type: 'method', detail: 'gs - current date string (UTC)',
      sig: 'gs.nowDate()', ret: 'string', params: null },
    { label: 'gs.nowTime',              type: 'method', detail: 'gs - current time string (UTC)',
      sig: 'gs.nowTime()', ret: 'string', params: null },
    { label: 'gs.beginningOfToday',     type: 'method', detail: 'gs - start of today (UTC)',
      sig: 'gs.beginningOfToday()', ret: 'string', params: null },
    { label: 'gs.endOfToday',           type: 'method', detail: 'gs - end of today (UTC)',
      sig: 'gs.endOfToday()', ret: 'string', params: null },
    { label: 'gs.beginningOfThisWeek',  type: 'method', detail: 'gs - start of this week',
      sig: 'gs.beginningOfThisWeek()', ret: 'string', params: null },
    { label: 'gs.endOfThisWeek',        type: 'method', detail: 'gs - end of this week',
      sig: 'gs.endOfThisWeek()', ret: 'string', params: null },
    { label: 'gs.beginningOfLastWeek',  type: 'method', detail: 'gs - start of last week',
      sig: 'gs.beginningOfLastWeek()', ret: 'string', params: null },
    { label: 'gs.endOfLastWeek',        type: 'method', detail: 'gs - end of last week',
      sig: 'gs.endOfLastWeek()', ret: 'string', params: null },
    { label: 'gs.beginningOfThisMonth', type: 'method', detail: 'gs - start of this month',
      sig: 'gs.beginningOfThisMonth()', ret: 'string', params: null },
    { label: 'gs.endOfThisMonth',       type: 'method', detail: 'gs - end of this month',
      sig: 'gs.endOfThisMonth()', ret: 'string', params: null },
    { label: 'gs.beginningOfThisYear',  type: 'method', detail: 'gs - start of this year',
      sig: 'gs.beginningOfThisYear()', ret: 'string', params: null },
    { label: 'gs.endOfThisYear',        type: 'method', detail: 'gs - end of this year',
      sig: 'gs.endOfThisYear()', ret: 'string', params: null },

    // Instance info
    { label: 'gs.getInstanceName',      type: 'method', detail: 'gs - instance name (e.g. "dev12345")',
      sig: 'gs.getInstanceName()', ret: 'string', params: null },
    { label: 'gs.getCurrentScopeName',  type: 'method', detail: 'gs - current application scope name',
      sig: 'gs.getCurrentScopeName()', ret: 'string', params: null },
    { label: 'gs.getCurrentApplicationId', type: 'method', detail: 'gs - current application sys_id',
      sig: 'gs.getCurrentApplicationId()', ret: 'string', params: null },

    // Utilities
    { label: 'gs.generateGUID',  type: 'method', detail: 'gs - generate a new GUID',
      sig: 'gs.generateGUID()', ret: 'string', params: null },
    { label: 'gs.nil',           type: 'method', detail: 'gs - true if value is null/empty',
      sig: 'gs.nil(obj)', ret: 'boolean', params: { obj: 'Value to check' } },
    { label: 'gs.notNil',        type: 'method', detail: 'gs - true if value is not null/empty',
      sig: 'gs.notNil(obj)', ret: 'boolean', params: { obj: 'Value to check' } },
    { label: 'gs.urlEncode',     type: 'method', detail: 'gs - URL-encode a string',
      sig: 'gs.urlEncode(str)', ret: 'string', params: { str: 'String to encode' } },
    { label: 'gs.base64Encode',  type: 'method', detail: 'gs - base64-encode a string',
      sig: 'gs.base64Encode(str)', ret: 'string', params: { str: 'String to encode' } },
    { label: 'gs.base64Decode',  type: 'method', detail: 'gs - base64-decode a string',
      sig: 'gs.base64Decode(str)', ret: 'string', params: { str: 'Base64 string to decode' } },
    { label: 'gs.xmlToJSON',     type: 'method', detail: 'gs - convert XML string to JSON object',
      sig: 'gs.xmlToJSON(xml)', ret: 'Object', params: { xml: 'XML string' } },
    { label: 'gs.eventQueue',    type: 'method', detail: 'gs - fire a ServiceNow event',
      sig: 'gs.eventQueue(name, record, parm1?, parm2?)', ret: 'void', params: { name: 'Event name', record: 'GlideRecord context', 'parm1?': 'First parameter', 'parm2?': 'Second parameter' } },
    { label: 'gs.sleep',         type: 'method', detail: 'gs - pause execution for ms milliseconds',
      sig: 'gs.sleep(ms)', ret: 'void', params: { ms: 'Milliseconds to sleep' } },
    { label: 'gs.include',       type: 'method', detail: 'gs - include a Script Include (global scope)',
      sig: 'gs.include(name)', ret: 'void', params: { name: 'Script Include name' } },
    { label: 'gs.tableExists',   type: 'method', detail: 'gs - check if a table exists',
      sig: 'gs.tableExists(tableName)', ret: 'boolean', params: { tableName: 'Table name to check' } },
    { label: 'gs.isLoggedIn',    type: 'method', detail: 'gs - true if user is logged in',
      sig: 'gs.isLoggedIn()', ret: 'boolean', params: null },
    { label: 'gs.getDisplayName', type: 'method', detail: 'gs - current user display name',
      sig: 'gs.getDisplayName()', ret: 'string', params: null },
    { label: 'gs.getPreference', type: 'method', detail: 'gs - get user preference value',
      sig: 'gs.getPreference(key, default?)', ret: 'string', params: { key: 'Preference name', 'default?': 'Default if not set' } },
    { label: 'gs.flushMessages', type: 'method', detail: 'gs - flush queued info/error messages',
      sig: 'gs.flushMessages()', ret: 'void', params: null },
    { label: 'gs.getUrlOnStack', type: 'method', detail: 'gs - get URL from the top of the stack',
      sig: 'gs.getUrlOnStack()', ret: 'string', params: null },
    { label: 'gs.isMobile',     type: 'method', detail: 'gs - true if request is from mobile',
      sig: 'gs.isMobile()', ret: 'boolean', params: null },
    { label: 'gs.urlDecode',    type: 'method', detail: 'gs - URL-decode a string',
      sig: 'gs.urlDecode(str)', ret: 'string', params: { str: 'URL-encoded string to decode' } },
    { label: 'gs.getCallerScopeName', type: 'method', detail: 'gs - get the scope name of the calling script',
      sig: 'gs.getCallerScopeName()', ret: 'string', params: null },
    { label: 'gs.setRedirect',  type: 'method', detail: 'gs - redirect user to a URL after processing',
      sig: 'gs.setRedirect(url)', ret: 'void', params: { url: 'URL to redirect to' } },
    { label: 'gs.setReturn',    type: 'method', detail: 'gs - set return URL for Cancel button',
      sig: 'gs.setReturn(url)', ret: 'void', params: { url: 'Return URL' } },
    { label: 'gs.getMaxSchemaForProperty', type: 'method', detail: 'gs - get max schema length for a sys_property',
      sig: 'gs.getMaxSchemaForProperty()', ret: 'number', params: null },
    { label: 'gs.getUserDisplayName', type: 'method', detail: 'gs - current user full display name',
      sig: 'gs.getUserDisplayName()', ret: 'string', params: null },
    { label: 'gs.beginningOfNextWeek', type: 'method', detail: 'gs - start of next week',
      sig: 'gs.beginningOfNextWeek()', ret: 'string', params: null },
    { label: 'gs.endOfNextWeek',      type: 'method', detail: 'gs - end of next week',
      sig: 'gs.endOfNextWeek()', ret: 'string', params: null },
    { label: 'gs.beginningOfNextMonth', type: 'method', detail: 'gs - start of next month',
      sig: 'gs.beginningOfNextMonth()', ret: 'string', params: null },
    { label: 'gs.endOfNextMonth',      type: 'method', detail: 'gs - end of next month',
      sig: 'gs.endOfNextMonth()', ret: 'string', params: null },
    { label: 'gs.beginningOfNextYear', type: 'method', detail: 'gs - start of next year',
      sig: 'gs.beginningOfNextYear()', ret: 'string', params: null },
    { label: 'gs.endOfNextYear',      type: 'method', detail: 'gs - end of next year',
      sig: 'gs.endOfNextYear()', ret: 'string', params: null },
    { label: 'gs.beginningOfLastMonth', type: 'method', detail: 'gs - start of last month',
      sig: 'gs.beginningOfLastMonth()', ret: 'string', params: null },
    { label: 'gs.endOfLastMonth',      type: 'method', detail: 'gs - end of last month',
      sig: 'gs.endOfLastMonth()', ret: 'string', params: null },
    { label: 'gs.beginningOfLastYear', type: 'method', detail: 'gs - start of last year',
      sig: 'gs.beginningOfLastYear()', ret: 'string', params: null },
    { label: 'gs.endOfLastYear',      type: 'method', detail: 'gs - end of last year',
      sig: 'gs.endOfLastYear()', ret: 'string', params: null },
    { label: 'gs.daysAgo',      type: 'method', detail: 'gs - datetime N days ago',
      sig: 'gs.daysAgo(days)', ret: 'string', params: { days: 'Number of days ago' } },
    { label: 'gs.daysAgoStart', type: 'method', detail: 'gs - start of day N days ago (00:00:00)',
      sig: 'gs.daysAgoStart(days)', ret: 'string', params: { days: 'Number of days ago' } },
    { label: 'gs.daysAgoEnd',   type: 'method', detail: 'gs - end of day N days ago (23:59:59)',
      sig: 'gs.daysAgoEnd(days)', ret: 'string', params: { days: 'Number of days ago' } },
    { label: 'gs.hoursAgo',     type: 'method', detail: 'gs - datetime N hours ago',
      sig: 'gs.hoursAgo(hours)', ret: 'string', params: { hours: 'Number of hours ago' } },
    { label: 'gs.hoursAgoStart', type: 'method', detail: 'gs - start of hour N hours ago',
      sig: 'gs.hoursAgoStart(hours)', ret: 'string', params: { hours: 'Number of hours ago' } },
    { label: 'gs.hoursAgoEnd',  type: 'method', detail: 'gs - end of hour N hours ago',
      sig: 'gs.hoursAgoEnd(hours)', ret: 'string', params: { hours: 'Number of hours ago' } },
    { label: 'gs.minutesAgo',   type: 'method', detail: 'gs - datetime N minutes ago',
      sig: 'gs.minutesAgo(minutes)', ret: 'string', params: { minutes: 'Number of minutes ago' } },
    { label: 'gs.minutesAgoStart', type: 'method', detail: 'gs - start of minute N minutes ago',
      sig: 'gs.minutesAgoStart(minutes)', ret: 'string', params: { minutes: 'Number of minutes ago' } },
    { label: 'gs.minutesAgoEnd',   type: 'method', detail: 'gs - end of minute N minutes ago',
      sig: 'gs.minutesAgoEnd(minutes)', ret: 'string', params: { minutes: 'Number of minutes ago' } },
    { label: 'gs.monthsAgo',    type: 'method', detail: 'gs - datetime N months ago',
      sig: 'gs.monthsAgo(months)', ret: 'string', params: { months: 'Number of months ago' } },
    { label: 'gs.monthsAgoStart', type: 'method', detail: 'gs - start of month N months ago',
      sig: 'gs.monthsAgoStart(months)', ret: 'string', params: { months: 'Number of months ago' } },
    { label: 'gs.monthsAgoEnd', type: 'method', detail: 'gs - end of month N months ago',
      sig: 'gs.monthsAgoEnd(months)', ret: 'string', params: { months: 'Number of months ago' } },
    { label: 'gs.quartersAgoStart', type: 'method', detail: 'gs - start of quarter N quarters ago',
      sig: 'gs.quartersAgoStart(quarters)', ret: 'string', params: { quarters: 'Number of quarters ago' } },
    { label: 'gs.quartersAgoEnd',   type: 'method', detail: 'gs - end of quarter N quarters ago',
      sig: 'gs.quartersAgoEnd(quarters)', ret: 'string', params: { quarters: 'Number of quarters ago' } },
    { label: 'gs.yearsAgo',     type: 'method', detail: 'gs - datetime N years ago',
      sig: 'gs.yearsAgo(years)', ret: 'string', params: { years: 'Number of years ago' } },
    { label: 'gs.isDebugging',  type: 'method', detail: 'gs - true if session debug is enabled',
      sig: 'gs.isDebugging()', ret: 'boolean', params: null },
    { label: 'gs.isPaused',     type: 'method', detail: 'gs - true if system is paused',
      sig: 'gs.isPaused()', ret: 'boolean', params: null },

    // GlideRecord methods
    { label: 'GlideRecord.initialize',      type: 'method', detail: 'GlideRecord - initialize for insert',
      sig: 'gr.initialize()', ret: 'void', params: null },
    { label: 'GlideRecord.get',             type: 'method', detail: 'GlideRecord - get record by sys_id or field/value',
      sig: 'gr.get(field_or_id, value?)', ret: 'boolean', params: { 'field_or_id': 'sys_id or field name', 'value?': 'Value if field specified' } },
    { label: 'GlideRecord.query',           type: 'method', detail: 'GlideRecord - execute query',
      sig: 'gr.query()', ret: 'void', params: null },
    { label: 'GlideRecord.next',            type: 'method', detail: 'GlideRecord - move to next record',
      sig: 'gr.next()', ret: 'boolean', params: null },
    { label: 'GlideRecord.insert',          type: 'method', detail: 'GlideRecord - insert record, returns sys_id',
      sig: 'gr.insert()', ret: 'string', params: null },
    { label: 'GlideRecord.update',          type: 'method', detail: 'GlideRecord - update current record',
      sig: 'gr.update(reason?)', ret: 'string', params: { 'reason?': 'Audit reason' } },
    { label: 'GlideRecord.deleteRecord',    type: 'method', detail: 'GlideRecord - delete current record',
      sig: 'gr.deleteRecord()', ret: 'boolean', params: null },
    { label: 'GlideRecord.getValue',        type: 'method', detail: 'GlideRecord - get field value as string',
      sig: 'gr.getValue(field)', ret: 'string', params: { field: 'Field name' } },
    { label: 'GlideRecord.setValue',        type: 'method', detail: 'GlideRecord - set field value',
      sig: 'gr.setValue(field, value)', ret: 'void', params: { field: 'Field name', value: 'Value to set' } },
    { label: 'GlideRecord.getDisplayValue', type: 'method', detail: 'GlideRecord - get display value of field',
      sig: 'gr.getDisplayValue(field?)', ret: 'string', params: { 'field?': 'Field name (omit for record label)' } },
    { label: 'GlideRecord.addQuery',        type: 'method', detail: 'GlideRecord - add query condition',
      sig: 'gr.addQuery(field, operator_or_value, value?)', ret: 'GlideQueryCondition', params: { field: 'Field name', 'operator_or_value': 'Operator or value', 'value?': 'Value if operator provided' } },
    { label: 'GlideRecord.addEncodedQuery', type: 'method', detail: 'GlideRecord - add encoded query string',
      sig: 'gr.addEncodedQuery(query)', ret: 'void', params: { query: 'Encoded query string' } },
    { label: 'GlideRecord.addNullQuery',    type: 'method', detail: 'GlideRecord - add IS EMPTY condition',
      sig: 'gr.addNullQuery(field)', ret: 'GlideQueryCondition', params: { field: 'Field name' } },
    { label: 'GlideRecord.addNotNullQuery', type: 'method', detail: 'GlideRecord - add IS NOT EMPTY condition',
      sig: 'gr.addNotNullQuery(field)', ret: 'GlideQueryCondition', params: { field: 'Field name' } },
    { label: 'GlideRecord.setLimit',        type: 'method', detail: 'GlideRecord - limit number of results',
      sig: 'gr.setLimit(n)', ret: 'void', params: { n: 'Max rows to return' } },
    { label: 'GlideRecord.orderBy',         type: 'method', detail: 'GlideRecord - order results ascending',
      sig: 'gr.orderBy(field)', ret: 'void', params: { field: 'Field name' } },
    { label: 'GlideRecord.orderByDesc',     type: 'method', detail: 'GlideRecord - order results descending',
      sig: 'gr.orderByDesc(field)', ret: 'void', params: { field: 'Field name' } },
    { label: 'GlideRecord.getRowCount',     type: 'method', detail: 'GlideRecord - number of rows in result',
      sig: 'gr.getRowCount()', ret: 'number', params: null },
    { label: 'GlideRecord.isValidRecord',   type: 'method', detail: 'GlideRecord - true if record was found',
      sig: 'gr.isValidRecord()', ret: 'boolean', params: null },
    { label: 'GlideRecord.getEncodedQuery', type: 'method', detail: 'GlideRecord - get current query as encoded string',
      sig: 'gr.getEncodedQuery()', ret: 'string', params: null },
    { label: 'GlideRecord.canRead',         type: 'method', detail: 'GlideRecord - check read ACL',
      sig: 'gr.canRead()', ret: 'boolean', params: null },
    { label: 'GlideRecord.canWrite',        type: 'method', detail: 'GlideRecord - check write ACL',
      sig: 'gr.canWrite()', ret: 'boolean', params: null },
    { label: 'GlideRecord.canCreate',       type: 'method', detail: 'GlideRecord - check create ACL',
      sig: 'gr.canCreate()', ret: 'boolean', params: null },
    { label: 'GlideRecord.canDelete',       type: 'method', detail: 'GlideRecord - check delete ACL',
      sig: 'gr.canDelete()', ret: 'boolean', params: null },

    // GlideQuery methods
    { label: 'GlideQuery.where',        type: 'method', detail: 'GlideQuery - add WHERE condition',
      sig: 'gq.where(field, operator_or_value, value?)', ret: 'GlideQuery', params: { field: 'Field name', 'operator_or_value': 'Operator or value', 'value?': 'Value if operator provided' } },
    { label: 'GlideQuery.whereNotNull', type: 'method', detail: 'GlideQuery - field IS NOT EMPTY',
      sig: 'gq.whereNotNull(field)', ret: 'GlideQuery', params: { field: 'Field name' } },
    { label: 'GlideQuery.whereNull',    type: 'method', detail: 'GlideQuery - field IS EMPTY',
      sig: 'gq.whereNull(field)', ret: 'GlideQuery', params: { field: 'Field name' } },
    { label: 'GlideQuery.select',       type: 'method', detail: 'GlideQuery - execute and return stream',
      sig: 'gq.select(...fields)', ret: 'Stream', params: { fields: 'Field names to return' } },
    { label: 'GlideQuery.selectOne',    type: 'method', detail: 'GlideQuery - return first matching record',
      sig: 'gq.selectOne(...fields)', ret: 'Optional', params: { fields: 'Field names to return' } },
    { label: 'GlideQuery.get',          type: 'method', detail: 'GlideQuery - get record by sys_id',
      sig: 'gq.get(sysId, ...fields)', ret: 'Optional', params: { sysId: 'Record sys_id', fields: 'Field names to return' } },
    { label: 'GlideQuery.insert',       type: 'method', detail: 'GlideQuery - insert a new record',
      sig: 'gq.insert(fields)', ret: 'Optional', params: { fields: 'Object of field/value pairs' } },
    { label: 'GlideQuery.update',       type: 'method', detail: 'GlideQuery - update matching records',
      sig: 'gq.update(fields)', ret: 'GlideQuery', params: { fields: 'Object of field/value pairs' } },
    { label: 'GlideQuery.deleteMultiple', type: 'method', detail: 'GlideQuery - delete all matching records',
      sig: 'gq.deleteMultiple()', ret: 'void', params: null },
    { label: 'GlideQuery.limit',        type: 'method', detail: 'GlideQuery - limit number of results',
      sig: 'gq.limit(n)', ret: 'GlideQuery', params: { n: 'Max rows to return' } },
    { label: 'GlideQuery.orderBy',      type: 'method', detail: 'GlideQuery - order results ascending',
      sig: 'gq.orderBy(field)', ret: 'GlideQuery', params: { field: 'Field name' } },
    { label: 'GlideQuery.orderByDesc',  type: 'method', detail: 'GlideQuery - order results descending',
      sig: 'gq.orderByDesc(field)', ret: 'GlideQuery', params: { field: 'Field name' } },
    { label: 'GlideQuery.count',        type: 'method', detail: 'GlideQuery - count matching records',
      sig: 'gq.count()', ret: 'number', params: null },
    { label: 'GlideQuery.toArray',      type: 'method', detail: 'GlideQuery - execute and return array',
      sig: 'gq.toArray(limit?)', ret: 'Array', params: { 'limit?': 'Max items to return' } },

    // Additional GlideRecord methods
    { label: 'GlideRecord.addActiveQuery',      type: 'method', detail: 'GlideRecord - add active=true condition',
      sig: 'gr.addActiveQuery()', ret: 'GlideQueryCondition', params: null },
    { label: 'GlideRecord.addOrCondition',      type: 'method', detail: 'GlideRecord - add OR condition to existing query',
      sig: 'gr.addOrCondition(field, operator_or_value, value?)', ret: 'GlideQueryCondition', params: { field: 'Field name', 'operator_or_value': 'Operator or value', 'value?': 'Value if operator provided' } },
    { label: 'GlideRecord.setWorkflow',         type: 'method', detail: 'GlideRecord - enable/disable business rules',
      sig: 'gr.setWorkflow(enable)', ret: 'void', params: { enable: 'Boolean - true to run business rules' } },
    { label: 'GlideRecord.autoSysFields',       type: 'method', detail: 'GlideRecord - enable/disable auto sys fields (created_on, etc.)',
      sig: 'gr.autoSysFields(enable)', ret: 'void', params: { enable: 'Boolean - true to auto-populate system fields' } },
    { label: 'GlideRecord.setAbortAction',      type: 'method', detail: 'GlideRecord - abort current DML operation',
      sig: 'gr.setAbortAction(abort)', ret: 'void', params: { abort: 'Boolean - true to abort' } },
    { label: 'GlideRecord.getUniqueValue',      type: 'method', detail: 'GlideRecord - get sys_id of current record',
      sig: 'gr.getUniqueValue()', ret: 'string', params: null },
    { label: 'GlideRecord.getTableName',        type: 'method', detail: 'GlideRecord - get table name',
      sig: 'gr.getTableName()', ret: 'string', params: null },
    { label: 'GlideRecord.getRecordClassName',  type: 'method', detail: 'GlideRecord - get actual table for extended record',
      sig: 'gr.getRecordClassName()', ret: 'string', params: null },
    { label: 'GlideRecord.hasNext',             type: 'method', detail: 'GlideRecord - true if more records in result set',
      sig: 'gr.hasNext()', ret: 'boolean', params: null },
    { label: 'GlideRecord.getElement',          type: 'method', detail: 'GlideRecord - get GlideElement for field',
      sig: 'gr.getElement(field)', ret: 'GlideElement', params: { field: 'Field name' } },
    { label: 'GlideRecord.isNewRecord',         type: 'method', detail: 'GlideRecord - true if record has not been saved',
      sig: 'gr.isNewRecord()', ret: 'boolean', params: null },
    { label: 'GlideRecord.isValid',             type: 'method', detail: 'GlideRecord - true if table exists',
      sig: 'gr.isValid()', ret: 'boolean', params: null },
    { label: 'GlideRecord.isValidField',        type: 'method', detail: 'GlideRecord - true if field exists on table',
      sig: 'gr.isValidField(field)', ret: 'boolean', params: { field: 'Field name' } },
    { label: 'GlideRecord.changes',             type: 'method', detail: 'GlideRecord - true if any field value changed',
      sig: 'gr.changes()', ret: 'boolean', params: null },
    { label: 'GlideRecord.deleteMultiple',      type: 'method', detail: 'GlideRecord - delete all matching records (no business rules)',
      sig: 'gr.deleteMultiple()', ret: 'void', params: null },
    { label: 'GlideRecord.updateMultiple',      type: 'method', detail: 'GlideRecord - update all matching records',
      sig: 'gr.updateMultiple()', ret: 'void', params: null },
    { label: 'GlideRecord.addJoinQuery',        type: 'method', detail: 'GlideRecord - add join query to another table',
      sig: 'gr.addJoinQuery(joinTable, primaryField?, joinField?)', ret: 'GlideQueryCondition', params: { joinTable: 'Table to join', 'primaryField?': 'Primary table field (default sys_id)', 'joinField?': 'Join table field (default sys_id)' } },
    { label: 'GlideRecord.chooseWindow',        type: 'method', detail: 'GlideRecord - set result window (pagination)',
      sig: 'gr.chooseWindow(firstRow, lastRow, forceCount?)', ret: 'void', params: { firstRow: 'First row (0-based)', lastRow: 'Last row (exclusive)', 'forceCount?': 'Boolean - force row count' } },
    { label: 'GlideRecord.getLabel',            type: 'method', detail: 'GlideRecord - get table label',
      sig: 'gr.getLabel()', ret: 'string', params: null },
    { label: 'GlideRecord.getLink',             type: 'method', detail: 'GlideRecord - get URL link to current record',
      sig: 'gr.getLink(noStack?)', ret: 'string', params: { 'noStack?': 'Boolean - omit sysparm_stack' } },
    { label: 'GlideRecord.setCategory',         type: 'method', detail: 'GlideRecord - set category for server-side logging',
      sig: 'gr.setCategory(category)', ret: 'void', params: { category: 'Category string' } },

    // GlideRecordSecure (ACL-enforced GlideRecord)
    { label: 'GlideRecordSecure',               type: 'class', detail: 'Server - GlideRecord with ACL enforcement',
      sig: 'new GlideRecordSecure(tableName)', ret: 'GlideRecordSecure', params: { tableName: 'Table name to query (ACLs enforced on every operation)' } },

    // GlideDateTime
    { label: 'GlideDateTime',                    type: 'class', detail: 'Server - date/time manipulation',
      sig: 'new GlideDateTime(dateTime?)', ret: 'GlideDateTime', params: { 'dateTime?': 'String in "yyyy-MM-dd HH:mm:ss" format or another GlideDateTime; omit for current time' } },
    { label: 'GlideDateTime.getDisplayValue',    type: 'method', detail: 'GlideDateTime - get display value in user timezone',
      sig: 'gdt.getDisplayValue()', ret: 'string', params: null },
    { label: 'GlideDateTime.getDisplayValueInternal', type: 'method', detail: 'GlideDateTime - get internal display value (UTC)',
      sig: 'gdt.getDisplayValueInternal()', ret: 'string', params: null },
    { label: 'GlideDateTime.getValue',           type: 'method', detail: 'GlideDateTime - get value in UTC "yyyy-MM-dd HH:mm:ss"',
      sig: 'gdt.getValue()', ret: 'string', params: null },
    { label: 'GlideDateTime.setValue',           type: 'method', detail: 'GlideDateTime - set from string or milliseconds',
      sig: 'gdt.setValue(dateTime)', ret: 'void', params: { dateTime: 'String "yyyy-MM-dd HH:mm:ss" or milliseconds' } },
    { label: 'GlideDateTime.setDisplayValue',    type: 'method', detail: 'GlideDateTime - set from user timezone display string',
      sig: 'gdt.setDisplayValue(asDisplayed)', ret: 'void', params: { asDisplayed: 'Date/time in user timezone' } },
    { label: 'GlideDateTime.setDisplayValueInternal', type: 'method', detail: 'GlideDateTime - set from internal display string (UTC)',
      sig: 'gdt.setDisplayValueInternal(value)', ret: 'void', params: { value: 'Date/time string in internal format' } },
    { label: 'GlideDateTime.getDate',            type: 'method', detail: 'GlideDateTime - get date portion as GlideDate',
      sig: 'gdt.getDate()', ret: 'GlideDate', params: null },
    { label: 'GlideDateTime.getTime',            type: 'method', detail: 'GlideDateTime - get time portion as GlideTime',
      sig: 'gdt.getTime()', ret: 'GlideTime', params: null },
    { label: 'GlideDateTime.getLocalDate',       type: 'method', detail: 'GlideDateTime - get date in user timezone',
      sig: 'gdt.getLocalDate()', ret: 'GlideDate', params: null },
    { label: 'GlideDateTime.getLocalTime',       type: 'method', detail: 'GlideDateTime - get time in user timezone',
      sig: 'gdt.getLocalTime()', ret: 'GlideTime', params: null },
    { label: 'GlideDateTime.add',               type: 'method', detail: 'GlideDateTime - add milliseconds',
      sig: 'gdt.add(milliseconds)', ret: 'void', params: { milliseconds: 'Number of milliseconds to add' } },
    { label: 'GlideDateTime.addDaysLocalTime',   type: 'method', detail: 'GlideDateTime - add days in user timezone',
      sig: 'gdt.addDaysLocalTime(days)', ret: 'void', params: { days: 'Number of days to add' } },
    { label: 'GlideDateTime.addDaysUTC',         type: 'method', detail: 'GlideDateTime - add days in UTC',
      sig: 'gdt.addDaysUTC(days)', ret: 'void', params: { days: 'Number of days to add' } },
    { label: 'GlideDateTime.addMonthsLocalTime', type: 'method', detail: 'GlideDateTime - add months in user timezone',
      sig: 'gdt.addMonthsLocalTime(months)', ret: 'void', params: { months: 'Number of months to add' } },
    { label: 'GlideDateTime.addMonthsUTC',       type: 'method', detail: 'GlideDateTime - add months in UTC',
      sig: 'gdt.addMonthsUTC(months)', ret: 'void', params: { months: 'Number of months to add' } },
    { label: 'GlideDateTime.addYearsLocalTime',  type: 'method', detail: 'GlideDateTime - add years in user timezone',
      sig: 'gdt.addYearsLocalTime(years)', ret: 'void', params: { years: 'Number of years to add' } },
    { label: 'GlideDateTime.addYearsUTC',        type: 'method', detail: 'GlideDateTime - add years in UTC',
      sig: 'gdt.addYearsUTC(years)', ret: 'void', params: { years: 'Number of years to add' } },
    { label: 'GlideDateTime.addWeeksLocalTime',  type: 'method', detail: 'GlideDateTime - add weeks in user timezone',
      sig: 'gdt.addWeeksLocalTime(weeks)', ret: 'void', params: { weeks: 'Number of weeks to add' } },
    { label: 'GlideDateTime.addWeeksUTC',        type: 'method', detail: 'GlideDateTime - add weeks in UTC',
      sig: 'gdt.addWeeksUTC(weeks)', ret: 'void', params: { weeks: 'Number of weeks to add' } },
    { label: 'GlideDateTime.addSeconds',         type: 'method', detail: 'GlideDateTime - add seconds',
      sig: 'gdt.addSeconds(seconds)', ret: 'void', params: { seconds: 'Number of seconds to add' } },
    { label: 'GlideDateTime.subtract',           type: 'method', detail: 'GlideDateTime - subtract another GlideDateTime or GlideDuration',
      sig: 'gdt.subtract(first, second?)', ret: 'GlideDuration', params: { first: 'GlideDateTime or GlideDuration to subtract', 'second?': 'If first is GlideDateTime, subtracts first-second' } },
    { label: 'GlideDateTime.before',             type: 'method', detail: 'GlideDateTime - true if this is before other',
      sig: 'gdt.before(other)', ret: 'boolean', params: { other: 'GlideDateTime to compare' } },
    { label: 'GlideDateTime.after',              type: 'method', detail: 'GlideDateTime - true if this is after other',
      sig: 'gdt.after(other)', ret: 'boolean', params: { other: 'GlideDateTime to compare' } },
    { label: 'GlideDateTime.onOrBefore',         type: 'method', detail: 'GlideDateTime - true if this is on or before other',
      sig: 'gdt.onOrBefore(other)', ret: 'boolean', params: { other: 'GlideDateTime to compare' } },
    { label: 'GlideDateTime.onOrAfter',          type: 'method', detail: 'GlideDateTime - true if this is on or after other',
      sig: 'gdt.onOrAfter(other)', ret: 'boolean', params: { other: 'GlideDateTime to compare' } },
    { label: 'GlideDateTime.equals',             type: 'method', detail: 'GlideDateTime - true if equal to other',
      sig: 'gdt.equals(other)', ret: 'boolean', params: { other: 'GlideDateTime to compare' } },
    { label: 'GlideDateTime.compareTo',          type: 'method', detail: 'GlideDateTime - compare (-1, 0, 1)',
      sig: 'gdt.compareTo(other)', ret: 'number', params: { other: 'GlideDateTime to compare' } },
    { label: 'GlideDateTime.getNumericValue',    type: 'method', detail: 'GlideDateTime - get epoch milliseconds',
      sig: 'gdt.getNumericValue()', ret: 'number', params: null },
    { label: 'GlideDateTime.setGlideDateTime',   type: 'method', detail: 'GlideDateTime - copy from another GlideDateTime',
      sig: 'gdt.setGlideDateTime(other)', ret: 'void', params: { other: 'GlideDateTime to copy from' } },
    { label: 'GlideDateTime.getDayOfWeekLocalTime', type: 'method', detail: 'GlideDateTime - day of week (1=Mon..7=Sun) in user timezone',
      sig: 'gdt.getDayOfWeekLocalTime()', ret: 'number', params: null },
    { label: 'GlideDateTime.getDayOfWeekUTC',    type: 'method', detail: 'GlideDateTime - day of week (1=Mon..7=Sun) in UTC',
      sig: 'gdt.getDayOfWeekUTC()', ret: 'number', params: null },
    { label: 'GlideDateTime.getDayOfMonthLocalTime', type: 'method', detail: 'GlideDateTime - day of month in user timezone',
      sig: 'gdt.getDayOfMonthLocalTime()', ret: 'number', params: null },
    { label: 'GlideDateTime.getDayOfMonthUTC',   type: 'method', detail: 'GlideDateTime - day of month in UTC',
      sig: 'gdt.getDayOfMonthUTC()', ret: 'number', params: null },
    { label: 'GlideDateTime.getMonthLocalTime',  type: 'method', detail: 'GlideDateTime - month (1-12) in user timezone',
      sig: 'gdt.getMonthLocalTime()', ret: 'number', params: null },
    { label: 'GlideDateTime.getMonthUTC',        type: 'method', detail: 'GlideDateTime - month (1-12) in UTC',
      sig: 'gdt.getMonthUTC()', ret: 'number', params: null },
    { label: 'GlideDateTime.getYearLocalTime',   type: 'method', detail: 'GlideDateTime - year in user timezone',
      sig: 'gdt.getYearLocalTime()', ret: 'number', params: null },
    { label: 'GlideDateTime.getYearUTC',         type: 'method', detail: 'GlideDateTime - year in UTC',
      sig: 'gdt.getYearUTC()', ret: 'number', params: null },
    { label: 'GlideDateTime.isValid',            type: 'method', detail: 'GlideDateTime - true if holds a valid date/time',
      sig: 'gdt.isValid()', ret: 'boolean', params: null },
    { label: 'GlideDateTime.getErrorMsg',        type: 'method', detail: 'GlideDateTime - get error message if invalid',
      sig: 'gdt.getErrorMsg()', ret: 'string', params: null },
    { label: 'GlideDateTime.toString',           type: 'method', detail: 'GlideDateTime - string representation',
      sig: 'gdt.toString()', ret: 'string', params: null },
    { label: 'GlideDateTime.getTZOffset',        type: 'method', detail: 'GlideDateTime - timezone offset in ms',
      sig: 'gdt.getTZOffset()', ret: 'number', params: null },
    { label: 'GlideDateTime.hashCode',           type: 'method', detail: 'GlideDateTime - hash code for the date/time',
      sig: 'gdt.hashCode()', ret: 'number', params: null },

    // GlideAjax (server-side - used in server scripts to call Script Includes)
    { label: 'GlideAjax',                        type: 'class', detail: 'Server - call Script Include from client/server',
      sig: 'new GlideAjax(scriptIncludeName)', ret: 'GlideAjax', params: { scriptIncludeName: 'Name of the Script Include class' } },
    { label: 'GlideAjax.addParam',              type: 'method', detail: 'GlideAjax - add parameter to request',
      sig: 'ga.addParam(name, value)', ret: 'void', params: { name: 'Parameter name (use "sysparm_name" for method name)', value: 'Parameter value' } },
    { label: 'GlideAjax.getXMLAnswer',          type: 'method', detail: 'GlideAjax - execute and get answer synchronously',
      sig: 'ga.getXMLAnswer()', ret: 'string', params: null },
    { label: 'GlideAjax.getAnswer',             type: 'method', detail: 'GlideAjax - get the answer node value',
      sig: 'ga.getAnswer()', ret: 'string', params: null },
    { label: 'GlideAjax.getXML',               type: 'method', detail: 'GlideAjax - execute and get full XML response',
      sig: 'ga.getXML(callback?)', ret: 'XMLDocument', params: { 'callback?': 'Async callback function(response)' } },
    { label: 'GlideAjax.setScope',             type: 'method', detail: 'GlideAjax - set application scope for the request',
      sig: 'ga.setScope(scope)', ret: 'void', params: { scope: 'Application scope name' } },

    // GlideDuration
    { label: 'GlideDuration',                    type: 'class', detail: 'Server - duration value (days/hours/minutes/seconds)',
      sig: 'new GlideDuration(value?)', ret: 'GlideDuration', params: { 'value?': 'Duration string "days HH:mm:ss" or milliseconds' } },
    { label: 'GlideDuration.getDisplayValue',    type: 'method', detail: 'GlideDuration - display value',
      sig: 'gd.getDisplayValue()', ret: 'string', params: null },
    { label: 'GlideDuration.getValue',           type: 'method', detail: 'GlideDuration - internal value',
      sig: 'gd.getValue()', ret: 'string', params: null },
    { label: 'GlideDuration.setValue',           type: 'method', detail: 'GlideDuration - set value',
      sig: 'gd.setValue(value)', ret: 'void', params: { value: 'Duration string or milliseconds' } },
    { label: 'GlideDuration.add',               type: 'method', detail: 'GlideDuration - add another duration',
      sig: 'gd.add(other)', ret: 'GlideDuration', params: { other: 'GlideDuration to add' } },
    { label: 'GlideDuration.subtract',          type: 'method', detail: 'GlideDuration - subtract another duration',
      sig: 'gd.subtract(other)', ret: 'GlideDuration', params: { other: 'GlideDuration to subtract' } },
    { label: 'GlideDuration.getDayPart',        type: 'method', detail: 'GlideDuration - get days portion',
      sig: 'gd.getDayPart()', ret: 'number', params: null },
    { label: 'GlideDuration.getRoundedDayPart', type: 'method', detail: 'GlideDuration - get rounded days',
      sig: 'gd.getRoundedDayPart()', ret: 'number', params: null },
    { label: 'GlideDuration.getDurationValue',  type: 'method', detail: 'GlideDuration - get duration as "ddd HH:mm:ss"',
      sig: 'gd.getDurationValue()', ret: 'string', params: null },
    { label: 'GlideDuration.getByFormat',       type: 'method', detail: 'GlideDuration - get formatted duration',
      sig: 'gd.getByFormat(format)', ret: 'string', params: { format: 'Format string' } },

    // GlideElement (field-level API on GlideRecord)
    { label: 'GlideElement.getValue',           type: 'method', detail: 'GlideElement - get raw value',
      sig: 'ge.getValue()', ret: 'string', params: null },
    { label: 'GlideElement.setValue',           type: 'method', detail: 'GlideElement - set field value',
      sig: 'ge.setValue(value)', ret: 'void', params: { value: 'Value to set' } },
    { label: 'GlideElement.getDisplayValue',    type: 'method', detail: 'GlideElement - get display value',
      sig: 'ge.getDisplayValue()', ret: 'string', params: null },
    { label: 'GlideElement.toString',           type: 'method', detail: 'GlideElement - string value',
      sig: 'ge.toString()', ret: 'string', params: null },
    { label: 'GlideElement.nil',               type: 'method', detail: 'GlideElement - true if null or empty',
      sig: 'ge.nil()', ret: 'boolean', params: null },
    { label: 'GlideElement.changes',           type: 'method', detail: 'GlideElement - true if value changed',
      sig: 'ge.changes()', ret: 'boolean', params: null },
    { label: 'GlideElement.changesFrom',       type: 'method', detail: 'GlideElement - true if changed from specific value',
      sig: 'ge.changesFrom(value)', ret: 'boolean', params: { value: 'Previous value to check' } },
    { label: 'GlideElement.changesTo',         type: 'method', detail: 'GlideElement - true if changed to specific value',
      sig: 'ge.changesTo(value)', ret: 'boolean', params: { value: 'New value to check' } },
    { label: 'GlideElement.getReferenceTable',  type: 'method', detail: 'GlideElement - get referenced table name',
      sig: 'ge.getReferenceTable()', ret: 'string', params: null },
    { label: 'GlideElement.getRefRecord',       type: 'method', detail: 'GlideElement - get referenced GlideRecord',
      sig: 'ge.getRefRecord()', ret: 'GlideRecord', params: null },
    { label: 'GlideElement.getED',             type: 'method', detail: 'GlideElement - get element descriptor (field metadata)',
      sig: 'ge.getED()', ret: 'GlideElementDescriptor', params: null },
    { label: 'GlideElement.getLabel',          type: 'method', detail: 'GlideElement - get field label',
      sig: 'ge.getLabel()', ret: 'string', params: null },
    { label: 'GlideElement.getName',           type: 'method', detail: 'GlideElement - get field name',
      sig: 'ge.getName()', ret: 'string', params: null },
    { label: 'GlideElement.getTableName',      type: 'method', detail: 'GlideElement - get table name of the field',
      sig: 'ge.getTableName()', ret: 'string', params: null },

    // GlideAggregate
    { label: 'GlideAggregate',                  type: 'class', detail: 'Server - aggregate queries (COUNT, SUM, AVG, MIN, MAX)',
      sig: 'new GlideAggregate(tableName)', ret: 'GlideAggregate', params: { tableName: 'Table to query' } },
    { label: 'GlideAggregate.addAggregate',     type: 'method', detail: 'GlideAggregate - add aggregate function',
      sig: 'ga.addAggregate(type, field?)', ret: 'void', params: { type: '"COUNT" | "SUM" | "AVG" | "MIN" | "MAX"', 'field?': 'Field to aggregate (required for SUM/AVG/MIN/MAX)' } },
    { label: 'GlideAggregate.getAggregate',     type: 'method', detail: 'GlideAggregate - get aggregate result',
      sig: 'ga.getAggregate(type, field?)', ret: 'string', params: { type: '"COUNT" | "SUM" | "AVG" | "MIN" | "MAX"', 'field?': 'Field name' } },
    { label: 'GlideAggregate.groupBy',          type: 'method', detail: 'GlideAggregate - group results by field',
      sig: 'ga.groupBy(field)', ret: 'void', params: { field: 'Field name to group by' } },
    { label: 'GlideAggregate.query',            type: 'method', detail: 'GlideAggregate - execute the aggregate query',
      sig: 'ga.query()', ret: 'void', params: null },
    { label: 'GlideAggregate.next',             type: 'method', detail: 'GlideAggregate - move to next group',
      sig: 'ga.next()', ret: 'boolean', params: null },
    { label: 'GlideAggregate.addQuery',         type: 'method', detail: 'GlideAggregate - add query condition',
      sig: 'ga.addQuery(field, operator_or_value, value?)', ret: 'GlideQueryCondition', params: { field: 'Field name', 'operator_or_value': 'Operator or value', 'value?': 'Value if operator provided' } },
    { label: 'GlideAggregate.addEncodedQuery',  type: 'method', detail: 'GlideAggregate - add encoded query',
      sig: 'ga.addEncodedQuery(query)', ret: 'void', params: { query: 'Encoded query string' } },
    { label: 'GlideAggregate.orderByAggregate', type: 'method', detail: 'GlideAggregate - order by aggregate value',
      sig: 'ga.orderByAggregate(type, field)', ret: 'void', params: { type: 'Aggregate type', field: 'Field name' } },

    // GlideSession
    { label: 'GlideSession',                     type: 'class', detail: 'Server - current user session',
      sig: 'gs.getSession()', ret: 'GlideSession', params: null },
    { label: 'GlideSession.getClientData',       type: 'method', detail: 'GlideSession - get client data by key',
      sig: 'session.getClientData(key)', ret: 'string', params: { key: 'Client data key name' } },
    { label: 'GlideSession.putClientData',       type: 'method', detail: 'GlideSession - set client data',
      sig: 'session.putClientData(key, value)', ret: 'void', params: { key: 'Client data key', value: 'Value to store' } },
    { label: 'GlideSession.getClientIP',         type: 'method', detail: 'GlideSession - get client IP address',
      sig: 'session.getClientIP()', ret: 'string', params: null },
    { label: 'GlideSession.getCurrentDomainID',  type: 'method', detail: 'GlideSession - current domain sys_id',
      sig: 'session.getCurrentDomainID()', ret: 'string', params: null },
    { label: 'GlideSession.getLanguage',         type: 'method', detail: 'GlideSession - session language code',
      sig: 'session.getLanguage()', ret: 'string', params: null },
    { label: 'GlideSession.getTimeZoneName',     type: 'method', detail: 'GlideSession - session timezone name',
      sig: 'session.getTimeZoneName()', ret: 'string', params: null },
    { label: 'GlideSession.getSessionToken',     type: 'method', detail: 'GlideSession - CSRF token for the session',
      sig: 'session.getSessionToken()', ret: 'string', params: null },
    { label: 'GlideSession.getUrlOnStack',       type: 'method', detail: 'GlideSession - URL from top of stack',
      sig: 'session.getUrlOnStack()', ret: 'string', params: null },
    { label: 'GlideSession.isLoggedIn',          type: 'method', detail: 'GlideSession - true if user is authenticated',
      sig: 'session.isLoggedIn()', ret: 'boolean', params: null },
    { label: 'GlideSession.isInteractive',       type: 'method', detail: 'GlideSession - true if interactive UI session',
      sig: 'session.isInteractive()', ret: 'boolean', params: null },

    // GlideUser
    { label: 'GlideUser',                        type: 'class', detail: 'Server - current user object (from gs.getUser())',
      sig: 'gs.getUser()', ret: 'GlideUser', params: null },
    { label: 'GlideUser.getID',                  type: 'method', detail: 'GlideUser - user sys_id',
      sig: 'user.getID()', ret: 'string', params: null },
    { label: 'GlideUser.getName',                type: 'method', detail: 'GlideUser - user login name',
      sig: 'user.getName()', ret: 'string', params: null },
    { label: 'GlideUser.getDisplayName',         type: 'method', detail: 'GlideUser - user display name',
      sig: 'user.getDisplayName()', ret: 'string', params: null },
    { label: 'GlideUser.getEmail',               type: 'method', detail: 'GlideUser - user email address',
      sig: 'user.getEmail()', ret: 'string', params: null },
    { label: 'GlideUser.getDomainID',            type: 'method', detail: 'GlideUser - user domain sys_id',
      sig: 'user.getDomainID()', ret: 'string', params: null },
    { label: 'GlideUser.getCompanyID',           type: 'method', detail: 'GlideUser - user company sys_id',
      sig: 'user.getCompanyID()', ret: 'string', params: null },
    { label: 'GlideUser.getDepartmentID',        type: 'method', detail: 'GlideUser - user department sys_id',
      sig: 'user.getDepartmentID()', ret: 'string', params: null },
    { label: 'GlideUser.getManagerID',           type: 'method', detail: 'GlideUser - user manager sys_id',
      sig: 'user.getManagerID()', ret: 'string', params: null },
    { label: 'GlideUser.getFirstName',           type: 'method', detail: 'GlideUser - user first name',
      sig: 'user.getFirstName()', ret: 'string', params: null },
    { label: 'GlideUser.getLastName',            type: 'method', detail: 'GlideUser - user last name',
      sig: 'user.getLastName()', ret: 'string', params: null },
    { label: 'GlideUser.hasRole',                type: 'method', detail: 'GlideUser - check if user has role',
      sig: 'user.hasRole(role)', ret: 'boolean', params: { role: 'Role name' } },
    { label: 'GlideUser.getRoles',               type: 'method', detail: 'GlideUser - get all user roles',
      sig: 'user.getRoles()', ret: 'string[]', params: null },
    { label: 'GlideUser.isMemberOf',             type: 'method', detail: 'GlideUser - check group membership',
      sig: 'user.isMemberOf(group)', ret: 'boolean', params: { group: 'Group name or sys_id' } },
    { label: 'GlideUser.getMyGroups',            type: 'method', detail: 'GlideUser - get user group sys_ids',
      sig: 'user.getMyGroups()', ret: 'string[]', params: null },
    { label: 'GlideUser.getPreference',          type: 'method', detail: 'GlideUser - get a user preference',
      sig: 'user.getPreference(name)', ret: 'string', params: { name: 'Preference name' } },
    { label: 'GlideUser.savePreference',         type: 'method', detail: 'GlideUser - save a user preference',
      sig: 'user.savePreference(name, value)', ret: 'void', params: { name: 'Preference name', value: 'Value to save' } },

    // GlideDate
    { label: 'GlideDate',                        type: 'class', detail: 'Server - date-only value (no time)',
      sig: 'new GlideDate()', ret: 'GlideDate', params: null },
    { label: 'GlideDate.getValue',               type: 'method', detail: 'GlideDate - get internal value (yyyy-MM-dd)',
      sig: 'gd.getValue()', ret: 'string', params: null },
    { label: 'GlideDate.setValue',               type: 'method', detail: 'GlideDate - set date value',
      sig: 'gd.setValue(dateString)', ret: 'void', params: { dateString: 'Date string yyyy-MM-dd' } },
    { label: 'GlideDate.getDisplayValue',        type: 'method', detail: 'GlideDate - display value in user format',
      sig: 'gd.getDisplayValue()', ret: 'string', params: null },
    { label: 'GlideDate.setDisplayValue',        type: 'method', detail: 'GlideDate - set from user display format',
      sig: 'gd.setDisplayValue(dateString)', ret: 'void', params: { dateString: 'Date in user format' } },
    { label: 'GlideDate.getByFormat',            type: 'method', detail: 'GlideDate - get date in custom format',
      sig: 'gd.getByFormat(format)', ret: 'string', params: { format: 'SimpleDateFormat pattern' } },
    { label: 'GlideDate.getDayOfMonthNoTZ',      type: 'method', detail: 'GlideDate - day of month (no timezone)',
      sig: 'gd.getDayOfMonthNoTZ()', ret: 'number', params: null },
    { label: 'GlideDate.getMonthNoTZ',           type: 'method', detail: 'GlideDate - month (1-12, no timezone)',
      sig: 'gd.getMonthNoTZ()', ret: 'number', params: null },
    { label: 'GlideDate.getYearNoTZ',            type: 'method', detail: 'GlideDate - year (no timezone)',
      sig: 'gd.getYearNoTZ()', ret: 'number', params: null },

    // GlideTime
    { label: 'GlideTime',                        type: 'class', detail: 'Server - time-only value (no date)',
      sig: 'new GlideTime(milliseconds?)', ret: 'GlideTime', params: { 'milliseconds?': 'Time in ms from midnight; omit for current time' } },
    { label: 'GlideTime.getValue',               type: 'method', detail: 'GlideTime - internal value (HH:mm:ss)',
      sig: 'gt.getValue()', ret: 'string', params: null },
    { label: 'GlideTime.setValue',               type: 'method', detail: 'GlideTime - set time value',
      sig: 'gt.setValue(timeString)', ret: 'void', params: { timeString: 'Time string HH:mm:ss' } },
    { label: 'GlideTime.getDisplayValue',        type: 'method', detail: 'GlideTime - display value in user format',
      sig: 'gt.getDisplayValue()', ret: 'string', params: null },
    { label: 'GlideTime.getDisplayValueInternal', type: 'method', detail: 'GlideTime - internal display value',
      sig: 'gt.getDisplayValueInternal()', ret: 'string', params: null },
    { label: 'GlideTime.getByFormat',            type: 'method', detail: 'GlideTime - get time in custom format',
      sig: 'gt.getByFormat(format)', ret: 'string', params: { format: 'SimpleDateFormat pattern' } },
    { label: 'GlideTime.getHourLocalTime',       type: 'method', detail: 'GlideTime - hour in user timezone (0-23)',
      sig: 'gt.getHourLocalTime()', ret: 'number', params: null },
    { label: 'GlideTime.getHourUTC',             type: 'method', detail: 'GlideTime - hour in UTC (0-23)',
      sig: 'gt.getHourUTC()', ret: 'number', params: null },
    { label: 'GlideTime.getHourOfDayLocalTime',  type: 'method', detail: 'GlideTime - hour of day in user timezone',
      sig: 'gt.getHourOfDayLocalTime()', ret: 'number', params: null },
    { label: 'GlideTime.getHourOfDayUTC',        type: 'method', detail: 'GlideTime - hour of day in UTC',
      sig: 'gt.getHourOfDayUTC()', ret: 'number', params: null },

    // GlideQueryCondition (returned by GlideRecord.addQuery)
    { label: 'GlideQueryCondition',              type: 'class', detail: 'Server - query condition (from gr.addQuery())' },
    { label: 'GlideQueryCondition.addCondition', type: 'method', detail: 'GlideQueryCondition - add AND condition',
      sig: 'qc.addCondition(field, operator_or_value, value?)', ret: 'GlideQueryCondition', params: { field: 'Field name', 'operator_or_value': 'Operator or value', 'value?': 'Value if operator provided' } },
    { label: 'GlideQueryCondition.addOrCondition', type: 'method', detail: 'GlideQueryCondition - add OR condition',
      sig: 'qc.addOrCondition(field, operator_or_value, value?)', ret: 'GlideQueryCondition', params: { field: 'Field name', 'operator_or_value': 'Operator or value', 'value?': 'Value if operator provided' } },

    // GlideSysAttachment
    { label: 'GlideSysAttachment',               type: 'class', detail: 'Server - manage record attachments',
      sig: 'new GlideSysAttachment()', ret: 'GlideSysAttachment', params: null },
    { label: 'GlideSysAttachment.write',         type: 'method', detail: 'GlideSysAttachment - attach data to a record',
      sig: 'att.write(record, fileName, contentType, data)', ret: 'string', params: { record: 'GlideRecord to attach to', fileName: 'File name', contentType: 'MIME type', data: 'String content' } },
    { label: 'GlideSysAttachment.writeBase64',   type: 'method', detail: 'GlideSysAttachment - attach base64 data',
      sig: 'att.writeBase64(record, fileName, contentType, base64)', ret: 'string', params: { record: 'GlideRecord to attach to', fileName: 'File name', contentType: 'MIME type', base64: 'Base64-encoded content' } },
    { label: 'GlideSysAttachment.getContent',    type: 'method', detail: 'GlideSysAttachment - get attachment content as string',
      sig: 'att.getContent(sysId)', ret: 'string', params: { sysId: 'Attachment sys_id' } },
    { label: 'GlideSysAttachment.getContentBase64', type: 'method', detail: 'GlideSysAttachment - get content as base64',
      sig: 'att.getContentBase64(sysId)', ret: 'string', params: { sysId: 'Attachment sys_id' } },
    { label: 'GlideSysAttachment.copy',          type: 'method', detail: 'GlideSysAttachment - copy attachments between records',
      sig: 'att.copy(sourceTable, sourceId, targetTable, targetId)', ret: 'void', params: { sourceTable: 'Source table', sourceId: 'Source sys_id', targetTable: 'Target table', targetId: 'Target sys_id' } },
    { label: 'GlideSysAttachment.deleteAttachment', type: 'method', detail: 'GlideSysAttachment - delete an attachment',
      sig: 'att.deleteAttachment(sysId)', ret: 'void', params: { sysId: 'Attachment sys_id to delete' } },
    { label: 'GlideSysAttachment.getAttachments', type: 'method', detail: 'GlideSysAttachment - list attachments on a record',
      sig: 'att.getAttachments(tableName, sysId)', ret: 'GlideRecord', params: { tableName: 'Table name', sysId: 'Record sys_id' } },
    { label: 'GlideSysAttachment.writeContentStream', type: 'method', detail: 'GlideSysAttachment - attach from input stream',
      sig: 'att.writeContentStream(record, fileName, contentType, inputStream)', ret: 'string', params: { record: 'GlideRecord', fileName: 'File name', contentType: 'MIME type', inputStream: 'Java InputStream' } },

    // GlideFilter
    { label: 'GlideFilter.checkRecord',          type: 'method', detail: 'GlideFilter - test if record matches encoded query',
      sig: 'GlideFilter.checkRecord(gr, filter, matchAll?)', ret: 'boolean', params: { gr: 'GlideRecord to test', filter: 'Encoded query string', 'matchAll?': 'Boolean - true = AND, false = OR (default true)' } },

    // GlidePluginManager
    { label: 'GlidePluginManager',               type: 'class', detail: 'Server - check plugin activation status',
      sig: 'new GlidePluginManager()', ret: 'GlidePluginManager', params: null },
    { label: 'GlidePluginManager.isActive',      type: 'method', detail: 'GlidePluginManager - true if plugin is active',
      sig: 'pm.isActive(pluginId)', ret: 'boolean', params: { pluginId: 'Plugin ID string' } },

    // GlideSchedule
    { label: 'GlideSchedule',                    type: 'class', detail: 'Server - work with cmn_schedule records',
      sig: 'new GlideSchedule(sysId?, timeZone?)', ret: 'GlideSchedule', params: { 'sysId?': 'Schedule sys_id', 'timeZone?': 'Timezone name' } },
    { label: 'GlideSchedule.getName',            type: 'method', detail: 'GlideSchedule - schedule name',
      sig: 'sched.getName()', ret: 'string', params: null },
    { label: 'GlideSchedule.isInSchedule',       type: 'method', detail: 'GlideSchedule - true if datetime falls within schedule',
      sig: 'sched.isInSchedule(dateTime)', ret: 'boolean', params: { dateTime: 'GlideDateTime to check' } },
    { label: 'GlideSchedule.duration',           type: 'method', detail: 'GlideSchedule - working duration between two datetimes',
      sig: 'sched.duration(startDT, endDT)', ret: 'GlideDuration', params: { startDT: 'Start GlideDateTime', endDT: 'End GlideDateTime' } },
    { label: 'GlideSchedule.load',               type: 'method', detail: 'GlideSchedule - load a schedule by sys_id',
      sig: 'sched.load(sysId, timeZone?, excludeSpanId?)', ret: 'void', params: { sysId: 'Schedule sys_id', 'timeZone?': 'Timezone', 'excludeSpanId?': 'Span to exclude' } },
    { label: 'GlideSchedule.whenNext',           type: 'method', detail: 'GlideSchedule - next time the schedule is active after datetime',
      sig: 'sched.whenNext(dateTime, timeZone?)', ret: 'number', params: { dateTime: 'GlideDateTime', 'timeZone?': 'Timezone' } },
    { label: 'GlideSchedule.setTimeZone',        type: 'method', detail: 'GlideSchedule - set timezone for the schedule',
      sig: 'sched.setTimeZone(timeZone)', ret: 'void', params: { timeZone: 'Timezone name string' } },
    { label: 'GlideSchedule.isValid',            type: 'method', detail: 'GlideSchedule - true if schedule loaded successfully',
      sig: 'sched.isValid()', ret: 'boolean', params: null },

    // GlideEncrypter
    { label: 'GlideEncrypter',                   type: 'class', detail: 'Server - encrypt/decrypt strings',
      sig: 'new GlideEncrypter()', ret: 'GlideEncrypter', params: null },
    { label: 'GlideEncrypter.encrypt',           type: 'method', detail: 'GlideEncrypter - encrypt a string',
      sig: 'enc.encrypt(value)', ret: 'string', params: { value: 'String to encrypt' } },
    { label: 'GlideEncrypter.decrypt',           type: 'method', detail: 'GlideEncrypter - decrypt a string',
      sig: 'enc.decrypt(value)', ret: 'string', params: { value: 'Encrypted string to decrypt' } },

    // GlideSecurityUtils
    { label: 'GlideSecurityUtils.cleanURL',           type: 'method', detail: 'GlideSecurityUtils - sanitize a URL',
      sig: 'GlideSecurityUtils.cleanURL(url)', ret: 'string', params: { url: 'URL to sanitize' } },
    { label: 'GlideSecurityUtils.enforceRelativeURL', type: 'method', detail: 'GlideSecurityUtils - enforce relative URL (prevent open redirect)',
      sig: 'GlideSecurityUtils.enforceRelativeURL(url)', ret: 'string', params: { url: 'URL to make relative' } },
    { label: 'GlideSecurityUtils.escapeScript',       type: 'method', detail: 'GlideSecurityUtils - escape for script context',
      sig: 'GlideSecurityUtils.escapeScript(value)', ret: 'string', params: { value: 'String to escape' } },
    { label: 'GlideSecurityUtils.isURLWhiteListed',   type: 'method', detail: 'GlideSecurityUtils - check if URL is in whitelist',
      sig: 'GlideSecurityUtils.isURLWhiteListed(url)', ret: 'boolean', params: { url: 'URL to check' } },

    // GlideStringUtil
    { label: 'GlideStringUtil.dotToUnderBar',    type: 'method', detail: 'GlideStringUtil - replace dots with underscores',
      sig: 'GlideStringUtil.dotToUnderBar(str)', ret: 'string', params: { str: 'String to process' } },
    { label: 'GlideStringUtil.escapeHTML',       type: 'method', detail: 'GlideStringUtil - HTML-escape a string',
      sig: 'GlideStringUtil.escapeHTML(str)', ret: 'string', params: { str: 'String to escape' } },
    { label: 'GlideStringUtil.escapeNonPrintable', type: 'method', detail: 'GlideStringUtil - escape non-printable characters',
      sig: 'GlideStringUtil.escapeNonPrintable(str)', ret: 'string', params: { str: 'String to process' } },
    { label: 'GlideStringUtil.escapeQueryTermSeparator', type: 'method', detail: 'GlideStringUtil - escape ^ in encoded queries',
      sig: 'GlideStringUtil.escapeQueryTermSeparator(str)', ret: 'string', params: { str: 'String to escape' } },
    { label: 'GlideStringUtil.getHTMLValue',     type: 'method', detail: 'GlideStringUtil - convert to HTML entities',
      sig: 'GlideStringUtil.getHTMLValue(str)', ret: 'string', params: { str: 'String to convert' } },
    { label: 'GlideStringUtil.getNumeric',       type: 'method', detail: 'GlideStringUtil - extract numeric characters',
      sig: 'GlideStringUtil.getNumeric(str)', ret: 'string', params: { str: 'String to extract numbers from' } },
    { label: 'GlideStringUtil.isBase64',         type: 'method', detail: 'GlideStringUtil - true if string is valid base64',
      sig: 'GlideStringUtil.isBase64(str)', ret: 'boolean', params: { str: 'String to check' } },
    { label: 'GlideStringUtil.isEligibleSysID',  type: 'method', detail: 'GlideStringUtil - true if string is a valid 32-char sys_id',
      sig: 'GlideStringUtil.isEligibleSysID(str)', ret: 'boolean', params: { str: 'String to check' } },
    { label: 'GlideStringUtil.newLinesToBreaks',  type: 'method', detail: 'GlideStringUtil - convert newlines to <br/>',
      sig: 'GlideStringUtil.newLinesToBreaks(str)', ret: 'string', params: { str: 'String to convert' } },
    { label: 'GlideStringUtil.unescapeHTML',     type: 'method', detail: 'GlideStringUtil - unescape HTML entities',
      sig: 'GlideStringUtil.unescapeHTML(str)', ret: 'string', params: { str: 'String to unescape' } },

    // GlideTableHierarchy
    { label: 'GlideTableHierarchy',              type: 'class', detail: 'Server - navigate table hierarchy',
      sig: 'new GlideTableHierarchy(tableName)', ret: 'GlideTableHierarchy', params: { tableName: 'Table name' } },
    { label: 'GlideTableHierarchy.getTables',    type: 'method', detail: 'GlideTableHierarchy - get all tables in hierarchy (self + parents)',
      sig: 'th.getTables()', ret: 'string[]', params: null },
    { label: 'GlideTableHierarchy.getTableExtensions', type: 'method', detail: 'GlideTableHierarchy - get child/extension tables',
      sig: 'th.getTableExtensions()', ret: 'string[]', params: null },
    { label: 'GlideTableHierarchy.getAllExtensions', type: 'method', detail: 'GlideTableHierarchy - get all descendant tables',
      sig: 'th.getAllExtensions()', ret: 'string[]', params: null },
    { label: 'GlideTableHierarchy.getName',      type: 'method', detail: 'GlideTableHierarchy - get table name',
      sig: 'th.getName()', ret: 'string', params: null },
    { label: 'GlideTableHierarchy.getRoot',      type: 'method', detail: 'GlideTableHierarchy - get root table of hierarchy',
      sig: 'th.getRoot()', ret: 'string', params: null },
    { label: 'GlideTableHierarchy.getBase',      type: 'method', detail: 'GlideTableHierarchy - get direct parent table',
      sig: 'th.getBase()', ret: 'string', params: null },
    { label: 'GlideTableHierarchy.isBaseClass',  type: 'method', detail: 'GlideTableHierarchy - true if this is the root',
      sig: 'th.isBaseClass()', ret: 'boolean', params: null },
    { label: 'GlideTableHierarchy.isSoloClass',  type: 'method', detail: 'GlideTableHierarchy - true if no extensions',
      sig: 'th.isSoloClass()', ret: 'boolean', params: null },
    { label: 'GlideTableHierarchy.hasExtensions', type: 'method', detail: 'GlideTableHierarchy - true if table has child tables',
      sig: 'th.hasExtensions()', ret: 'boolean', params: null },

    // GlideScopedEvaluator
    { label: 'GlideScopedEvaluator',             type: 'class', detail: 'Server - evaluate script in a specific scope',
      sig: 'new GlideScopedEvaluator()', ret: 'GlideScopedEvaluator', params: null },
    { label: 'GlideScopedEvaluator.evaluateScript', type: 'method', detail: 'GlideScopedEvaluator - evaluate script from a record field',
      sig: 'ev.evaluateScript(gr, scriptField, variables?)', ret: 'Object', params: { gr: 'GlideRecord containing the script', scriptField: 'Field name holding the script', 'variables?': 'Object of variables to inject' } },
    { label: 'GlideScopedEvaluator.getVariable', type: 'method', detail: 'GlideScopedEvaluator - get variable set during evaluation',
      sig: 'ev.getVariable(name)', ret: 'Object', params: { name: 'Variable name' } },
    { label: 'GlideScopedEvaluator.putVariable', type: 'method', detail: 'GlideScopedEvaluator - set variable before evaluation',
      sig: 'ev.putVariable(name, value)', ret: 'void', params: { name: 'Variable name', value: 'Value to set' } },

];


// HTML tags for template completion (component script only)
const _AC_HTML_TAGS = [
    // Structural / Layout
    { name: 'div',        void: false, detail: 'generic block container' },
    { name: 'span',       void: false, detail: 'generic inline container' },
    { name: 'section',    void: false, detail: 'thematic section' },
    { name: 'article',    void: false, detail: 'self-contained content' },
    { name: 'aside',      void: false, detail: 'sidebar / tangential content' },
    { name: 'header',     void: false, detail: 'page or section header' },
    { name: 'footer',     void: false, detail: 'page or section footer' },
    { name: 'main',       void: false, detail: 'main document content' },
    { name: 'nav',        void: false, detail: 'navigation links' },
    { name: 'figure',     void: false, detail: 'figure with optional caption' },
    { name: 'figcaption', void: false, detail: 'caption for a figure' },
    { name: 'details',    void: false, detail: 'disclosure / expand widget' },
    { name: 'summary',    void: false, detail: 'visible label for <details>' },
    { name: 'dialog',     void: false, detail: 'modal or non-modal dialog' },
    { name: 'slot',       void: false, detail: 'shadow DOM slot' },
    // Headings
    { name: 'h1', void: false, detail: 'heading level 1' },
    { name: 'h2', void: false, detail: 'heading level 2' },
    { name: 'h3', void: false, detail: 'heading level 3' },
    { name: 'h4', void: false, detail: 'heading level 4' },
    { name: 'h5', void: false, detail: 'heading level 5' },
    { name: 'h6', void: false, detail: 'heading level 6' },
    // Text
    { name: 'p',          void: false, detail: 'paragraph' },
    { name: 'a',          void: false, detail: 'hyperlink' },
    { name: 'strong',     void: false, detail: 'strong importance (bold)' },
    { name: 'em',         void: false, detail: 'emphasis (italic)' },
    { name: 'small',      void: false, detail: 'small print' },
    { name: 'mark',       void: false, detail: 'highlighted text' },
    { name: 'code',       void: false, detail: 'inline code snippet' },
    { name: 'pre',        void: false, detail: 'preformatted text block' },
    { name: 'blockquote', void: false, detail: 'block quotation' },
    { name: 'abbr',       void: false, detail: 'abbreviation' },
    { name: 'time',       void: false, detail: 'time / date' },
    { name: 'label',      void: false, detail: 'label for a form element' },
    { name: 'sub',        void: false, detail: 'subscript' },
    { name: 'sup',        void: false, detail: 'superscript' },
    // Lists
    { name: 'ul', void: false, detail: 'unordered list' },
    { name: 'ol', void: false, detail: 'ordered list' },
    { name: 'li', void: false, detail: 'list item' },
    { name: 'dl', void: false, detail: 'description list' },
    { name: 'dt', void: false, detail: 'description term' },
    { name: 'dd', void: false, detail: 'description details' },
    // Table
    { name: 'table',    void: false, detail: 'table' },
    { name: 'thead',    void: false, detail: 'table header group' },
    { name: 'tbody',    void: false, detail: 'table body group' },
    { name: 'tfoot',    void: false, detail: 'table footer group' },
    { name: 'tr',       void: false, detail: 'table row' },
    { name: 'th',       void: false, detail: 'table header cell' },
    { name: 'td',       void: false, detail: 'table data cell' },
    { name: 'caption',  void: false, detail: 'table caption' },
    // Forms
    { name: 'form',     void: false, detail: 'form element' },
    { name: 'button',   void: false, detail: 'button' },
    { name: 'textarea', void: false, detail: 'multi-line text input' },
    { name: 'select',   void: false, detail: 'dropdown select' },
    { name: 'option',   void: false, detail: 'select option' },
    { name: 'optgroup', void: false, detail: 'option group' },
    { name: 'fieldset', void: false, detail: 'field group with border' },
    { name: 'legend',   void: false, detail: 'fieldset caption' },
    { name: 'datalist', void: false, detail: 'input autocomplete list' },
    { name: 'output',   void: false, detail: 'form calculation output' },
    { name: 'progress', void: false, detail: 'progress bar' },
    { name: 'meter',    void: false, detail: 'scalar measurement gauge' },
    // Void / self-closing
    { name: 'input',  void: true,  detail: 'form input (void)' },
    { name: 'img',    void: true,  detail: 'image (void)' },
    { name: 'br',     void: true,  detail: 'line break (void)' },
    { name: 'hr',     void: true,  detail: 'horizontal rule / thematic break (void)' },
    { name: 'source', void: true,  detail: 'media source (void)' },
    { name: 'track',  void: true,  detail: 'text track for media (void)' },
    { name: 'wbr',    void: true,  detail: 'word break opportunity (void)' },
    // Media / Embeds
    { name: 'video',   void: false, detail: 'video player' },
    { name: 'audio',   void: false, detail: 'audio player' },
    { name: 'iframe',  void: false, detail: 'inline frame' },
    { name: 'canvas',  void: false, detail: 'canvas drawing surface' },
    { name: 'svg',     void: false, detail: 'SVG container' },
    { name: 'picture', void: false, detail: 'responsive image container' },
];

// Pre-built arrays for client vs server mode
const _AC_CLIENT_ALL = [].concat(_AC_LIT, _AC_UXKIT, _AC_SERVICES, _AC_SVCMETHODS, _AC_SHORTCUTS, _AC_INSTANCE, _AC_LIFECYCLE, _AC_STATICS, _AC_DIRECTIVES, _AC_BASE_COMPONENTS);
const _AC_SERVER_ALL = _AC_SERVER;

// ---------------------------------------------------------------------------
// Hover tooltip map
// ---------------------------------------------------------------------------
const _HOVER_MAP = {};
function _buildHoverMap(items) {
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item.sig) continue;
        _HOVER_MAP[item.label] = item;
        // Also index by short name after dot (e.g. "getMessage" -> i18n.getMessage entry)
        const dotIdx = item.label.indexOf('.');
        if (dotIdx > -1) {
            const shortName = item.label.substring(dotIdx + 1);
            if (!_HOVER_MAP[shortName]) {
                _HOVER_MAP[shortName] = item;
            }
        }
    }
}
_buildHoverMap(_AC_CLIENT_ALL);
_buildHoverMap(_AC_SERVER_ALL);

// ---------------------------------------------------------------------------
// Tooltip DOM builder
// ---------------------------------------------------------------------------
function _buildTooltipDOM(item) {
    const container = document.createElement('div');
    container.className = 'sig-tooltip';

    // Signature line
    const sigLine = document.createElement('div');
    sigLine.className = 'sig-line';
    // Parse signature: name(params) or just name
    const raw = item.sig || item.label;
    const parenOpen = raw.indexOf('(');
    if (parenOpen > -1) {
        const parenClose = raw.lastIndexOf(')');
        const funcName = raw.substring(0, parenOpen);
        const paramStr = raw.substring(parenOpen + 1, parenClose > -1 ? parenClose : raw.length);

        const nameSpan = document.createElement('span');
        nameSpan.className = 'sig-name';
        nameSpan.textContent = funcName;
        sigLine.appendChild(nameSpan);

        const openParen = document.createElement('span');
        openParen.className = 'sig-paren';
        openParen.textContent = '(';
        sigLine.appendChild(openParen);

        if (paramStr) {
            const params = paramStr.split(',');
            for (let i = 0; i < params.length; i++) {
                if (i > 0) {
                    const sep = document.createElement('span');
                    sep.className = 'sig-sep';
                    sep.textContent = ', ';
                    sigLine.appendChild(sep);
                }
                const pSpan = document.createElement('span');
                const pText = params[i].trim();
                pSpan.className = pText.indexOf('?') > -1 ? 'sig-param-opt' : 'sig-param';
                pSpan.textContent = pText;
                sigLine.appendChild(pSpan);
            }
        }

        const closeParen = document.createElement('span');
        closeParen.className = 'sig-paren';
        closeParen.textContent = ')';
        sigLine.appendChild(closeParen);
    } else {
        const nameOnly = document.createElement('span');
        nameOnly.className = 'sig-name';
        nameOnly.textContent = raw;
        sigLine.appendChild(nameOnly);
    }

    // Return type
    if (item.ret) {
        const retSpan = document.createElement('span');
        retSpan.className = 'sig-return';
        retSpan.textContent = ': ' + item.ret;
        sigLine.appendChild(retSpan);
    }

    container.appendChild(sigLine);

    // Description
    if (item.detail) {
        const descDiv = document.createElement('div');
        descDiv.className = 'sig-desc';
        descDiv.textContent = item.detail;
        container.appendChild(descDiv);
    }

    // Parameters
    if (item.params) {
        const paramList = document.createElement('div');
        paramList.className = 'sig-params-list';
        const keys = Object.keys(item.params);
        for (let paramIdx = 0; paramIdx < keys.length; paramIdx++) {
            const pDiv = document.createElement('div');
            const pName = document.createElement('span');
            pName.className = 'sig-param';
            pName.textContent = keys[paramIdx];
            pDiv.appendChild(pName);
            const pDesc = document.createElement('span');
            pDesc.textContent = ' \u2014 ' + item.params[keys[paramIdx]];
            pDiv.appendChild(pDesc);
            paramList.appendChild(pDiv);
        }
        container.appendChild(paramList);
    }

    return container;
}

// ---------------------------------------------------------------------------
// Signature help - parameter hints inside parentheses
// ---------------------------------------------------------------------------

/**
 * Scan backward from cursor to find the matching '(' and extract the function
 * name. Returns null if cursor is not inside a function call.
 */
function _getSignatureContext(state) {
    const pos = state.selection.main.head;
    const doc = state.doc;
    const text = doc.sliceString(0, pos);

    // Walk backwards counting parens to find the unmatched '('
    let depth = 0;
    let commas = 0;
    let openPos = -1;
    for (let i = text.length - 1; i >= 0; i--) {
        const ch = text.charAt(i);
        if (ch === ')') { depth++; }
        else if (ch === '(') {
            if (depth === 0) { openPos = i; break; }
            depth--;
        }
        else if (ch === ',' && depth === 0) { commas++; }
    }
    if (openPos < 0) return null;

    // Extract function name before '(' -- may be dotted like "i18n.getMessage"
    const before = text.substring(0, openPos);
    let nameStart = openPos - 1;
    while (nameStart >= 0) {
        const c = before.charCodeAt(nameStart);
        // [a-zA-Z0-9_.$]
        if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122) || (c >= 48 && c <= 57) || c === 95 || c === 46 || c === 36) {
            nameStart--;
        } else {
            break;
        }
    }
    nameStart++;
    const funcName = before.substring(nameStart);
    if (!funcName) return null;

    const item = _HOVER_MAP[funcName];
    if (!item || !item.sig) return null;

    return { item: item, activeParam: commas, openPos: openPos };
}

/**
 * Build tooltip DOM with active parameter highlighted.
 */
function _buildSignatureHelpDOM(item, activeParam) {
    const container = document.createElement('div');
    container.className = 'sig-tooltip sig-help';

    // Signature line with active param highlighted
    const sigLine = document.createElement('div');
    sigLine.className = 'sig-line';
    const raw = item.sig || item.label;
    const parenOpen = raw.indexOf('(');
    if (parenOpen > -1) {
        const parenClose = raw.lastIndexOf(')');
        const funcName = raw.substring(0, parenOpen);
        const paramStr = raw.substring(parenOpen + 1, parenClose > -1 ? parenClose : raw.length);

        const nameSpan = document.createElement('span');
        nameSpan.className = 'sig-name';
        nameSpan.textContent = funcName;
        sigLine.appendChild(nameSpan);

        const openP = document.createElement('span');
        openP.className = 'sig-paren';
        openP.textContent = '(';
        sigLine.appendChild(openP);

        if (paramStr) {
            const params = paramStr.split(',');
            for (let i = 0; i < params.length; i++) {
                if (i > 0) {
                    const sep = document.createElement('span');
                    sep.className = 'sig-sep';
                    sep.textContent = ', ';
                    sigLine.appendChild(sep);
                }
                const pSpan = document.createElement('span');
                const pText = params[i].trim();
                // Highlight active parameter
                if (i === activeParam) {
                    pSpan.className = 'sig-param-active';
                } else {
                    pSpan.className = pText.indexOf('?') > -1 ? 'sig-param-opt' : 'sig-param';
                }
                pSpan.textContent = pText;
                sigLine.appendChild(pSpan);
            }
        }

        const closeP = document.createElement('span');
        closeP.className = 'sig-paren';
        closeP.textContent = ')';
        sigLine.appendChild(closeP);
    }

    // Return type
    if (item.ret) {
        const retSpan = document.createElement('span');
        retSpan.className = 'sig-return';
        retSpan.textContent = ': ' + item.ret;
        sigLine.appendChild(retSpan);
    }
    container.appendChild(sigLine);

    // Show only the active parameter's description
    if (item.params) {
        const keys = Object.keys(item.params);
        if (activeParam < keys.length) {
            const paramDesc = document.createElement('div');
            paramDesc.className = 'sig-active-desc';
            const pName = document.createElement('span');
            pName.className = 'sig-param-active';
            pName.textContent = keys[activeParam];
            paramDesc.appendChild(pName);
            const pText = document.createElement('span');
            pText.textContent = ' \u2014 ' + item.params[keys[activeParam]];
            paramDesc.appendChild(pText);
            container.appendChild(paramDesc);
        }
    }

    return container;
}

/**
 * Create the CM6 StateField extension for signature help.
 * Returns [StateField, keymap] so Escape dismisses the tooltip.
 * Falls back to just the StateField if StateEffect or keymap are unavailable.
 */
function _createSignatureHelpField(cm) {
    if (!cm || !cm.StateField || !cm.showTooltip) return null;

    var hasEscSupport = !!(cm.StateEffect && cm.keymap);

    if (!hasEscSupport) {
        return cm.StateField?.define?.({
            create: function() { return null; },
            update: function(value, tr) {
                if (!tr.docChanged && !tr.selection) return value;
                return _getSignatureContext(tr.state);
            },
            provide: function(field) {
                return cm.showTooltip.compute([field], function(state) {
                    var ctx = state.field(field);
                    if (!ctx) return null;
                    return {
                        pos: ctx.openPos,
                        above: true,
                        strictSide: true,
                        create: function() {
                            return { dom: _buildSignatureHelpDOM(ctx.item, ctx.activeParam) };
                        }
                    };
                });
            }
        });
    }

    var dismissEffect = cm.StateEffect.define();

    var field = cm.StateField.define({
        create: function() { return { ctx: null, dismissed: false }; },
        update: function(value, tr) {
            for (var i = 0; i < tr.effects.length; i++) {
                if (tr.effects[i].is(dismissEffect)) {
                    return { ctx: value.ctx, dismissed: true };
                }
            }
            if (!tr.docChanged && !tr.selection) return value;
            return { ctx: _getSignatureContext(tr.state), dismissed: false };
        },
        provide: function(f) {
            return cm.showTooltip.compute([f], function(state) {
                var val = state.field(f);
                if (!val || !val.ctx || val.dismissed) return null;
                var ctx = val.ctx;
                return {
                    pos: ctx.openPos,
                    above: true,
                    strictSide: true,
                    create: function() {
                        return { dom: _buildSignatureHelpDOM(ctx.item, ctx.activeParam) };
                    }
                };
            });
        }
    });

    // Escape dismisses the tooltip; return false so the completion
    // keymap also gets to close the suggestion dropdown.
    var keymap = cm.keymap.of([{
        key: 'Escape',
        run: function(view) {
            view.dispatch({ effects: dismissEffect.of(null) });
            return false;
        }
    }]);

    return [field, keymap];
}

// ---------------------------------------------------------------------------
// Auto-import helper -- returns a change spec (or null) instead of dispatching
// ---------------------------------------------------------------------------
function _acGetImportChange(doc, identifier, modulePath) {
    const lines = doc.split('\n');
    // Check if already imported
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.indexOf('import') === 0 && line.indexOf(modulePath) > -1 && line.indexOf(identifier) > -1) {
            return null; // already imported
        }
    }
    // Try to append to existing import from same module
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.indexOf('import') === 0 && line.indexOf(modulePath) > -1) {
            const closeBrace = line.indexOf('}');
            if (closeBrace > -1) {
                let offset = 0;
                for (let lineIdx = 0; lineIdx < i; lineIdx++) { offset += lines[lineIdx].length + 1; }
                offset += closeBrace;
                return { from: offset, to: offset, insert: ', ' + identifier };
            }
        }
    }
    // Insert new import line at top
    const insertLine = "import { " + identifier + " } from '" + modulePath + "';\n";
    return { from: 0, to: 0, insert: insertLine };
}

// Side-effect import helper -- generates: import '@servicenow/glide-widgets/<scope>/<widget-id>';
// - scope=undefined (base components): defaults to 'sn_aiux_components'
// - scope='' (instance widget with unknown scope): skips injection, user must add import manually
function _acGetSideEffectImportChange(doc, moduleName, scope) {
    // Instance widget with no scope info — can't construct a valid path, skip
    if (scope === '') return null;

    const lines = doc.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].indexOf('import') === 0 && lines[i].indexOf(moduleName) > -1) {
            return null; // already imported
        }
    }
    const resolvedScope = scope || 'sn_aiux_components';
    const stmt = 'imp' + "ort '@servicenow/glide-widgets/" + resolvedScope + '/' + moduleName + "';\n";
    return { from: 0, to: 0, insert: stmt };
}

// Detect if cursor is inside an unclosed opening custom element tag (contains a hyphen)
// Only scans the last 1000 characters for performance with large documents
function _detectOpenTag(text) {
    const scanStart = text.length > 1000 ? text.length - 1000 : 0;
    let lastOpen = -1;
    let lastClose = -1;
    
    // Find last < and last >
    for (let i = text.length - 1; i >= scanStart; i--) {
        const ch = text.charAt(i);
        if (ch === '>' && lastClose < 0) lastClose = i;
        if (ch === '<') { lastOpen = i; break; }
    }
    
    // No opening tag found
    if (lastOpen < 0) return null;
    
    // If we found a closing > after the last <, we're not inside a tag
    if (lastClose > lastOpen) return null;
    
    const after = text.substring(lastOpen + 1);
    // Skip closing tags
    if (after.charAt(0) === '/') return null;
    
    // Extract tag name (everything before first whitespace)
    let nameEnd = 0;
    for (let nameCharIdx = 0; nameCharIdx < after.length; nameCharIdx++) {
        const nameChar = after.charAt(nameCharIdx);
        if (nameChar === ' ' || nameChar === '\t' || nameChar === '\n' || nameChar === '\r' || nameChar === '/' || nameChar === '>') { 
            nameEnd = nameCharIdx; 
            break; 
        }
    }
    if (nameEnd === 0) nameEnd = after.length;
    
    const tagName = after.substring(0, nameEnd);
    // Custom elements must contain a hyphen
    if (tagName.indexOf('-') < 0) return null;
    return tagName;
}

// In-tag prop completion source (supports both static and dynamic props)
function _acGetPropCompletions(context, tagName, dynamicProps) {
    const word = context.matchBefore(/[\w.$-]+/);
    const typed = word ? context.state.doc.sliceString(word.from, word.to) : '';
    if (typed.charAt(0) === '-') return null;
    const typedLower = typed.toLowerCase();
    const from = word ? word.from : context.pos;

    // Extract text inside the tag to find already-used properties
    // Only look back 1000 chars for performance
    const lookBack = Math.max(0, context.pos - 1000);
    const textBefore = context.state.doc.sliceString(lookBack, context.pos);
    const tagStart = textBefore.lastIndexOf('<');
    const tagContent = tagStart >= 0 ? textBefore.substring(tagStart) : '';
    const usedProps = {};
    // Match .propName= or propName= or ?propName or @eventName patterns
    for (let charIdx = 0; charIdx < tagContent.length; charIdx++) {
        const currentChar = tagContent.charAt(charIdx);
        if (currentChar === '.' || currentChar === '?' || currentChar === '@') {
            let propName = '';
            for (let propCharIdx = charIdx + 1; propCharIdx < tagContent.length; propCharIdx++) {
                const propChar = tagContent.charAt(propCharIdx);
                if ((propChar >= 'a' && propChar <= 'z') || (propChar >= 'A' && propChar <= 'Z') || (propChar >= '0' && propChar <= '9') || propChar === '-' || propChar === '_') {
                    propName += propChar;
                } else break;
            }
            if (propName) usedProps[currentChar + propName] = 1;
        } else if ((currentChar >= 'a' && currentChar <= 'z') || (currentChar >= 'A' && currentChar <= 'Z')) {
            // bare attribute like name= or size=
            let attrName = '';
            let attrCharIdx;
            for (attrCharIdx = charIdx; attrCharIdx < tagContent.length; attrCharIdx++) {
                const attrChar = tagContent.charAt(attrCharIdx);
                if ((attrChar >= 'a' && attrChar <= 'z') || (attrChar >= 'A' && attrChar <= 'Z') || (attrChar >= '0' && attrChar <= '9') || attrChar === '-' || attrChar === '_') {
                    attrName += attrChar;
                } else break;
            }
            if (attrName && attrCharIdx < tagContent.length && tagContent.charAt(attrCharIdx) === '=') {
                usedProps[attrName] = 1;
            }
        }
    }

    const options = [];
    // Static props from _AC_COMPONENT_PROPS_MAP
    const staticProps = _AC_COMPONENT_PROPS_MAP[tagName];
    if (staticProps) {
        for (let i = 0; i < staticProps.length; i++) {
            const prop = staticProps[i];
            // Skip already-used properties
            if (usedProps[prop.label]) continue;
            const propLabelLower = prop.label.toLowerCase();
            let boost = 0;
            if (!typed || propLabelLower === typedLower) { boost = 100; }
            else if (propLabelLower.indexOf(typedLower) === 0) { boost = 10; }
            else if (propLabelLower.indexOf(typedLower) > 0) { boost = 5; }
            if (typed && boost === 0) continue;
            options.push({ label: prop.label, type: prop.type, detail: prop.detail, boost: boost || 1 });
        }
    }
    // Dynamic props from instance widget input_schema
    if (dynamicProps) {
        const keys = Object.keys(dynamicProps);
        for (let keyIdx = 0; keyIdx < keys.length; keyIdx++) {
            const key = keys[keyIdx];
            const dotLabel = '.' + key;
            // Skip already-used properties
            if (usedProps[dotLabel]) continue;
            const propType = dynamicProps[key].type || 'unknown';
            const dotLabelLower = dotLabel.toLowerCase();
            let dynBoost = 0;
            if (!typed || dotLabelLower === typedLower) { dynBoost = 100; }
            else if (dotLabelLower.indexOf(typedLower) === 0) { dynBoost = 10; }
            else if (dotLabelLower.indexOf(typedLower) > 0 || key.toLowerCase().indexOf(typedLower) === 0) { dynBoost = 5; }
            if (typed && dynBoost === 0) continue;
            options.push({ label: dotLabel, type: 'property', detail: propType + ' - ' + tagName + ' input', boost: dynBoost || 1 });
        }
    }
    if (options.length === 0) return null;
    return { from: from, options: options };
}

// ---------------------------------------------------------------------------
// Extract user-defined symbols from the document
// ---------------------------------------------------------------------------
function _extractUserSymbols(doc, cursorLine) {
    let lines = doc.split('\n');
    // Cap at 5000 lines for performance with very large documents
    if (lines.length > 5000) lines = lines.slice(0, 5000);
    const seen = {};
    const symbols = [];
    // Keywords and built-ins to skip
    const skip = { 'if':1,'else':1,'for':1,'while':1,'do':1,'switch':1,'case':1,'break':1,
        'continue':1,'return':1,'try':1,'catch':1,'finally':1,'throw':1,'new':1,'delete':1,
        'typeof':1,'instanceof':1,'void':1,'in':1,'of':1,'true':1,'false':1,'null':1,
        'undefined':1,'this':1,'super':1,'class':1,'extends':1,'import':1,'export':1,
        'default':1,'from':1,'as':1,'async':1,'await':1,'yield':1,'let':1,'const':1,
        'var':1,'function':1,'static':1,'get':1,'set':1,'constructor':1,'with':1,
        'debugger':1,'html':1,'css':1,'nothing':1,'render':1 };
    let inClass = false;
    let inStaticProps = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.replace(/^\s+/, '');
        if (!trimmed || trimmed.charAt(0) === '/' || trimmed.charAt(0) === '*') continue;

        // Inside static properties block -- extract each key
        if (inStaticProps) {
            // End of block
            if (trimmed.indexOf('};') === 0 || trimmed === '}') { inStaticProps = false; continue; }
            // Extract property name: "greeting: { type: String }" or "count: { type: Number, state: true }"
            const colonIdx = trimmed.indexOf(':');
            if (colonIdx > 0) {
                let propName = '';
                for (let propIdx = 0; propIdx < colonIdx; propIdx++) {
                    const propChar = trimmed.charAt(propIdx);
                    if ((propChar >= 'a' && propChar <= 'z') || (propChar >= 'A' && propChar <= 'Z') || (propChar >= '0' && propChar <= '9') || propChar === '_' || propChar === '$') {
                        propName += propChar;
                    } else if (propChar === ' ' || propChar === '\t') {
                        continue;
                    } else break;
                }
                if (propName && !skip[propName] && !seen[propName]) {
                    seen[propName] = 1;
                    // Extract type hint from { type: String } etc
                    const afterColon = trimmed.substring(colonIdx + 1);
                    let typeHint = '';
                    let typeIdx = afterColon.indexOf('type:');
                    if (typeIdx === -1) typeIdx = afterColon.indexOf('type :');
                    if (typeIdx > -1) {
                        const typeStart = afterColon.indexOf(':', typeIdx) + 1;
                        let typeValue = '';
                        for (let typeCharIdx = typeStart; typeCharIdx < afterColon.length; typeCharIdx++) {
                            const typeChar = afterColon.charAt(typeCharIdx);
                            if (typeChar === ',' || typeChar === '}') break;
                            if (typeChar !== ' ') typeValue += typeChar;
                        }
                        if (typeValue) typeHint = ' (' + typeValue + ')';
                    }
                    const isState = afterColon.indexOf('state:') > -1 && afterColon.indexOf('true') > afterColon.indexOf('state:');
                    const propDetail = isState ? 'user state' + typeHint : 'user property' + typeHint;
                    symbols.push({ label: 'this.' + propName, type: 'property', detail: propDetail });
                }
            }
            continue;
        }

        // Detect static properties = {
        if (inClass && (trimmed.indexOf('static properties') === 0 || trimmed.indexOf('static get properties') === 0)) {
            if (trimmed.indexOf('{') > -1) { inStaticProps = true; }
            continue;
        }

        // Detect class declaration
        if (trimmed.indexOf('class ') === 0) {
            const rest = trimmed.substring(6);
            let clsName = '';
            for (let clsIdx = 0; clsIdx < rest.length; clsIdx++) {
                const clsChar = rest.charAt(clsIdx);
                if ((clsChar >= 'a' && clsChar <= 'z') || (clsChar >= 'A' && clsChar <= 'Z') || (clsChar >= '0' && clsChar <= '9') || clsChar === '_' || clsChar === '$') {
                    clsName += clsChar;
                } else break;
            }
            if (clsName && !skip[clsName] && !seen[clsName]) {
                seen[clsName] = 1;
                symbols.push({ label: clsName, type: 'class', detail: 'user class' });
            }
            inClass = true;
            continue;
        }

        // const / let / var declarations
        let declIdx = -1;
        let declLen = 0;
        if (trimmed.indexOf('const ') === 0) { declIdx = 0; declLen = 6; }
        else if (trimmed.indexOf('let ') === 0) { declIdx = 0; declLen = 4; }
        else if (trimmed.indexOf('var ') === 0) { declIdx = 0; declLen = 4; }
        if (declIdx === 0) {
            const varRest = trimmed.substring(declLen);
            let varName = '';
            for (let varIdx = 0; varIdx < varRest.length; varIdx++) {
                const varChar = varRest.charAt(varIdx);
                if ((varChar >= 'a' && varChar <= 'z') || (varChar >= 'A' && varChar <= 'Z') || (varChar >= '0' && varChar <= '9') || varChar === '_' || varChar === '$') {
                    varName += varChar;
                } else break;
            }
            if (varName && !skip[varName] && !seen[varName]) {
                seen[varName] = 1;
                // Check if it is a function/arrow
                const isFunc = varRest.indexOf('=>') > -1 || varRest.indexOf('function') > -1;
                symbols.push({ label: varName, type: isFunc ? 'function' : 'variable', detail: 'user ' + (isFunc ? 'function' : 'variable') });
            }
            continue;
        }

        // function declarations
        if (trimmed.indexOf('function ') === 0) {
            const fnRest = trimmed.substring(9);
            let fnName = '';
            for (let fnIdx = 0; fnIdx < fnRest.length; fnIdx++) {
                const fnChar = fnRest.charAt(fnIdx);
                if ((fnChar >= 'a' && fnChar <= 'z') || (fnChar >= 'A' && fnChar <= 'Z') || (fnChar >= '0' && fnChar <= '9') || fnChar === '_' || fnChar === '$') {
                    fnName += fnChar;
                } else break;
            }
            if (fnName && !skip[fnName] && !seen[fnName]) {
                seen[fnName] = 1;
                symbols.push({ label: fnName, type: 'function', detail: 'user function' });
            }
            continue;
        }

        // Class methods: indented identifier followed by (
        if (inClass) {
            // Skip lines that are assignments or not method-like
            if (trimmed.indexOf('=') > -1 && trimmed.indexOf('(') === -1) continue;
            if (trimmed.indexOf('this.') === 0) continue;
            let methodName = '';
            let methodIdx = 0;
            // Handle async methods
            if (trimmed.indexOf('async ') === 0) { methodIdx = 6; }
            for (; methodIdx < trimmed.length; methodIdx++) {
                const methodChar = trimmed.charAt(methodIdx);
                if ((methodChar >= 'a' && methodChar <= 'z') || (methodChar >= 'A' && methodChar <= 'Z') || (methodChar >= '0' && methodChar <= '9') || methodChar === '_' || methodChar === '$') {
                    methodName += methodChar;
                } else break;
            }
            // Must be followed by ( to be a method
            if (methodName && methodIdx < trimmed.length && trimmed.charAt(methodIdx) === '(' && !skip[methodName] && !seen[methodName]) {
                seen[methodName] = 1;
                // Add both this.method and bare method name for flexible matching
                symbols.push({ label: 'this.' + methodName, type: 'method', detail: 'user method' });
                symbols.push({ label: methodName, type: 'method', detail: 'user method' });
            }
        }
    }
    return symbols;
}

// ---------------------------------------------------------------------------
// Completion source
// ---------------------------------------------------------------------------
function _isInsideString(context) {
    const line = context.state.doc.lineAt(context.pos);
    const text = line.text;
    const linePos = context.pos - line.from;
    let inDouble = false, inSingle = false;
    for (let i = 0; i < linePos; i++) {
        const ch = text.charAt(i);
        if (ch === '\\') { i++; continue; }
        if (!inDouble && !inSingle) {
            if (ch === '"') inDouble = true;
            else if (ch === "'") inSingle = true;
        } else if (inDouble && ch === '"') {
            inDouble = false;
        } else if (inSingle && ch === "'") {
            inSingle = false;
        }
    }
    return inDouble || inSingle;
}

function _aixCompletionSource(context, isServerScript, instanceWidgets) {
    if (_isInsideString(context)) return null;
    try {
    // If cursor is inside an opening custom element tag, surface property completions
    if (!isServerScript) {
        const lookBack = Math.max(0, context.pos - 1000);
        const textBefore = context.state.doc.sliceString(lookBack, context.pos);
        const detectedTag = _detectOpenTag(textBefore);
        if (detectedTag) {
            let dynProps = null;
            if (instanceWidgets && instanceWidgets.length > 0) {
                for (let widgetIdx = 0; widgetIdx < instanceWidgets.length; widgetIdx++) {
                    if (instanceWidgets[widgetIdx].id === detectedTag) {
                        dynProps = instanceWidgets[widgetIdx].props;
                        break;
                    }
                }
            }
            if (_AC_COMPONENT_PROPS_MAP[detectedTag] || dynProps) {
                return _acGetPropCompletions(context, detectedTag, dynProps);
            }
        }
    }

    // HTML tag completion: triggered by <tagname inside component scripts
    if (!isServerScript) {
        const scanBack = Math.max(0, context.pos - 100);
        const preCursor = context.state.doc.sliceString(scanBack, context.pos);
        const htmlTagRe = preCursor.match(/<[a-zA-Z][a-zA-Z0-9-]*$/);
        if (htmlTagRe) {
            const matchFrom = context.pos - htmlTagRe[0].length;
            const partial = htmlTagRe[0].slice(1).toLowerCase();
            const tagOpts = [];
            for (var tagIdx = 0; tagIdx < _AC_HTML_TAGS.length; tagIdx++) {
                const tag = _AC_HTML_TAGS[tagIdx];
                if (tag.name.indexOf(partial) !== 0) continue;
                const openTag = '<' + tag.name + '>';
                const insert = tag.void ? '<' + tag.name + ' />' : openTag + '</' + tag.name + '>';
                const cursorOffset = tag.void ? insert.length : openTag.length; // cursor inside pair
                tagOpts.push({
                    label: insert,
                    type: 'keyword',
                    detail: 'html - ' + tag.detail,
                    boost: 10,
                    apply: (function(ins, mFrom, offset) {
                        return function(view, _c, _from, to) {
                            view.dispatch({
                                changes: { from: mFrom, to: to, insert: ins },
                                selection: { anchor: mFrom + offset },
                            });
                        };
                    })(insert, matchFrom, cursorOffset),
                });
            }
            if (tagOpts.length > 0) {
                return { from: matchFrom, options: tagOpts };
            }
        }
    }

    const word = context.matchBefore(/[\w.$-]+/);
    if (!word || word.from === word.to) return null;

    const typed = context.state.doc.sliceString(word.from, word.to);
    if (typed.length < 1) return null;
    const typedLower = typed.toLowerCase();

    const items = isServerScript ? _AC_SERVER_ALL : _AC_CLIENT_ALL;
    const options = [];

    // Add user-defined symbols from the current document
    try {
        const docText = context.state.doc.toString();
        const cursorLine = context.state.doc.lineAt(context.pos).number;
        const userSymbols = _extractUserSymbols(docText, cursorLine);
        for (let symIdx = 0; symIdx < userSymbols.length; symIdx++) {
            const symbol = userSymbols[symIdx];
            const symbolLower = symbol.label.toLowerCase();
            if (symbolLower === typedLower) continue;
            let symbolBoost = 0;
            if (symbolLower.indexOf(typedLower) === 0) { symbolBoost = 15; }
            else if (symbolLower.indexOf(typedLower) > 0) { symbolBoost = 6; }
            if (symbolBoost > 0) {
                if (symbol.type === 'property') { symbolBoost += 1; }
                options.push({ label: symbol.label, type: symbol.type, detail: symbol.detail, boost: symbolBoost });
            }
        }
    } catch (e) { /* user symbols failed - continue with static completions */ }

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemLabelLower = item.label.toLowerCase();
        let boost = 0;
        if (itemLabelLower === typedLower) { boost = 100; }
        else if (itemLabelLower.indexOf(typedLower) === 0) { boost = 10; }
        else if (itemLabelLower.indexOf(typedLower) > 0) { boost = 5; }
        if (boost === 0) continue;

        const opt = { label: item.label, type: item.type, detail: item.detail, boost: boost };

        // Side-effect import: base components (import './aiux-icon')
        if (item.sideEffectImport) {
            opt.detail += '  <- auto import';
            opt.apply = (function(it) {
                return function(view, _c, from, to) {
                    const changes = [{ from: from, to: to, insert: it.label }];
                    const imp = _acGetSideEffectImportChange(view.state.doc.toString(), it.label);
                    if (imp) changes.push(imp);
                    view.dispatch({ changes: changes });
                };
            })(item);
        }

        // Auto-import: top-level identifiers with an import source
        if (item.importSource && item.label.indexOf('.') === -1 && item.label.indexOf(' ') === -1 && !item.service) {
            opt.detail += '  <- auto import';
            opt.apply = (function(it) {
                return function(view, _c, from, to) {
                    const changes = [{ from: from, to: to, insert: it.label }];
                    const imp = _acGetImportChange(view.state.doc.toString(), it.label, it.importSource);
                    if (imp) changes.push(imp);
                    view.dispatch({ changes: changes });
                };
            })(item);
        }

        // Service method shortcuts: typing "getMessage" inserts "i18n.getMessage" and auto-imports
        if (item.service && item.label.indexOf('.') === -1) {
            opt.detail += '  <- auto import';
            opt.apply = (function(it) {
                return function(view, _c, from, to) {
                    const fullLabel = it.service + '.' + it.label;
                    const changes = [{ from: from, to: to, insert: fullLabel }];
                    const imp = _acGetImportChange(view.state.doc.toString(), it.service, it.importSource);
                    if (imp) changes.push(imp);
                    view.dispatch({ changes: changes });
                };
            })(item);
        }

        // Dotted service methods: selecting "i18n.getMessage" auto-imports the service
        if (item.service && item.label.indexOf('.') > -1) {
            opt.apply = (function(it) {
                return function(view, _c, from, to) {
                    const changes = [{ from: from, to: to, insert: it.label }];
                    const imp = _acGetImportChange(view.state.doc.toString(), it.service, it.importSource);
                    if (imp) changes.push(imp);
                    view.dispatch({ changes: changes });
                };
            })(item);
        }

        options.push(opt);
    }

    // Add instance widgets (dynamically loaded from the platform)
    if (!isServerScript && instanceWidgets && instanceWidgets.length > 0) {
        for (let instIdx = 0; instIdx < instanceWidgets.length; instIdx++) {
            try {
                const instWidgetId = instanceWidgets[instIdx].id;
                if (typeof instWidgetId !== 'string' || !instWidgetId) continue;
                const instWidgetIdLower = instWidgetId.toLowerCase();
            // Skip if already covered by static base components
                if (_AC_COMPONENT_PROPS_MAP[instWidgetId]) continue;
                let instBoost = 0;
                if (instWidgetIdLower.indexOf(typedLower) === 0) { instBoost = 4; }
                else if (instWidgetIdLower.indexOf(typedLower) > 0) { instBoost = 2; }
                if (instBoost > 0) {
                    const instScope = instanceWidgets[instIdx].scope || '';
                    const instOpt = { label: instWidgetId, type: 'class', detail: 'instance widget - ' + instanceWidgets[instIdx].name, boost: instBoost };
                    instOpt.apply = (function(widgetId, widgetScope) {
                        return function(view, _c, from, to) {
                            const changes = [{ from: from, to: to, insert: widgetId }];
                            const imp = _acGetSideEffectImportChange(view.state.doc.toString(), widgetId, widgetScope);
                            if (imp) changes.push(imp);
                            view.dispatch({ changes: changes });
                        };
                    })(instWidgetId, instScope);
                    options.push(instOpt);
                }
            } catch (e) { continue; }
        }
    }

    if (options.length === 0) return null;
    return { from: word.from, options: options };
    } catch (e) {
        // Never let autocomplete errors crash the editor
        console.warn('[dsautocm] autocomplete error:', e);
        return null;
    }
}

// ---------------------------------------------------------------------------
// Register on window for consuming widgets
// ---------------------------------------------------------------------------
const acService = {
    completionSource: _aixCompletionSource,
    buildTooltipDOM: _buildTooltipDOM,
    buildSignatureHelpDOM: _buildSignatureHelpDOM,
    createSignatureHelpField: _createSignatureHelpField,
    getImportChange: _acGetImportChange,
    getSideEffectImportChange: _acGetSideEffectImportChange,
    HOVER_MAP: _HOVER_MAP,
    CLIENT_ALL: _AC_CLIENT_ALL,
    SERVER_ALL: _AC_SERVER_ALL,
    COMPONENT_PROPS_MAP: _AC_COMPONENT_PROPS_MAP,
};

// Register in dependency registry
const REGISTRY_KEY = Symbol.for('aiux.dependency.registry');
if (globalThis[REGISTRY_KEY]) {
    globalThis[REGISTRY_KEY].register('AIUX_Code_Intellisense', acService);
}
