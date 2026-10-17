
            function include({
                imports
            }) {

                // Helper functions moved outside the main function
                const split = str => {
                    try {
                        if (str === null || str === undefined) {
                            return [];
                        }

                        const stringValue = String(str);
                        return stringValue.split(/\s+/).filter(Boolean);
                    } catch (error) {
                        return [];
                    }
                };

                const compact = arr => arr.filter(Boolean);
                const difference = (arr1, arr2) => arr1.filter(item => !arr2.includes(item));
                const isArray = arr => Array.isArray(arr);
                const flatten = arr => [].concat(...arr);

                /**
                 * Filters the items by keeping only items in the validItems list.
                 * @param {string} items - The items separated by whitespace
                 * @param {string[]} validItems - The items that are valid
                 * @returns {string} - The filtered product as a string
                 */
                const filterItems = (items, validItems) =>
                    compact(split(items).filter(i => validItems.includes(i))).join(' ');

                /**
                 * Given a list of items, this method returns a list with only valid items.
                 * @param {string[]|string} items - List of strings or single string separated by spaces
                 * @param {string[]} validItems - List of valid items
                 * @returns {string[]|string} - The filtered items after applying valid items as a filter
                 */
                const getItems = (items, validItems = []) => {
                    if (!validItems.length || !items) return items || '';

                    return isArray(items) ?
                        items.map(line => filterItems(line, validItems)) :
                        filterItems(items, validItems);
                };

                /**
                 * Collapses a toolbar configuration into a single string
                 * @param {string[]|string} toolbar - Toolbar configuration
                 * @returns {string} - Collapsed toolbar configuration
                 */
                const collapseToolbar = toolbar => {
                    if (!isArray(toolbar)) return toolbar || '';
                    const flattened = flatten(toolbar);
                    return compact(flattened).join(' ') || '';
                };

                // Constants
                const REQUIRED_PLUGINS = [
                    'powerpaste'
                ].join(' ');

                const PLUGIN_BLOCKLIST = ['wordcount'];

                const OBSOLETE_PLUGINS = [
                    // TinyMCE plugins that were moved to core
                    'textcolor', 'colorpicker', 'sn_resizer', 'hr',
                    'noneditable', 'print', 'paste',
                    // SN plugins that were removed
                    'a11y_fixes', 'anchor_fix', 'data_uri_sanitize', 'enable_iframe_media',
                    'instructional_text', 'notificationhandler', 'readonlymode', 'snLink',
                    // Plugins completely removed
                    'compat3x', 'fullpage', 'legacyoutput', 'tabfocus', 'spellchecker'
                ];

                const TOOLBAR_BLOCKLIST = [];

                /**
                 * Process TinyMCE toolbar and plugin configurations
                 * @param {string} toolbar - Toolbar configuration from dictionary attributes
                 * @param {string} plugins - Plugins from dictionary attributes
                 * @param {string} validButtons - Valid buttons from system properties
                 * @param {string} validPlugins - Valid plugins from system properties
                 * @returns {Object} - Object containing toolbar and plugin configurations
                 */
                const getTinyMCEToolbar = (
                    toolbar = '',
                    plugins = '',
                    validButtons = '',
                    validPlugins = ''
                ) => {
                    // Process valid buttons
                    const filteredButtons = difference(
                        split(validButtons ? `${validButtons} |` : ''),
                        TOOLBAR_BLOCKLIST
                    );

                    // Process plugins
                    const filteredPlugins = difference(
                        split(validPlugins),
                        [...PLUGIN_BLOCKLIST, ...OBSOLETE_PLUGINS]
                    );

                    // Generate toolbar items
                    const toolbarItems = collapseToolbar(getItems(toolbar, filteredButtons));

                    // Generate plugin items
                    let pluginItems = getItems(plugins, filteredPlugins);
                    pluginItems = compact([REQUIRED_PLUGINS, pluginItems]).join(' ');

                    return {
                        toolbar: toolbarItems,
                        plugins: pluginItems
                    };
                };

                return {
                    getTinyMCEToolbar
                };
            }
