import { html, css, nothing } from 'lit';
import { AIUXWidgetElement } from '@servicenow/aiux-components-core';
import { i18n, locationService } from '@servicenow/aiux-services';


/**
 * AIUX Builder Create Widget Modal v2
 *
 * Modal dialog with a schema-driven form for creating a new AIX widget.
 * Uses the entity service's getFormSchema() to dynamically generate form fields.
 *
 * @property {Boolean} open - Modal visibility
 *
 * @fires ds-close - When modal close is requested
 * @fires widget-created - When widget is successfully created (detail: { widget })
 * @fires widget-create-error - When creation fails (detail: { error })
 */
class AiuxBuilderCreateWidgetModal extends AIUXWidgetElement {
    static properties = {
        open: { type: Boolean, reflect: true },
        /** Pre-populated widget data when cloning (name, id, description, component, script, etc.) */
        cloneData: { type: Object },
        _formData: { type: Object, state: true },
        _schema: { type: Object, state: true },
        _loading: { type: Boolean, state: true },
        _schemaLoading: { type: Boolean, state: true },
        _error: { type: String, state: true },
        _touched: { type: Object, state: true },
        _currentScopeName: { type: String, state: true },
        _toasts: { type: Array, state: true },
    };

    // Fields to show in create form (in order)
    static CREATE_FIELDS = ['name', 'id', 'description'];

    // Field overrides for create form
    static FIELD_OVERRIDES = {
        name: {
            label: i18n.getMessage({ message: 'Name' }),
            required: true,
            placeholder: i18n.getMessage({ message: 'Hello World' }),
        },
        id: {
            label: i18n.getMessage({ message: 'Widget ID' }),
            required: true,
            placeholder: i18n.getMessage({ message: 'hello-world-playgroundWorld' }),
            description: i18n.getMessage({ message: 'Custom element tag name (kebab-case)' }),
        },
        description: {
            label: i18n.getMessage({ message: 'Description' }),
            required: false,
            placeholder: i18n.getMessage({ message: 'A starter widget to experiment with. Edit the code and see live preview!' }),
        },
    };

    constructor() {
        super();
        this.open = false;
        this.cloneData = null;
        this._formData = {};
        this._schema = null;
        this._loading = false;
        this._schemaLoading = false;
        this._error = '';
        this._touched = {};
        this._toasts = [];
        const scopeName = this._currentScopeName || i18n.getMessage({ message: 'Global' });
        this._onScopeChanged = (e) => {
            this._currentScopeName = e.detail?.name || '';
        };
    }

    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('wb-scope-change', this._onScopeChanged);
        if (!this._currentScopeName && window.AIUX_CURRENT_SCOPE?.name) {
            this._currentScopeName = window.AIUX_CURRENT_SCOPE.name;
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('wb-scope-change', this._onScopeChanged);
    }

    // ── Lifecycle ─────────────────────────────────────────────────────────

    async updated(changedProps) {
        if (changedProps.has('open') && this.open) {
            // Reset form and load schema when modal opens
            this._formData = this._getInitialFormData();
            this._error = '';
            this._touched = {};

            if (!this._schema) {
                await this._loadSchema();
            }
        }
    }

    _getInitialFormData() {
        if (this.cloneData) {
            return {
                name: `${this.cloneData.name || ''} ${i18n.getMessage({ message: '(Copy)' })}`,
                id: this._toKebabCase(`${this.cloneData.id || ''}-copy`),
                description: this.cloneData.description || '',
            };
        }
        return {
            name: '',
            id: '',
            description: '',
        };
    }

    /** Whether this modal is in clone mode */
    get _isCloneMode() {
        return !!this.cloneData;
    }

    // ── Schema Loading ────────────────────────────────────────────────────

    get _entityService() {
        return window.aiuxBuilderEntityService;
    }

    async _loadSchema() {
        this._schemaLoading = true;

        try {
            // Wait for entity service
            let retries = 0;
            while (!this._entityService && retries < 10) {
                await new Promise((r) => setTimeout(r, 100));
                retries++;
            }

            if (!this._entityService) {
                console.warn('[CreateWidgetModal] Entity service not available, using fallback schema');
                this._schema = this._getFallbackSchema();
                return;
            }

            // Load form schema with field filtering and overrides
            this._schema = await this._entityService.getFormSchema('sys_aix_widget', {
                fields: AiuxBuilderCreateWidgetModal.CREATE_FIELDS,
                overrides: AiuxBuilderCreateWidgetModal.FIELD_OVERRIDES,
            });
        } catch (err) {
            console.error('[CreateWidgetModal] Failed to load schema:', err);
            this._schema = this._getFallbackSchema();
        } finally {
            this._schemaLoading = false;
        }
    }

    _getFallbackSchema() {
        return {
            table: 'sys_aix_widget',
            label: i18n.getMessage({ message: 'Widget' }),
            fields: [
                {
                    name: 'name',
                    label: i18n.getMessage({ message: 'Name' }),
                    type: 'string',
                    required: true,
                    placeholder: i18n.getMessage({ message: 'Hello World' }),
                },
                {
                    name: 'id',
                    label: i18n.getMessage({ message: 'Widget ID' }),
                    type: 'string',
                    required: true,
                    placeholder: i18n.getMessage({ message: 'hello-world-playgroundWorld' }),
                    description: i18n.getMessage({ message: 'Custom element tag name (kebab-case)' }),
                },
                {
                    name: 'description',
                    label: i18n.getMessage({ message: 'Description' }),
                    type: 'text',
                    required: false,
                    placeholder: i18n.getMessage({ message: 'A starter widget to experiment with. Edit the code and see live preview!' }),
                },
            ],
        };
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    _toKebabCase(str) {
        return str
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    _validateForm() {
        const errors = {};
        const fields = this._schema?.fields || [];

        for (const field of fields) {
            const value = this._formData[field.name];

            if (field.required && !value?.toString().trim()) {
                errors[field.name] = i18n.getMessage({ message: '{0} is required' }, [field.label]);
            }

            // Special validation for widget ID
            if (field.name === 'id' && value) {
                if (!/^[a-z][a-z0-9-]*[a-z0-9]$/.test(value) && value.length > 2) {
                    errors[field.name] = i18n.getMessage({ message: 'Must be kebab-case (e.g., my-widget)' });
                } else if (value.length < 3) {
                    errors[field.name] = i18n.getMessage({ message: 'Must be at least 3 characters' });
                }
            }
        }

        return errors;
    }

    get _isValid() {
        const errors = this._validateForm();
        return Object.keys(errors).length === 0;
    }

    // ── Toast Helpers ─────────────────────────────────────────────────────

    _showToast(message, variant = 'error') {
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        this._toasts = [...this._toasts, { id, message, variant }];
    }

    _dismissToast(id) {
        this._toasts = this._toasts.filter(t => t.id !== id);
    }

    // ── Event Handlers ────────────────────────────────────────────────────

    _handleClose() {
        this.cloneData = null;
        this.dispatchEvent(
            new CustomEvent('ds-close', {
                bubbles: true,
                composed: true,
            }),
        );
    }

    _handleCancel() {
        this._handleClose();
    }

    _handleFieldChange(fieldName, value) {
        // Clear toasts when user edits any field
        if (this._toasts.length > 0) {
            this._toasts = [];
        }

        const updates = { [fieldName]: value };

        // Auto-generate ID from name if user hasn't manually edited it
        if (fieldName === 'name' && !this._touched.id) {
            updates.id = this._toKebabCase(value);
        }

        // Convert kebab-case for ID field
        if (fieldName === 'id') {
            updates.id = this._toKebabCase(value);
        }

        this._formData = { ...this._formData, ...updates };
        this._touched = { ...this._touched, [fieldName]: true };
    }

    async _handleConfirm() {
        if (!this._isValid || this._loading) return;

        this._loading = true;
        this._error = '';

        try {
            if (!this._entityService) {
                throw new Error(i18n.getMessage({ message: 'Entity service not available' }));
            }

            // Check if a widget with the same ID already exists in sys_aix_widget
            try {
                const existingWidgets = await this._entityService.list('sys_aix_widget', {
                    query: `id=${this._formData.id.trim()}`,
                    fields: ['sys_id', 'id'],
                    limit: 1,
                    useCache: false,
                });

                if (existingWidgets && existingWidgets.length > 0) {
                    this._loading = false;
                    this._showToast(
                        i18n.getMessage({ message: 'A widget with custom element name "{0}" already exists' }, [this._formData.id.trim()]),
                        'error',
                    );
                    return;
                }
            } catch (checkErr) {
                console.error('[CreateWidgetModal] Duplicate check failed:', checkErr);
                this._loading = false;
                this._showToast(i18n.getMessage({ message: 'Failed to validate widget ID. Please try again.' }), 'error');
                return;
            }

            // Create the widget record
            const isClone = this._isCloneMode;
            const payload = {
                name: this._formData.name.trim(),
                id: this._formData.id.trim(),
                description: this._formData.description?.trim() || '',
                scope: window.AIUX_CURRENT_SCOPE?.sysId || '',
                component: isClone
                    ? (this.cloneData.component || '')
                    : this._getDefaultComponent(this._formData.id.trim(), this._formData.name.trim()),
                script: isClone ? (this.cloneData.script || '') : '',
                input_schema: isClone ? (this.cloneData.input_schema || '{}') : '{}',
                client_tools: isClone ? (this.cloneData.client_tools || '{}') : '{}',
                dependent_widget_ids: isClone ? (this.cloneData.dependent_widget_ids || '') : '',
                best_for: isClone ? (this.cloneData.best_for || '') : i18n.getMessage({ message: 'Custom widget for general use' }),
                category: 'custom',
                servicenow: 'false',
            };

            const result = await this._entityService.create('sys_aix_widget', payload);
            // Widget API returns plain sys_id string
            const sysId = typeof result === 'string' ? result : (result?.sys_id?.value || result?.sys_id || result?.sysId);

            // Dispatch success event
            this.dispatchEvent(
                new CustomEvent('widget-created', {
                    detail: { widget: result, sysId },
                    bubbles: true,
                    composed: true,
                }),
            );
            this.trackEvent('Create Widget', { widgetTag: this._formData?.name || '' });

            // Close modal and navigate to widget editor
            this._handleClose();
            if (sysId) {
                locationService.navigate(`edit/widget/${sysId}`);
            }
        } catch (err) {
            console.error('[CreateWidgetModal] Creation failed:', err);
            this._error = err.message || i18n.getMessage({ message: 'Failed to create widget' });

            this.dispatchEvent(
                new CustomEvent('widget-create-error', {
                    detail: { error: this._error },
                    bubbles: true,
                    composed: true,
                }),
            );
        } finally {
            this._loading = false;
        }
    }

    _getDefaultComponent(elementId, displayName) {
        const className = elementId
            .split('-')
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join('');

        return `import { html, css } from \'lit\';
import { AIUXWidgetElement } from \'@servicenow/aiux-components-core\';

\/**
\ * ${displayName}
\ *
\ * @property {String} title - Widget title
\ */
class ${className} extends AIUXWidgetElement {
	static properties = {
		title: { type: String },
	};

	constructor() {
		super();
		this.title = '${displayName}';
	}

	render() {
		return html\`
			<div class="widget">
				<h2>\${this.title}</h2>
				<p>Hello from ${displayName}!</p>
			</div>
		\`;
	}

	static styles = css\`
		:host {
			display: block;
			font-family: var(--font-sans, Inter);
		}

		.widget {
			padding: calc(var(--spacing, 0.25rem) * 4);
			border-radius: var(--radius-lg, 0.5rem);
			background: var(--color-base-200, #f8fafc);
		}

		h2 {
			margin: 0 0 calc(var(--spacing, 0.25rem) * 2);
			font-size: var(--text-lg, 1.125rem);
			font-weight: var(--font-weight-semibold, 600);
			color: var(--color-base-content, #1e293b);
		}

		p {
			margin: 0;
			font-size: var(--text-sm, 0.875rem);
			color: var(--color-base-content-secondary, #64748b);
		}
	\`;
}
`;
    }

    // ── Render ────────────────────────────────────────────────────────────

    _renderField(field) {
        const value = this._formData[field.name];
        const errors = this._validateForm();
        const hasError = this._touched[field.name] && errors[field.name];

        return html`
            <div class="form-field">
                ${field.type !== 'boolean'
                    ? html`
                          <label class="form-label">
                              <span class="label-text">${field.label}</span>
                              ${field.required ? html`<span class="required">*</span>` : nothing}
                              ${field.description
                                  ? html`
                                        <span class="info-icon" title="${field.description}">
                                            <aiux-icon name="circle-info-outline" size="xs"></aiux-icon>
                                        </span>
                                    `
                                  : nothing}
                          </label>
                      `
                    : nothing}
                ${this._renderFieldInput(field, value, hasError)}
                ${hasError ? html` <span class="field-error">${errors[field.name]}</span> ` : nothing}
            </div>
        `;
    }

    _renderFieldInput(field, value, hasError) {
        switch (field.type) {
            case 'string':
                return html`
                    <input
                        type="text"
                        class="aiux-input aiux-input-md ${hasError ? 'input-error' : ''}"
                        placeholder="${field.placeholder || ''}"
                        .value=${value || ''}
                        @input=${(e) => this._handleFieldChange(field.name, e.target.value)}
                    />
                `;

            case 'text':
                return html`
                    <textarea
                        class="aiux-textarea aiux-textarea-md ${hasError ? 'textarea-error' : ''}"
                        rows="3"
                        placeholder="${field.placeholder || ''}"
                        .value=${value || ''}
                        @input=${(e) => this._handleFieldChange(field.name, e.target.value)}
                    ></textarea>
                `;

            case 'choice':
            case 'reference':
                return html`
                    <select
                        class="aiux-select aiux-select-md"
                        @change=${(e) => this._handleFieldChange(field.name, e.target.value)}
                    >
                        <option value="" ?selected=${!value}>${i18n.getMessage({ message: 'Select...' })}</option>
                        ${(field.options || []).map(opt => html`
                            <option value=${opt.value} ?selected=${opt.value === value}>${opt.label}</option>
                        `)}
                    </select>
                `;

            case 'boolean':
                return html`
                    <div class="toggle-field">
                        <input
                            type="checkbox"
                            class="aiux-toggle aiux-toggle-primary aiux-toggle-md"
                            ?checked=${!!value}
                            @change=${(e) => this._handleFieldChange(field.name, e.target.checked)}
                        />
                        <span class="toggle-label">${field.label}</span>
                    </div>
                `;

            default:
                return html`
                    <input
                        type="text"
                        class="aiux-input aiux-input-md ${hasError ? 'input-error' : ''}"
                        placeholder="${field.placeholder || ''}"
                        .value=${value || ''}
                        @input=${(e) => this._handleFieldChange(field.name, e.target.value)}
                    />
                `;
        }
    }

    _renderScopeField() {
        const scopeName = this._currentScopeName || i18n.getMessage({ message: 'Global' });
        return html`
            <div class="form-field">
                <label class="form-label">
                    <span class="label-text">${i18n.getMessage({ message: 'Scope' })}</span>
                    <span class="required">*</span>
                    <span class="info-icon" title="${i18n.getMessage({ message: 'Determines the visibility of the widget' })}">
                        <aiux-icon name="circle-info-outline" size="xs"></aiux-icon>
                    </span>
                </label>
                <div class="readonly-field">${scopeName}</div>
            </div>
        `;
    }

    render() {
        const fields = this._schema?.fields || [];
        const isConfirmDisabled = !this._isValid || this._schemaLoading || this._loading || this._toasts.length > 0;
        const beforeScope = fields.filter((f) => f.name === 'name' || f.name === 'id');
        const afterScope = fields.filter((f) => f.name !== 'name' && f.name !== 'id');

        return html`
            <aiux-dialog
                ?open=${this.open}
                size="md"
                show-close-button
                close-on-escape
                close-on-backdrop-click
                dialog-label="${i18n.getMessage({ message: 'Create Widget' })}"
                @aix-dialog-close=${this._handleClose}
            >
                <div slot="header">
                    <div class="header-title">${this._isCloneMode
                        ? i18n.getMessage({ message: 'Clone Widget' })
                        : i18n.getMessage({ message: 'Create Widget' })}</div>
                    <p class="form-subtitle">${this._isCloneMode
                        ? i18n.getMessage({ message: 'Review and customize the cloned widget details' })
                        : i18n.getMessage({ message: 'Define the properties for your new widget' })}</p>
                    <!-- Toast notifications — inside header -->
                    ${this._toasts.map(t => html`
                        <div class="inline-toast">
                            <aiux-toast-notification
                                type="${t.variant}"
                                message="${t.message}"
                                position="top-center"
                                .duration=${0}
                                dismissible
                                visible
                                @toast-dismiss=${() => this._dismissToast(t.id)}
                            ></aiux-toast-notification>
                        </div>
                    `)}
                </div>

                <div class="form">
                    ${this._error
                        ? html`
                              <div class="error-banner">
                                  <aiux-icon name="circle-exclamation-outline" size="sm"></aiux-icon>
                                  <span>${this._error}</span>
                              </div>
                          `
                        : nothing}
                    ${this._schemaLoading
                        ? html` <div class="loading-state">${i18n.getMessage({ message: 'Loading form...' })}</div> `
                        : html`
                              ${beforeScope.map((field) => this._renderField(field))}
                              ${this._renderScopeField()}
                              ${afterScope.map((field) => this._renderField(field))}
                          `}
                </div>

                <div slot="footer" class="dialog-footer">
                    <button class="aiux-btn aiux-btn-ghost" @click=${this._handleCancel}>${i18n.getMessage({ message: 'Cancel' })}</button>
                    <button class="aiux-btn aiux-btn-primary" ?disabled=${isConfirmDisabled} @click=${this._handleConfirm}>
                        ${this._loading
                            ? i18n.getMessage({ message: this._isCloneMode ? 'Cloning…' : 'Creating…' })
                            : i18n.getMessage({ message: 'Continue in editor' })}
                    </button>
                </div>
            </aiux-dialog>        
        `;
    }

    // ── Styles ────────────────────────────────────────────────────────────

    static styles = css`
        :host {
            display: contents;
            font-family: var(--font-sans, Inter);
        }

        /* ── Footer Buttons ────────────────────────────────────────────── */
        .dialog-footer {
            display: flex;
            justify-content: flex-end;
            gap: calc(var(--spacing, 0.25rem) * 2);
        }

        .header-title {
            font-size: var(--text-xl, 1.25rem);
            font-weight: var(--font-weight-semibold, 600);
            color: var(--color-base-content, #1f2937);
        }

        .form-subtitle {
            margin: calc(var(--spacing, 0.25rem) * 1) 0 0;
            font-size: var(--text-sm, 0.875rem);
            color: var(--color-base-content-secondary, #6b7280);
        }

        .form {
            display: flex;
            flex-direction: column;
            gap: calc(var(--spacing, 0.25rem) * 5);
        }

        .form-field {
            display: flex;
            flex-direction: column;
            gap: calc(var(--spacing, 0.25rem) * 1.5);
        }

        .form-field input,
        .form-field textarea,
        .form-field select {
            width: 100%;
            box-sizing: border-box;
        }

        .form-label {
            font-size: var(--text-sm, 0.875rem);
            font-weight: var(--font-weight-medium, 500);
            color: var(--color-base-content, #1f2937);
            display: flex;
            align-items: center;
            gap: calc(var(--spacing, 0.25rem) * 1);
        }

        .label-text {
            color: var(--color-base-content, #1f2937);
        }

        .required {
            color: var(--color-error, #dc2626);
        }

        .info-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: var(--color-base-400, #9ca3af);
            cursor: help;
        }

        .info-icon:hover {
            color: var(--color-base-content-secondary, #6b7280);
        }

        .toggle-field {
            display: flex;
            align-items: center;
            gap: calc(var(--spacing, 0.25rem) * 3);
            padding: calc(var(--spacing, 0.25rem) * 1) 0;
        }

        .toggle-label {
            font-size: var(--text-sm, 0.875rem);
            font-weight: var(--font-weight-medium, 500);
            color: var(--color-base-content, #1f2937);
        }

        .field-error {
            font-size: var(--text-xs, 0.75rem);
            color: var(--color-error, #dc2626);
        }

        .error-banner {
            display: flex;
            align-items: center;
            gap: calc(var(--spacing, 0.25rem) * 2);
            padding: calc(var(--spacing, 0.25rem) * 3) calc(var(--spacing, 0.25rem) * 4);
            background: var(--color-error-light, #fef2f2);
            border: 1px solid var(--color-error-border, #fecaca);
            border-radius: var(--radius-lg, 0.5rem);
            color: var(--color-error, #dc2626);
            font-size: var(--text-sm, 0.875rem);
        }

        .error-banner svg {
            flex-shrink: 0;
        }

        .readonly-field {
            padding: calc(var(--spacing, 0.25rem) * 2.5) calc(var(--spacing, 0.25rem) * 3);
            font-size: var(--text-sm, 0.875rem);
            color: var(--color-base-content-secondary, #6b7280);
            background: var(--color-base-200, #f3f4f6);
            border: 1px solid var(--color-border-default, #e5e7eb);
            border-radius: var(--radius-lg, 0.5rem);
        }

        .loading-state {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: calc(var(--spacing, 0.25rem) * 8);
            color: var(--color-base-content-secondary, #6b7280);
            font-size: var(--text-sm, 0.875rem);
        }

        .inline-toast {
            position: relative;
            margin-top: calc(var(--spacing, 0.25rem) * 2);
        }

        .inline-toast aiux-toast-notification {
            display: block;
            position: relative !important;
        }

        .inline-toast aiux-toast-notification,
        .inline-toast aiux-toast-notification * {
            position: relative !important;
            inset: auto !important;
            translate: none !important;
            transform: none !important;
        }
    `;
}
