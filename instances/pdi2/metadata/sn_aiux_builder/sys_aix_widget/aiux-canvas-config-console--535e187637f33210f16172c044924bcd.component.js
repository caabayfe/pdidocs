import { html, css } from 'lit';
import { AIUXWidgetElement } from '@servicenow/aiux-components-core';
import { i18n, notifications } from '@servicenow/aiux-services';
import { snHttp } from '@servicenow/aiux-utils';

class CanvasConfigConsole extends AIUXWidgetElement {
    static styles = css`
        :host {
            display: block;
            font-family: inherit;
        }
        .root {
            background: var(--color-background-primary, #ffffff);
            overflow: hidden;
        }
        /* ── Header ── */
        .hdr {
            margin-bottom: 28px;
        }
        .hdr-title {
            font-size: 22px;
            font-weight: 700;
            color: var(--color-text-primary, #1e293b);
            margin: 0 0 6px;
        }
        .hdr-desc {
            font-size: 14px;
            color: var(--color-text-primary, #1e293b);
            margin: 0;
            line-height: 1.5;
            max-width: 44%;
        }
        /* ── Two-column layout ── */
        .layout {
            display: flex;
            gap: 32px;
            align-items: flex-start;
        }
        .col-left {
            flex: 0 0 44%;
            min-width: 0;
            padding-left: 20px;
        }
        .col-right {
            flex: 1 1 0;
            min-width: 0;
        }
        /* ── Section labels ── */
        .section-label {
            font-size: 16px;
            font-weight: 700;
            color: var(--color-text-primary, #1e293b);
            margin: 0 0 12px;
        }
        /* ── Subtitle textarea ── */
        .subtitle-textarea {
            display: block;
            width: 100%;
            min-height: 100px;
            padding: 12px 14px;
            border: 2px solid var(--color-primary, #007b9e);
            border-radius: 10px;
            font-size: 15px;
            color: var(--color-text-primary, #1e293b);
            font-family: inherit;
            line-height: 1.5;
            box-sizing: border-box;
            resize: none;
            outline: none;
            background: var(--color-background-primary, #ffffff);
        }
        .subtitle-textarea::placeholder {
            color: var(--color-text-tertiary, #475569);
        }
        .subtitle-textarea:focus {
            border-color: var(--color-primary-focus, #0052a3);
            box-shadow: 0 0 0 3px rgba(0, 123, 158, 0.15);
        }
        /* ── Divider ── */
        .divider {
            border: none;
            border-top: 1px solid var(--neutral-300, #cbd5e1);
            margin: 24px 0;
        }
        /* ── Default view ── */
        .default-view-row {
            display: flex;
            gap: 16px;
            align-items: flex-start;
        }
        .dv-icon {
            flex-shrink: 0;
            width: 80px;
            height: 80px;
        }
        .dv-text-col {
            flex: 1;
            min-width: 0;
        }
        .dv-text-col p {
            font-size: 14px;
            color: var(--color-text-primary, #1e293b);
            line-height: 1.5;
            margin: 0 0 14px;
        }
        .edit-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            background: var(--color-background-primary-raised, #e2e8f0);
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            color: var(--color-text-primary, #1e293b);
            cursor: pointer;
            text-decoration: none;
            transition: background var(--duration-fast, 150ms) var(--ease-standard, ease);
        }
        .edit-btn:hover {
            background: var(--color-background-primary-raised-hover, #cbd5e1);
        }
        /* ── Preview ── */
        .preview-card {
            border: 1px solid var(--neutral-300, #cbd5e1);
            border-radius: 10px;
            overflow: hidden;
        }
        .preview-toolbar {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 14px;
            background: linear-gradient(
                to bottom,
                var(--color-background-primary, #ffffff),
                var(--color-background-secondary, #f1f5f9)
            );
            border-bottom: 1px solid var(--neutral-300, #cbd5e1);
            flex-wrap: wrap;
        }
        .preview-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--color-text-primary, #1e293b);
            margin-right: auto;
        }
        .toggle-group {
            display: flex;
            align-items: center;
            background: var(--neutral-200, #e2e8f0);
            border-radius: 24px;
            padding: 3px;
            gap: 2px;
        }
        .tog {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 5px 10px;
            border: none;
            background: none;
            border-radius: 24px;
            font-size: 13px;
            font-weight: 500;
            color: var(--color-text-tertiary, #475569);
            cursor: pointer;
            line-height: 1;
            transition:
                background var(--duration-fast, 100ms) var(--ease-standard, ease),
                box-shadow var(--duration-fast, 100ms) var(--ease-standard, ease),
                color var(--duration-fast, 100ms) linear;
        }
        .tog.active {
            background: var(--color-background-primary, #ffffff);
            color: var(--color-text-primary, #1e293b);
            font-weight: 600;
            border-radius: 24px;
            box-shadow:
                0 1px 3px rgba(0, 0, 0, 0.12),
                0 1px 2px rgba(0, 0, 0, 0.08);
        }
        .tog svg {
            width: 15px;
            height: 15px;
            flex-shrink: 0;
        }
        .preview-content {
            background: var(--neutral-950, #020617);
            padding: 48px;
        }
        .preview-inner {
            border-radius: 6px;
            overflow: hidden;
            position: relative;
        }
        .preview-frame {
            border: none;
            display: block;
            transform-origin: top left;
            pointer-events: none;
        }
        .preview-placeholder {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--color-text-inverted, #1e293b);
            font-size: 14px;
        }
        /* ── Save ── */
        .save-row {
            display: flex;
            justify-content: flex-end;
            padding-top: 24px;
        }
        .save-btn {
            padding: 8px 14px;
            background: var(--color-brand-primary-raised, #006484);
            color: var(--color-text-inverted, #1e293b);
            border: none;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: background var(--duration-fast, 150ms) var(--ease-standard, ease);
        }
        .save-btn:hover:not(:disabled) {
            background: var(--color-brand-primary-raised-hover, #004f6b);
        }
        .save-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        /* ── Responsive ── */
        @media (max-width: 768px) {
            .layout {
                flex-direction: column;
            }
            .col-left {
                flex: 1 1 100%;
            }
            .hdr-desc {
                max-width: 100%;
            }
        }
    `;

    static properties = {
        subtitle: {
            type: String,
            description: 'The subtitle text shown on the Canvas page for all users before they personalize it',
        },
        experienceId: {
            type: String,
            attribute: 'experience-id',
            description:
                'The sys_id of the sys_aix_experience record used to look up the first dashboard for that experience',
        },
        // dashboardSysId: {
        //     type: String,
        //     attribute: 'dashboard-sys-id',
        //     description: 'The sys_id of the sys_aix_dashboard record used to fetch the path pattern for the preview URL',
        // },
        _subtitleInput: { type: String, state: true },
        _originalSubtitle: { type: String, state: true },
        _previewTheme: { type: String, state: true },
        _previewDevice: { type: String, state: true },
        _saving: { type: Boolean, state: true },
        _scale: { type: Number, state: true },
    };

    constructor() {
        super();
        this.experienceId = '';
        this._subtitle = '';
        this._dashboardSysId = '';
        this._dashboardScope = '';
        this._subtitleInput = '';
        this._originalSubtitle = '';
        this._previewTheme = 'light';
        this._previewDevice = 'desktop';
        this._saving = false;

        this._scale = 1;
        this._resizeObserver = null;
        this.previewUrl = '';
    }

    connectedCallback() {
        super.connectedCallback();
    }

    firstUpdated() {
        const content = this.shadowRoot.querySelector('.preview-content');
        if (content) {
            this._resizeObserver = new ResizeObserver(() => this._updateScale());
            this._resizeObserver.observe(content);
            this._updateScale();
        }
    }

    updated(changedProperties) {
        super.updated(changedProperties);
        if (changedProperties.has('experienceId') && this.experienceId) {
            this._getDashboardData();
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
            this._resizeObserver = null;
        }
    }

    async _getDashboardData() {
        if (!this.experienceId) return;
        try {
            const params = new URLSearchParams({
                sysparm_query: `experience=${this.experienceId}`,
                sysparm_exclude_reference_link: 'true',
                sysparm_fields:
                    'experience,experience.url_suffix,dashboard,dashboard.subtitle,dashboard.path_pattern,dashboard.sys_scope',
                sysparm_limit: '1',
            });
            const response = await snHttp.get(`/api/now/table/sys_aix_m2m_experience_dashboard?${params}`);
            const result = response?.data?.result?.[0];
            if (!result) return;
            if (!result.dashboard || !result['experience.url_suffix'] || !result['dashboard.path_pattern']) {
                console.error('[CanvasConfigConsole] m2m response missing required fields:', result);
                return;
            }
            this._dashboardSysId = result.dashboard;
            this._dashboardScope = result['dashboard.sys_scope'];
            this.previewUrl = `/aiux/${result['experience.url_suffix']}${result['dashboard.path_pattern']}`;
            this._subtitleInput = result['dashboard.subtitle'];
            this._originalSubtitle = result['dashboard.subtitle'];
        } catch (error) {
            const errBody = error?.response?.data;
            const noRecord = errBody?.status === 'failure' && /no record/i.test(errBody?.error?.message ?? '');
            if (noRecord) return;
            console.error('[CanvasConfigConsole] Failed to fetch dashboard data:', errBody || error);
        }
    }

    _setTheme(theme) {
        this._previewTheme = theme;
        const iframe = this.shadowRoot?.querySelector('.preview-frame');
        iframe?.contentDocument?.body?.setAttribute('data-theme', theme);
    }

    _onIframeLoad(e) {
        e.target.contentDocument?.body?.setAttribute('data-theme', this._previewTheme);
    }

    _updateScale() {
        const content = this.shadowRoot?.querySelector('.preview-content');
        if (!content) return;
        const containerWidth = content.clientWidth - 96;
        this._scale = containerWidth > 0 ? containerWidth / 1280 : 1;
    }

    async handleSave(e) {
        e.preventDefault();
        e.stopPropagation();
        this._saving = true;
        try {
            const payload = {
                sysId: this._dashboardSysId,
                subtitle: this._subtitleInput,
            };

            const updateUrl = this._dashboardScope
                ? `/api/now/aiux/dashboard/update?sysparm_transaction_scope=${encodeURIComponent(this._dashboardScope)}`
                : '/api/now/aiux/dashboard/update';

            const response = await snHttp.post(updateUrl, { data: payload });

            if (!response.ok) throw new Error(i18n.getMessage('Request failed: {0}', [response.statusText]));

            this._originalSubtitle = this._subtitleInput;
            const iframe = this.shadowRoot?.querySelector('.preview-frame');
            const currentHref = iframe?.contentWindow?.location?.href ?? '';
            const isSafePath = currentHref.startsWith(window.location.origin + this.previewUrl);
            if (iframe?.contentWindow && isSafePath) {
                iframe.contentWindow.location.reload();
            }
            notifications.addSuccessNotification(i18n.getMessage('Canvas configuration saved successfully'));
        } catch (error) {
            notifications.addErrorNotification(i18n.getMessage('Failed to save configuration'));
        } finally {
            this._saving = false;
        }
    }

    _iconSun() {
        return html`<svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>`;
    }

    _iconMoon() {
        return html`<svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
        >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>`;
    }

    _iconDesktop() {
        return html`<svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
        >
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
        </svg>`;
    }

    _iconMobile() {
        return html`<svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
        >
            <rect x="5" y="2" width="14" height="20" rx="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>`;
    }

    _iconExternalLink() {
        return html`<svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
        >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
        </svg>`;
    }

    _renderPreview() {
        if (!this.previewUrl) {
            return html` <div class="preview-placeholder">${i18n.getMessage('No dashboard preview available')}</div> `;
        }
        const consistentH = Math.round(800 * this._scale);

        let iframeW, iframeH, scale, offsetX;
        if (this._previewDevice === 'mobile') {
            iframeW = 390;
            iframeH = 844;
            scale = consistentH / 844;
            offsetX = Math.round((1280 * this._scale - iframeW * scale) / 2);
        } else {
            iframeW = 1280;
            iframeH = 800;
            scale = this._scale;
            offsetX = 0;
        }

        return html`
            <div class="preview-inner" style="height: ${consistentH}px;">
                <iframe
                    class="preview-frame"
                    src="${this.previewUrl}"
                    title="${i18n.getMessage('Canvas dashboard preview')}"
                    style="width: ${iframeW}px; height: ${iframeH}px; transform: translateX(${offsetX}px) scale(${scale}); transform-origin: top left;"
                    @load="${(e) => this._onIframeLoad(e)}"
                ></iframe>
            </div>
        `;
    }

    render() {
        return html`
            <div class="root">
                <div class="body">
                    <!-- Header -->
                    <div class="hdr">
                        <h2 class="hdr-title">${i18n.getMessage('Canvas config console')}</h2>
                        <p class="hdr-desc">
                            ${i18n.getMessage(
                                'Canvases organize information that help employees get work done. You can use the pre-configured description and layout or make customizations.',
                            )}
                        </p>
                    </div>

                    <!-- Two-column layout -->
                    <div class="layout">
                        <!-- Left: config fields -->
                        <div class="col-left">
                            <p class="section-label">${i18n.getMessage('Subtitle')}</p>
                            <textarea
                                class="subtitle-textarea"
                                aria-label="${i18n.getMessage('Canvas subtitle text')}"
                                .value="${this._subtitleInput}"
                                @input="${(e) => (this._subtitleInput = e.target.value)}"
                                placeholder="${i18n.getMessage(
                                    'Your space to organize the things that are important to you.',
                                )}"
                            ></textarea>

                            <hr class="divider" />

                            <p class="section-label">${i18n.getMessage('Default view')}</p>
                            <div class="default-view-row">
                                <svg
                                    class="dv-icon"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="80"
                                    height="80"
                                    viewBox="0 0 32 32"
                                    fill="none"
                                >
                                    <g clip-path="url(#clip0_5256_27379)">
                                        <path
                                            fill-rule="evenodd"
                                            clip-rule="evenodd"
                                            d="M28 4H1V23C1 24.1046 1.89543 25 3 25H14.0291L12.1765 17.9375C11.2555 14.4266 14.4876 11.2332 18.0156 12.1683L28 14.8147V4Z"
                                            fill="url(#paint0_radial_5256_27379)"
                                        />
                                        <path
                                            fill-rule="evenodd"
                                            clip-rule="evenodd"
                                            d="M3 3C1.34315 3 0 4.34315 0 6V12V23C0 24.6569 1.34315 26 3 26H14.2914L13.7667 24H3C2.44772 24 2 23.5523 2 23V13H13.8683C14.9765 12.1425 16.4675 11.758 18.0156 12.1683L21.1534 13H27V14.5497L29 15.0798V12V6C29 4.34315 27.6569 3 26 3H3ZM2 11H27V6C27 5.44772 26.5523 5 26 5H3C2.44772 5 2 5.44772 2 6V11ZM4 8C4 7.44772 4.44772 7 5 7H16C16.5523 7 17 7.44772 17 8C17 8.55228 16.5523 9 16 9H5C4.44772 9 4 8.55228 4 8ZM23.5 7C23.2239 7 23 7.22386 23 7.5V8.5C23 8.77614 23.2239 9 23.5 9H24.5C24.7761 9 25 8.77614 25 8.5V7.5C25 7.22386 24.7761 7 24.5 7H23.5ZM19 7.5C19 7.22386 19.2239 7 19.5 7H20.5C20.7761 7 21 7.22386 21 7.5V8.5C21 8.77614 20.7761 9 20.5 9H19.5C19.2239 9 19 8.77614 19 8.5V7.5Z"
                                            fill="#D9D9D9"
                                        />
                                        <path
                                            fill-rule="evenodd"
                                            clip-rule="evenodd"
                                            d="M3 3C1.34315 3 0 4.34315 0 6V12V23C0 24.6569 1.34315 26 3 26H14.2914L13.7667 24H3C2.44772 24 2 23.5523 2 23V13H13.8683C14.9765 12.1425 16.4675 11.758 18.0156 12.1683L21.1534 13H27V14.5497L29 15.0798V12V6C29 4.34315 27.6569 3 26 3H3ZM2 11H27V6C27 5.44772 26.5523 5 26 5H3C2.44772 5 2 5.44772 2 6V11ZM4 8C4 7.44772 4.44772 7 5 7H16C16.5523 7 17 7.44772 17 8C17 8.55228 16.5523 9 16 9H5C4.44772 9 4 8.55228 4 8ZM23.5 7C23.2239 7 23 7.22386 23 7.5V8.5C23 8.77614 23.2239 9 23.5 9H24.5C24.7761 9 25 8.77614 25 8.5V7.5C25 7.22386 24.7761 7 24.5 7H23.5ZM19 7.5C19 7.22386 19.2239 7 19.5 7H20.5C20.7761 7 21 7.22386 21 7.5V8.5C21 8.77614 20.7761 9 20.5 9H19.5C19.2239 9 19 8.77614 19 8.5V7.5Z"
                                            fill="url(#paint1_radial_5256_27379)"
                                        />
                                        <path
                                            d="M15.0883 17.183C14.749 15.8895 15.9398 14.713 17.2396 15.0575L29.8389 18.3971C31.2454 18.7699 31.4114 20.6869 30.0896 21.2929L24.7175 23.756C24.3382 23.9299 24.0338 24.2324 23.8589 24.6093L21.3201 30.0786C20.7085 31.3961 18.7718 31.2252 18.4035 29.8212L15.0883 17.183Z"
                                            fill="url(#paint2_radial_5256_27379)"
                                        />
                                        <path
                                            fill-rule="evenodd"
                                            clip-rule="evenodd"
                                            d="M14.1176 17.4345C13.5844 15.4018 15.4556 13.553 17.4981 14.0944L30.0975 17.434C32.4114 18.0473 32.6844 21.201 30.5099 22.198L25.1378 24.6611C24.9753 24.7356 24.8448 24.8653 24.7698 25.0268L22.2311 30.4961C21.2249 32.6637 18.0387 32.3825 17.4328 30.0726L14.1176 17.4345ZM16.981 16.0207C16.424 15.8731 15.9137 16.3773 16.0591 16.9316L19.3743 29.5698C19.505 30.068 20.1922 30.1286 20.4092 29.6611L22.9479 24.1918C23.2228 23.5996 23.7012 23.1241 24.2972 22.8509L29.6693 20.3878C30.1383 20.1728 30.0795 19.4925 29.5804 19.3602L16.981 16.0207Z"
                                            fill="url(#paint3_radial_5256_27379)"
                                        />
                                    </g>
                                    <defs>
                                        <radialGradient
                                            id="paint0_radial_5256_27379"
                                            cx="0"
                                            cy="0"
                                            r="1"
                                            gradientTransform="matrix(29 25.5 -36.9717 11.1509 0.500001 3.5)"
                                            gradientUnits="userSpaceOnUse"
                                        >
                                            <stop stop-color="#BCF6B2" />
                                            <stop offset="0.549047" stop-color="#B4C3FF" />
                                            <stop offset="1" stop-color="#4C82F4" />
                                        </radialGradient>
                                        <radialGradient
                                            id="paint1_radial_5256_27379"
                                            cx="0"
                                            cy="0"
                                            r="1"
                                            gradientTransform="matrix(31.9 18.0714 -31.9 18.0714 5.70416e-06 4.88672)"
                                            gradientUnits="userSpaceOnUse"
                                        >
                                            <stop stop-color="#54C53F" />
                                            <stop offset="0.415" stop-color="#3F60E5" />
                                            <stop offset="1" stop-color="#254284" />
                                        </radialGradient>
                                        <radialGradient
                                            id="paint2_radial_5256_27379"
                                            cx="0"
                                            cy="0"
                                            r="1"
                                            gradientUnits="userSpaceOnUse"
                                            gradientTransform="translate(13.5 14.5) rotate(43.9949) scale(20.1556 20.1556)"
                                        >
                                            <stop stop-color="#FFE652" />
                                            <stop offset="0.624507" stop-color="#62D84E" />
                                            <stop offset="1" stop-color="#00BCCA" />
                                        </radialGradient>
                                        <radialGradient
                                            id="paint3_radial_5256_27379"
                                            cx="0"
                                            cy="0"
                                            r="1"
                                            gradientUnits="userSpaceOnUse"
                                            gradientTransform="translate(13.5 13.5) rotate(46.7357) scale(23.3452 23.3452)"
                                        >
                                            <stop stop-color="#CCB31C" />
                                            <stop offset="0.624507" stop-color="#49A839" />
                                            <stop offset="1" stop-color="#0D6A72" />
                                        </radialGradient>
                                        <clipPath id="clip0_5256_27379">
                                            <rect width="32" height="32" fill="white" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                <div class="dv-text-col">
                                    <p>
                                        ${i18n.getMessage(
                                            'The default view shows to all users the first time they visit their canvas, before they personalize it. You can edit it now and in the future.',
                                        )}
                                    </p>
                                    <a
                                        href="${this._dashboardSysId
                                            ? `aiux/builder/edit/dashboard/${this._dashboardSysId}`
                                            : '#'}"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="edit-btn"
                                        aria-label="${i18n.getMessage('Edit default view, opens in new tab')}"
                                    >
                                        ${i18n.getMessage('Edit default view')} ${this._iconExternalLink()}
                                    </a>
                                </div>
                            </div>
                        </div>

                        <!-- Right: preview -->
                        <div class="col-right">
                            <div class="preview-card" role="region" aria-label="${i18n.getMessage('Canvas preview')}">
                                <div class="preview-toolbar">
                                    <span class="preview-title">${i18n.getMessage('Preview')}</span>
                                    <div
                                        class="toggle-group"
                                        role="group"
                                        aria-label="${i18n.getMessage('Preview theme')}"
                                    >
                                        <button
                                            class="tog ${this._previewTheme === 'light' ? 'active' : ''}"
                                            @click="${() => this._setTheme('light')}"
                                            aria-pressed="${this._previewTheme === 'light'}"
                                        >
                                            ${this._iconSun()} ${i18n.getMessage('Light')}
                                        </button>
                                        <button
                                            class="tog ${this._previewTheme === 'dark' ? 'active' : ''}"
                                            @click="${() => this._setTheme('dark')}"
                                            aria-pressed="${this._previewTheme === 'dark'}"
                                        >
                                            ${this._iconMoon()} ${i18n.getMessage('Dark')}
                                        </button>
                                    </div>
                                    <div
                                        class="toggle-group"
                                        role="group"
                                        aria-label="${i18n.getMessage('Preview device')}"
                                    >
                                        <button
                                            class="tog ${this._previewDevice === 'desktop' ? 'active' : ''}"
                                            @click="${() => (this._previewDevice = 'desktop')}"
                                            aria-pressed="${this._previewDevice === 'desktop'}"
                                        >
                                            ${this._iconDesktop()} ${i18n.getMessage('Desktop')}
                                        </button>
                                        <button
                                            class="tog ${this._previewDevice === 'mobile' ? 'active' : ''}"
                                            @click="${() => (this._previewDevice = 'mobile')}"
                                            aria-pressed="${this._previewDevice === 'mobile'}"
                                        >
                                            ${this._iconMobile()} ${i18n.getMessage('Mobile')}
                                        </button>
                                    </div>
                                </div>
                                <div class="preview-content">${this._renderPreview()}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="save-row">
                    <button
                        type="button"
                        class="save-btn"
                        @click="${this.handleSave}"
                        ?disabled="${this._saving || this._subtitleInput === this._originalSubtitle}"
                        aria-busy="${this._saving}"
                    >
                        ${this._saving ? i18n.getMessage('Saving...') : i18n.getMessage('Save')}
                    </button>
                </div>
            </div>
        `;
    }
}
