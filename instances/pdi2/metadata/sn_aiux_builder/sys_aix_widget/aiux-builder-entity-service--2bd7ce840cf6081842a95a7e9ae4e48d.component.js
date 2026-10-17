import { html, nothing } from 'lit';
import { AIUXWidgetElement } from '@servicenow/aiux-components-core';
import { snHttp } from '@servicenow/aiux-utils';

/**
 * Implicit Reference Fields
 * Maps field names that aren't typed as 'reference' in schema but should be treated as references.
 * Key: field name, Value: { table, labelField?, query? } or just table string
 */
const IMPLICIT_REFERENCE_FIELDS = {
    // Table/Document references - sys_db_object uses 'name' as value, async search for efficiency
    'table': { table: 'sys_db_object', labelField: 'label', valueField: 'name', asyncSearch: true },
    'table_name': { table: 'sys_db_object', labelField: 'label', valueField: 'name', asyncSearch: true },
    'target_table': { table: 'sys_db_object', labelField: 'label', valueField: 'name', asyncSearch: true },
    'source_table': { table: 'sys_db_object', labelField: 'label', valueField: 'name', asyncSearch: true },
    'document_id': { dependsOn: 'table', labelField: 'name', valueField: 'sys_id', asyncSearch: true },
    // Widget references
    'widget': 'sys_aix_widget',
    'widget_id': 'sys_aix_widget',
};

/**
 * AIUX Builder Entity Service
 * Generic CRUD service for ANY ServiceNow table
 *
 * This widget provides a centralized API service that other widgets can use
 * to interact with ServiceNow tables. It implements caching, request deduplication,
 * and standardized error handling.
 *
 * Usage:
 * 1. Include this widget once in your experience
 * 2. Access via window.aiuxBuilderEntityService
 * 3. Or listen for entity-* events
 *
 * @fires entity-loading - Loading state changed (detail: { loading: boolean })
 * @fires entity-loaded - Data loaded (detail: { table, data, total? })
 * @fires entity-created - Record created (detail: { table, record })
 * @fires entity-updated - Record updated (detail: { table, record })
 * @fires entity-deleted - Record deleted (detail: { table, sysId })
 * @fires entity-error - Error occurred (detail: { message, table?, operation? })
 * @fires entity-schema-loaded - Schema loaded (detail: { table, schema })
 */
class AiuxBuilderEntityService extends AIUXWidgetElement {
    static properties = {
        chatOpen: { type: Boolean, default: false, attribute: 'chat-open' },
    };

    constructor() {
        super();
        this._cache = new Map();
        this._cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this._pendingRequests = new Map();
        this._baseUrl = '/api/now/table';
        this._widgetApiBase = '/api/now/aix/widget';

        // AMB (Skill invocation streaming)
        this.mode = "STREAM"; // skill invocation mode - STREAM | SYNC
        this.streamId = null;
        this.channel = `/aiux/skill/exec/broadcast`;
        this.subscription = null;
        
        // Expose service globally
        window.aiuxBuilderEntityService = this;
    }

    static dependencies = {
		services: ['amb']
	};

    connectedCallback() {
        super.connectedCallback();
    }

    updated(changedProperties) {
        if (changedProperties.has('chatOpen')) {
            if (this.chatOpen) {
                this.subscribeToChannel();
            } else {
                this.unsubscribeFromChannel();
            }
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (window.aiuxBuilderEntityService === this) {
            delete window.aiuxBuilderEntityService;
        }
        this.unsubscribeFromChannel();
    }

    // AMB for skill execution streaming responses - listens for messages and re-dispatches
    subscribeToChannel() {
        // start in STREAM mode (in case chat was re-opened after fallback to sync)
        this.mode = 'STREAM'; 
        // only subscribe if chat is open
        if(!this.chatOpen) return;

        this.streamId = `aiux-skill-${Math.random().toString(36).replace(/0\./g,'')}`;
        this.channel = `/aiux/skill/exec/${this.streamId}`;
        const ambClient = this.deps?.services?.amb;

        if (ambClient) {
            // check if connection is open before subscribing
            if (ambClient.getState() === "closed") {
                this.mode = 'SYNC'; // fallback to SYNC mode if AMB not available
                console.error('[⛗ AMB] AMB connection is not available, falling back to SYNC mode.');
                return;
            }
            const channel = ambClient.getChannel(this.channel);
            this.subscription = channel.subscribe((message) => {
                window.dispatchEvent(new CustomEvent('es-widget-skill-stream', {
                detail: message,
            }));
            });
            console.log('[⛗ AMB] Subscribed via deps.services.amb to', this.channel);
            return;
        }
        

        const ambRawClient = window.top?.g_ambClient;
        if (ambRawClient && typeof ambRawClient.getChannel === 'function') {
            // check if connection is open before subscribing
            if (ambRawClient.getState() === "closed") {
                this.mode = 'SYNC'; // fallback to SYNC mode if AMB not available
                console.error('[⛗ AMB] AMB connection is not available, falling back to SYNC mode.');
                return;
            }
            const channel = ambRawClient.getChannel(this.channel);
            if (channel) {
                this.subscription = channel.subscribe((message) => {
                    window.dispatchEvent(new CustomEvent('es-widget-skill-stream', {
				detail: message,
			    }));
                });

                if (ambRawClient.getState() === "closed") {
                    this.mode = 'SYNC'; // fallback to SYNC mode if AMB not available
                    console.error('[⛗ AMB] AMB connection is not available, falling back to SYNC mode.');
                    return;
                }
                console.log('[⛗ AMB] Subscribed via g_ambClient to', this.channel);
                return;
            }
        }

        if(!this.subscription){
            this.mode = 'SYNC'; // fallback to SYNC mode if AMB not available
        }
        console.error('[⛗ AMB] AMB connection failed, falling back to SYNC mode.');
    }

    unsubscribeFromChannel() {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
            console.log('[⛗ AMB] Unsubscribed from channel:', this.channel);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // CACHE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    _getCacheKey(type, table, ...args) {
        return `${type}:${table}:${args.join(':')}`;
    }

    _getFromCache(key) {
        const cached = this._cache.get(key);
        if (cached && Date.now() - cached.timestamp < this._cacheTimeout) {
            return cached.data;
        }
        this._cache.delete(key);
        return null;
    }

    _setCache(key, data) {
        this._cache.set(key, { data, timestamp: Date.now() });
    }

    _invalidateCache(pattern) {
        for (const key of this._cache.keys()) {
            if (key.includes(pattern)) {
                this._cache.delete(key);
            }
        }
    }


    // ═══════════════════════════════════════════════════════════════
    // REQUEST HELPERS
    // ═══════════════════════════════════════════════════════════════

    _getWidgetUrl(sysId = '') {
        return sysId ? `${this._widgetApiBase}/${sysId}` : this._widgetApiBase;
    }

    _getUrl(table, sysId = '') {
        const base = `${this._baseUrl}/${table}`;
        return sysId ? `${base}/${sysId}` : base;
    }

    _buildParams(options = {}) {
        const params = new URLSearchParams();
        if (options.query) params.set('sysparm_query', options.query);
        if (options.limit !== undefined) params.set('sysparm_limit', String(options.limit));
        if (options.offset !== undefined) params.set('sysparm_offset', String(options.offset));
        if (options.fields?.length > 0) params.set('sysparm_fields', options.fields.join(','));
        if (options.displayValue !== undefined) {
            params.set('sysparm_display_value', options.displayValue ? 'all' : 'false');
        }
        if (options.transactionScope) {
            params.set('sysparm_transaction_scope', options.transactionScope);
        }
        if (options.orderBy) {
            const orderClause = options.orderDesc
                ? `ORDERBYDESC${options.orderBy}`
                : `ORDERBY${options.orderBy}`;
            const existingQuery = params.get('sysparm_query');
            params.set('sysparm_query', existingQuery ? `${existingQuery}^${orderClause}` : orderClause);
        }
        return params.toString();
    }

    async _dedupedRequest(key, requestFn) {
        // Return existing promise if request in-flight
        if (this._pendingRequests.has(key)) {
            return this._pendingRequests.get(key);
        }
        // Return cached data if valid
        const cached = this._getFromCache(key);
        if (cached) {
            return cached;
        }
        // Create new request and store promise
        const promise = requestFn()
            .then((data) => {
                this._setCache(key, data);
                this._pendingRequests.delete(key);
                return data;
            })
            .catch((error) => {
                this._pendingRequests.delete(key);
                throw error;
            });
        this._pendingRequests.set(key, promise);
        return promise;
    }

    _dispatchEvent(name, detail) {
        this.dispatchEvent(new CustomEvent(name, {
            bubbles: true,
            composed: true,
            detail,
        }));
    }

    // ═══════════════════════════════════════════════════════════════
    // CRUD OPERATIONS
    // ═══════════════════════════════════════════════════════════════

    /**
     * List records from a table
     * @param {string} table - Table name (e.g., 'sys_aix_widget')
     * @param {Object} options - Query options
     * @param {string} options.query - Encoded query string
     * @param {number} options.limit - Max records to return (default: 100)
     * @param {number} options.offset - Offset for pagination
     * @param {string[]} options.fields - Fields to return
     * @param {string} options.orderBy - Field to order by
     * @param {boolean} options.orderDesc - Order descending
     * @param {boolean} options.useCache - Use cached data (default: true)
     * @returns {Promise<Array>} Array of records
     */
    async list(table, options = {}) {
        if (!table) throw new Error('Table name is required');

        const cacheKey = this._getCacheKey('list', table, JSON.stringify(options));

        const fetchData = async () => {
            this._dispatchEvent('entity-loading', { loading: true, table });

            try {
                const params = this._buildParams({ limit: 100, displayValue: true, ...options });
                const url = params ? `${this._getUrl(table)}?${params}` : this._getUrl(table);

                const response = await snHttp.get(url);
                const records = response.data?.result || [];

                this._dispatchEvent('entity-loaded', {
                    table,
                    data: records,
                    total: records.length,
                });

                return records;
            } finally {
                this._dispatchEvent('entity-loading', { loading: false, table });
            }
        };

        if (options.useCache === false) {
            return fetchData();
        }
        return this._dedupedRequest(cacheKey, fetchData);
    }

    /**
     * Get a single record
     * @param {string} table - Table name
     * @param {string} sysId - Record sys_id
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Record object
     */
    async get(table, sysId, options = {}) {
        if (!table) throw new Error('Table name is required');
        if (!sysId) throw new Error('sysId is required');

        const cacheKey = this._getCacheKey('get', table, sysId);

        const fetchData = async () => {
            this._dispatchEvent('entity-loading', { loading: true, table });

            try {
                let url;
                if (table === 'sys_aix_widget') {
                    url = this._getWidgetUrl(sysId);
                } else {
                    const params = this._buildParams({ displayValue: true, ...options });
                    url = params ? `${this._getUrl(table, sysId)}?${params}` : this._getUrl(table, sysId);
                }

                const response = await snHttp.get(url);
                return response.data?.result || null;
            } finally {
                this._dispatchEvent('entity-loading', { loading: false, table });
            }
        };

        if (options.useCache === false) {
            return fetchData();
        }
        return this._dedupedRequest(cacheKey, fetchData);
    }

    /**
     * Create a new record
     * @param {string} table - Table name
     * @param {Object} record - Record data
     * @returns {Promise<Object>} Created record
     */
    async create(table, record) {
        if (!table) throw new Error('Table name is required');
        if (!record || typeof record !== 'object') {
            throw new Error('Record data is required');
        }

        this._dispatchEvent('entity-loading', { loading: true, table });

        try {
            let url;
            if (table === 'sys_aix_widget') {
                url = this._getWidgetUrl();
            } else {
                const params = this._buildParams({ displayValue: true });
                url = params ? `${this._getUrl(table)}?${params}` : this._getUrl(table);
            }

            const response = await snHttp.post(url, { data: record });
            const created = response.data?.result;

            // Invalidate list cache for this table
            this._invalidateCache(`list:${table}`);

            this._dispatchEvent('entity-created', { table, record: created });
            return created;
        } catch (error) {
            this._dispatchEvent('entity-error', {
                message: error.message,
                table,
                operation: 'create'
            });
            throw error;
        } finally {
            this._dispatchEvent('entity-loading', { loading: false, table });
        }
    }

    /**
     * Update an existing record
     * @param {string} table - Table name
     * @param {string} sysId - Record sys_id
     * @param {Object} updates - Fields to update
     * @param {Object} [options] - Options
     * @param {string} [options.transactionScope] - Scope sys_id for scoped updates
     * @returns {Promise<Object>} Updated record
     */
    async updateRecord(table, sysId, updates, options = {}) {
        if (!table) throw new Error('Table name is required');
        if (!sysId) throw new Error('sysId is required');
        if (!updates || typeof updates !== 'object') {
            throw new Error('Update data is required');
        }

        this._dispatchEvent('entity-loading', { loading: true, table });

        try {
            let url;
            if (table === 'sys_aix_widget' && !options.forceTableApi) {
                url = this._getWidgetUrl(sysId);
            } else {
                const params = this._buildParams({ displayValue: true, transactionScope: options.transactionScope });
                url = params ? `${this._getUrl(table, sysId)}?${params}` : this._getUrl(table, sysId);
            }

            const response = await snHttp.put(url, { data: updates });
            const updated = response.data?.result;

            // Invalidate caches
            this._invalidateCache(`list:${table}`);
            this._invalidateCache(`get:${table}:${sysId}`);

            this._dispatchEvent('entity-updated', { table, record: updated });
            return updated;
        } catch (error) {
            this._dispatchEvent('entity-error', {
                message: error.message,
                table,
                operation: 'update'
            });
            throw error;
        } finally {
            this._dispatchEvent('entity-loading', { loading: false, table });
        }
    }


    /**
     * Delete a record
     * @param {string} table - Table name
     * @param {string} sysId - Record sys_id
     * @returns {Promise<boolean>} Success
     */
    async delete(table, sysId) {
        if (!table) throw new Error('Table name is required');
        if (!sysId) throw new Error('sysId is required');

        this._dispatchEvent('entity-loading', { loading: true, table });

        try {
            // Widget API doesn't support DELETE — always use Table API.
            // For scoped records, fetch sys_scope to pass transaction scope.
            let url = this._getUrl(table, sysId);
            if (table === 'sys_aix_widget') {
                const record = await this.get(table, sysId);
                const scope = record?.sys_scope?.value || record?.sys_scope || '';
                if (scope) {
                    url += `?sysparm_transaction_scope=${encodeURIComponent(scope)}`;
                }
            }

            await snHttp.delete(url);

            // Invalidate caches
            this._invalidateCache(`list:${table}`);
            this._invalidateCache(`get:${table}:${sysId}`);

            this._dispatchEvent('entity-deleted', { table, sysId });
            return true;
        } catch (error) {
            this._dispatchEvent('entity-error', {
                message: error.message,
                table,
                operation: 'delete'
            });
            throw error;
        } finally {
            this._dispatchEvent('entity-loading', { loading: false, table });
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // SCHEMA / METADATA
    // ═══════════════════════════════════════════════════════════════

    /**
     * Get table schema (columns, metadata)
     * @param {string} table - Table name
     * @param {string} view - View name (default: 'Default view')
     * @returns {Promise<Object>} Schema object
     */
    async getSchema(table, view = 'Default view') {
        if (!table) throw new Error('Table name is required');

        const cacheKey = this._getCacheKey('schema', table, view);

        const fetchSchema = async () => {
            this._dispatchEvent('entity-loading', { loading: true, table });

            try {
                const params = new URLSearchParams({ sysparm_view: view });
                const response = await snHttp.get(`/api/now/ui/table_layout/${table}?${params}`);
                const layout = response.data?.result;
                const baseTable = layout.table_metadata?.base_table || table;

                const columns = (layout.columns || [])
                    .filter(col => col.name !== 'sys_id')
                    .map(col => ({
                        field: col.name,
                        name: col.name,
                        label: col.label,
                        type: this._mapColumnType(col.type),
                        choiceValue: parseInt(col.choice_value, 10) || 0,
                        baseTable,
                        reference: col.reference || null,
                        mandatory: col.mandatory || false,
                        required: col.mandatory || false,
                        readonly: col.readonly || false,
                        maxLength: col.max_length || null,
                        canSort: col.can_sort !== false,
                        canFilter: col.can_filter !== false,
                    }));

                const schema = {
                    table,
                    label: layout.table_metadata?.label || table,
                    labelPlural: layout.table_metadata?.label_plural || table,
                    columns,
                    metadata: layout.table_metadata || {},
                    views: layout.table_metadata?.views || layout.views || [],
                };

                this._dispatchEvent('entity-schema-loaded', { table, schema });
                return schema;
            } finally {
                this._dispatchEvent('entity-loading', { loading: false, table });
            }
        };

        return this._dedupedRequest(cacheKey, fetchSchema);
    }


    _mapColumnType(apiType) {
        const typeMap = {
            'string': 'string',
            'integer': 'integer',
            'reference': 'reference',
            'glide_date_time': 'datetime',
            'glide_date': 'date',
            'boolean': 'boolean',
            'choice': 'choice',
            'journal': 'text',
            'journal_input': 'text',
            'html': 'html',
            'translated_html': 'html',
            'script': 'code',
            'script_plain': 'code',
            'email': 'email',
            'url': 'url',
            'phone_number': 'phone',
            'currency': 'currency',
            'price': 'price',
            'decimal': 'decimal',
            'float': 'float',
            'percent_complete': 'percent',
        };
        return typeMap[apiType] || 'string';
    }

    // ═══════════════════════════════════════════════════════════════
    // FORM SCHEMA (with options pre-loaded)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Get form-ready schema with all reference and choice options loaded
     * This is the recommended method for rendering forms dynamically.
     * 
     * @param {string} table - Table name
     * @param {Object} options - Options
     * @param {string} options.view - View name (default: 'Default view')
     * @param {Array<string>} options.fields - Specific fields to include (optional, includes all if not specified)
     * @param {Array<string>} options.exclude - Fields to exclude (optional)
     * @param {Object} options.overrides - Field overrides { fieldName: { label, placeholder, description, hidden } }
     * @returns {Promise<Object>} Form-ready schema with options
     */
    async getFormSchema(table, options = {}) {
        if (!table) throw new Error('Table name is required');

        const cacheKey = this._getCacheKey('formSchema', table, options.view || 'Default view', 
            JSON.stringify(options.fields || []), JSON.stringify(options.exclude || []));

        const fetchFormSchema = async () => {
            // 1. Get base schema
            const schema = await this.getSchema(table, options.view);
            
            // 2. Filter fields if specified
            let fields = [...schema.columns];
            
            if (options.fields?.length) {
                fields = fields.filter(f => options.fields.includes(f.name));
                // Maintain order from options.fields
                fields.sort((a, b) => options.fields.indexOf(a.name) - options.fields.indexOf(b.name));
            }
            
            if (options.exclude?.length) {
                fields = fields.filter(f => !options.exclude.includes(f.name));
            }

            // 3. Load options for reference and choice fields in parallel
            const loadPromises = fields.map(async (field) => {
                const enrichedField = { ...field };
                
                // Apply overrides selectively (only override properties that are explicitly provided)
                if (options.overrides?.[field.name]) {
                    const override = options.overrides[field.name];
                    // Only apply non-undefined override values
                    for (const [key, value] of Object.entries(override)) {
                        if (value !== undefined) {
                            enrichedField[key] = value;
                        }
                    }
                }

                // Check for implicit reference fields (fields not typed as reference but should fetch options)
                const implicitRefConfig = IMPLICIT_REFERENCE_FIELDS[field.name];
                let implicitRefTable = null;
                let implicitLabelField = null;
                let implicitValueField = null;
                let implicitQuery = null;
                let useAsyncSearch = false;
                let dependsOnField = null;
                
                if (implicitRefConfig && !field.reference && field.type !== 'reference') {
                    if (typeof implicitRefConfig === 'string') {
                        implicitRefTable = implicitRefConfig;
                    } else if (implicitRefConfig?.dependsOn) {
                        // Dependent reference - table comes from another field's value
                        dependsOnField = implicitRefConfig.dependsOn;
                        implicitLabelField = implicitRefConfig.labelField;
                        implicitValueField = implicitRefConfig.valueField;
                        useAsyncSearch = implicitRefConfig.asyncSearch || false;
                        enrichedField.type = 'reference';
                        enrichedField.dependsOn = dependsOnField;
                    } else if (implicitRefConfig?.table) {
                        implicitRefTable = implicitRefConfig.table;
                        implicitLabelField = implicitRefConfig.labelField;
                        implicitValueField = implicitRefConfig.valueField;
                        implicitQuery = implicitRefConfig.query;
                        useAsyncSearch = implicitRefConfig.asyncSearch || false;
                    }
                    
                    if (implicitRefTable) {
                        enrichedField.reference = implicitRefTable;
                        enrichedField.type = 'reference';
                    }
                }

                // For async search fields, don't pre-fetch - pass config for runtime search
                if (useAsyncSearch && (enrichedField.reference || dependsOnField)) {
                    enrichedField.asyncSearch = true;
                    enrichedField.searchConfig = {
                        table: enrichedField.reference || null, // null if dependent
                        dependsOn: dependsOnField, // field name whose value is the table
                        labelField: implicitLabelField || 'name',
                        valueField: implicitValueField || 'sys_id',
                        query: implicitQuery,
                    };
                    enrichedField.options = []; // Start empty, will be populated on search
                }
                // Load reference options for non-async fields
                else if ((enrichedField.type === 'reference' || enrichedField.reference) && enrichedField.reference && !enrichedField.hidden) {
                    try {
                        const refTable = enrichedField.reference;
                        const labelField = implicitLabelField || 'name';
                        const valueField = implicitValueField || 'sys_id';
                        const fieldsToFetch = ['sys_id', 'name', 'title', 'label'];
                        if (labelField && !fieldsToFetch.includes(labelField)) fieldsToFetch.push(labelField);
                        if (valueField && !fieldsToFetch.includes(valueField)) fieldsToFetch.push(valueField);
                        
                        const listOptions = {
                            fields: fieldsToFetch,
                            limit: 500,
                            displayValue: true,
                        };
                        
                        // Add query filter if specified
                        if (implicitQuery) {
                            listOptions.query = implicitQuery;
                        }
                        
                        const items = await this.list(refTable, listOptions);
                        enrichedField.options = items.map(item => {
                            // Use custom valueField or default to sys_id
                            const value = this._extractValue(item[valueField]) || this._extractValue(item.sys_id);
                            // Use the custom label field first, then fall back to standard fields
                            const label = this._extractValue(item[labelField]) ||
                                          this._extractValue(item.name) || 
                                          this._extractValue(item.title) ||
                                          this._extractValue(item.label) ||
                                          value;
                            return { value, label };
                        });
                    } catch (err) {
                        console.warn(`[EntityService] Failed to load reference options for ${field.name}:`, err);
                        enrichedField.options = [];
                    }
                }
                

                return enrichedField;
            });

            const enrichedFields = await Promise.all(loadPromises);

            // 4. Return form-ready schema
            return {
                table,
                label: schema.label,
                labelPlural: schema.labelPlural,
                fields: enrichedFields,
                metadata: schema.metadata,
            };
        };

        return this._dedupedRequest(cacheKey, fetchFormSchema);
    }

    /**
     * Helper to extract value from ServiceNow API response objects
     */
    _extractValue(val) {
        if (val === null || val === undefined) return '';
        if (typeof val === 'object' && 'value' in val) return val.value;
        return val;
    }

    // ═══════════════════════════════════════════════════════════════
    // AIUX WIDGET OPERATIONS (Create / Update via AI)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Create or update a widget via the AIUX Widget Creation API
     * @param {string} userRequirement - The user's prompt describing the widget
     * @param {string} [widgetSysId] - Optional sys_id of an existing widget to update
     * @returns {Promise<Object>} Result with { success, sysId, action, component, script }
     */
    async createWidget(userRequirement, widgetSysId) {
        this._dispatchEvent('entity-loading', { loading: true, operation: 'createWidget' });
        try {
            const payload = { userRequirement, options: { mode: this.mode, ambChannel: this.channel } };
            if (widgetSysId) {
                payload.widgetSysId = widgetSysId;
            } 
            
            const response = await snHttp.post('/api/now/aiux_skill/widget', { data: payload });
            const { result = {} } = response.data || {};
            if (this.mode === 'SYNC') {
                if (result?.success && result?.sysId) {
                    this._invalidateCache('sys_aix_widget');
                    this._dispatchEvent('entity-created', { table: 'sys_aix_widget', record: result });
                }
                
                return result;
            } else if (this.mode === 'STREAM') {
                if (result.success && result?.response?.status === 'success'){
                    return {
                        success: true,
                        message: result.response.message
                    };
                }
                // throw an error with message as skill invocation failed
                throw new Error(result.response?.message || 'Widget creation failed!');
            }
        } catch (error) {
            this._dispatchEvent('entity-error', { message: error.message, table: 'sys_aix_widget', operation: 'createWidget' });
            throw error;
        } finally {
            this._dispatchEvent('entity-loading', { loading: false, operation: 'createWidget' });
        }
    }

    /**
     * Revert a widget to its previous version via the WidgetVersionManager API
     * @param {string} widgetSysId - The sys_id of the widget to revert
     * @returns {Promise<Object>} Result with { success, action, widgetSysId, currentVersionSysId, previousVersionSysId }
     */
    async revertWidget(widgetSysId) {
        this._dispatchEvent('entity-loading', { loading: true, operation: 'revertWidget' });
        try {
            const response = await snHttp.post(`${this._getWidgetUrl(widgetSysId)}/rollback`, {});
            const { result = {} } = response.data || {};
            if (result?.success) {
                this._invalidateCache('sys_aix_widget');
                this._dispatchEvent('entity-updated', { table: 'sys_aix_widget', record: result });
            }
            return result;
        } catch (error) {
            this._dispatchEvent('entity-error', { message: error.message, table: 'sys_aix_widget', operation: 'revertWidget' });
            throw error;
        } finally {
            this._dispatchEvent('entity-loading', { loading: false, operation: 'revertWidget' });
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // RENDER (invisible service widget)
    // ═══════════════════════════════════════════════════════════════

    render() {
        // Service widget - no visible UI
        return nothing;
    }
}
