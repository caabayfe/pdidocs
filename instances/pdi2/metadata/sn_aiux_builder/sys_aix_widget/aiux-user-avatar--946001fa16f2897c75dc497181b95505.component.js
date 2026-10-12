import { html, css } from 'lit';
import { AIUXWidgetElement } from '@servicenow/aiux-components-core';
import { locationService, i18n } from '@servicenow/aiux-services';
import { snHttp } from '@servicenow/aiux-utils';

class AiuxBuilderUserAvatar extends AIUXWidgetElement {
    static properties = {
        sysId: {
            type: String,
            attribute: 'sys-id',
        },
        size: {
            type: String,
        }, // 'sm', 'md', 'lg', 'xl', 'xxl'
        userData: {
            type: Object,
        },
        loading: {
            state: true,
        },
        error: {
            state: true,
        },
        showUserName: {
            type: Boolean,
        },
        navigateToUserProfile: {
            type: Boolean,
        },
        showOnlineIndicator: {
            type: Boolean,
        },
    };

    static styles = css`
        :host {
            display: inline-block;
        }

        .avatar {
            display: inline-block;
            position: relative;
        }

        .avatar-img {
            width: 1.5rem;
            height: 1.5rem;
            max-width: 1.5rem;
            max-height: 1.5rem;
            border-radius: 50%;
            object-fit: cover;
        }

        .avatar-placeholder {
            width: 1.5rem;
            height: 1.5rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 1rem;
            text-transform: uppercase;
            color: var(--color-neutral-content, #fff);
            background-color: var(--color-neutral, #1e293b);
        }

        /* Size variants */
        .avatar.sm .avatar-img,
        .avatar.sm .avatar-placeholder {
            width: 1.25rem;
            height: 1.25rem;
            max-width: 1.25rem;
            max-height: 1.25rem;
            font-size: 0.625rem;
        }

        .avatar.md .avatar-img,
        .avatar.md .avatar-placeholder {
            width: 1.5rem;
            height: 1.5rem;
            max-width: 1.5rem;
            max-height: 1.5rem;
            font-size: 0.625rem;
        }

        .avatar.lg .avatar-img,
        .avatar.lg .avatar-placeholder {
            width: 2rem;
            height: 2rem;
            max-width: 2rem;
            max-height: 2rem;
            font-size: 0.75rem;
        }

        .avatar.xl .avatar-img,
        .avatar.xl .avatar-placeholder {
            width: 2.5rem;
            height: 2.5rem;
            max-width: 2.5rem;
            max-height: 2.5rem;
            font-size: 0.875rem;
        }

        .avatar.xxl .avatar-img,
        .avatar.xxl .avatar-placeholder {
            width: 3rem;
            height: 3rem;
            max-width: 3rem;
            max-height: 3rem;
            font-size: 1.125rem;
        }

        /* Skeleton loader */
        .skeleton-loader {
            width: 1.5rem;
            height: 1.5rem;
            border-radius: 50%;
            background: linear-gradient(
                90deg,
                var(--color-base-200, #f1f5f9) 0%,
                var(--color-base-300, #e2e8f0) 50%,
                var(--color-base-200, #f1f5f9) 100%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s ease-in-out infinite;
        }

        .avatar.sm .skeleton-loader {
            width: 1.25rem;
            height: 1.25rem;
        }
        .avatar.lg .skeleton-loader {
            width: 2rem;
            height: 2rem;
        }
        .avatar.xl .skeleton-loader {
            width: 2.5rem;
            height: 2.5rem;
        }
        .avatar.xxl .skeleton-loader {
            width: 3rem;
            height: 3rem;
        }

        @keyframes shimmer {
            0% {
                background-position: 200% 0;
            }
            100% {
                background-position: -200% 0;
            }
        }

        .error-message {
            color: var(--color-error, #ef4444);
            font-size: 0.875rem;
        }

        /* Online indicator */
        .online-indicator {
            position: absolute;
            inset-block-end: 0px;
            inset-inline-end: 0px;
            width: 0.375rem;
            height: 0.375rem;
            background-color: var(--color-emerald-500, #009b60);
            outline: 1px solid var(--color-base-100, white);
            border-radius: 50%;
        }

        .online-indicator.sm {
            width: 0.3125rem;
            height: 0.3125rem;
        }

        .online-indicator.lg {
            width: 0.5rem;
            height: 0.5rem;
        }

        .online-indicator.xl {
            width: 0.625rem;
            height: 0.625rem;
        }

        .online-indicator.xxl {
            width: 0.75rem;
            height: 0.75rem;
        }

        /* Avatar container with username */
        .avatar-container {
            display: flex;
            align-items: center;
            gap: calc(var(--spacing, 0.25rem) * 2);
        }

        .username {
            font-size: 1rem;
            font-weight: var(--font-weight-normal);
            color: var(--color-primary, #007b9e);
            cursor: pointer;
            text-decoration: none;
            transition: color 0.2s ease;
            background: none;
            border: none;
            padding: 0;
            font-family: inherit;
        }

        .username:hover,
        .username:focus-visible {
            color: var(--color-primary-focus, #0052a3);
            text-decoration: underline;
        }

        .username:focus-visible {
            outline: 2px solid var(--color-primary, #007b9e);
            outline-offset: 2px;
            border-radius: 2px;
        }

        .username-nolink {
            font-size: 1rem;
            font-weight: var(--font-weight-normal);
            color: var(--color-text-primary, #1e293b);
            cursor: default;
        }
    `;

    constructor() {
        super();
        this.sysId = '';
        this.size = 'md';
        this.userData = null;
        this.loading = false;
        this.error = null;
        this.showUserName = false;
        this.navigateToUserProfile = false;
        this.showOnlineIndicator = false;
        this._fetchToken = 0;
    }

    connectedCallback() {
        super.connectedCallback();
        // No producer dispatches this yet in this app; it's a refresh hook for
        // future callers (e.g. a profile-picture editor) — not dead code to prune.
        this._boundHandleAvatarUpdated = this._handleAvatarUpdated.bind(this);
        window.addEventListener('user-avatar-updated', this._boundHandleAvatarUpdated);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this._boundHandleAvatarUpdated) {
            window.removeEventListener('user-avatar-updated', this._boundHandleAvatarUpdated);
        }
    }

    _handleAvatarUpdated(event) {
        const eventUserId = event.detail?.userId;
        if (eventUserId && (eventUserId === this.sysId || eventUserId === this.userData?.document)) {
            this.userData = null;
            this.fetchUserData({ force: true });
        }
    }

    updated(changedProperties) {
        if (changedProperties.has('userData') && this.userData) {
            this.loading = false;
            this.error = null;
            return;
        }

        if (changedProperties.has('sysId')) {
            if (this.sysId) {
                this.userData = null;
                this.fetchUserData();
            } else {
                this.loading = false;
                this.error = null;
            }
        }
    }

    async fetchUserData({ force = false } = {}) {
        if (!this.sysId) return;
        if (!force && (this.userData || this.loading)) return;

        const fetchToken = ++this._fetchToken;
        this.loading = true;
        this.error = null;

        try {
            const response = await snHttp.get(`/api/now/live/profiles/sys_user.${this.sysId}`);
            if (fetchToken !== this._fetchToken) return;
            this.userData = response.data?.result || response.data;
        } catch (err) {
            if (fetchToken !== this._fetchToken) return;
            this.error = err.message;
        } finally {
            if (fetchToken === this._fetchToken) this.loading = false;
        }
    }

    getInitials(userData) {
        // Use initials from API if available, otherwise fallback to name-based logic
        if (userData?.initials) {
            return userData.initials;
        }

        const name = userData?.name?.trim();
        if (!name) return '?';

        const parts = name.split(' ').filter(Boolean);
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`;
        }
        return parts[0].substring(0, 2);
    }

    getAvatarUrl(userData) {
        if (!userData?.avatar) return null;

        const avatarPath = userData.avatar;
        if (avatarPath.startsWith('http')) return avatarPath;
        return avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;
    }

    getUserName(userData) {
        return userData?.name || i18n.getMessage('Unknown User');
    }

    isUserOnline(userData) {
        return userData?.presence?.status === 'online';
    }

    handleUsernameClick(e) {
        e.preventDefault();
        if (this.userData?.document) {
            locationService.navigate(`/profile/${this.userData.document}`);
        }
    }

    render() {
        if (this.loading) {
            return html`
                <div class="avatar ${this.size}" role="img" aria-label="${i18n.getMessage('Loading user avatar')}">
                    <div class="skeleton-loader"></div>
                </div>
            `;
        }

        if (this.error) {
            return html`
                <div class="avatar ${this.size}" role="img" aria-label="${i18n.getMessage('Error loading user avatar')}">
                    <div class="avatar-placeholder">!</div>
                </div>
            `;
        }

        if (!this.userData) {
            return html`
                <div class="avatar ${this.size}" role="img" aria-label="${i18n.getMessage('Unknown user')}">
                    <div class="avatar-placeholder">?</div>
                </div>
            `;
        }

        const avatarUrl = this.getAvatarUrl(this.userData);
        const userName = this.getUserName(this.userData);
        const initials = this.getInitials(this.userData);
        const isOnline = this.isUserOnline(this.userData);
        const avatarLabel = isOnline && this.showOnlineIndicator ? `${userName} (Online)` : userName;
        return html`
            <div class="avatar-container">
                <div class="avatar ${this.size}" role="img" aria-label="${avatarLabel}">
                    ${avatarUrl
                        ? html`<img class="avatar-img" src="${avatarUrl}" alt="" aria-hidden="true" />`
                        : html`<div class="avatar-placeholder" aria-hidden="true">${initials}</div>`}
                    ${isOnline && this.showOnlineIndicator
                        ? html`<div class="online-indicator ${this.size}" aria-hidden="true"></div>`
                        : ''}
                </div>
                ${this.showUserName && userName
                    ? this.navigateToUserProfile
                        ? html`<button type="button" class="username" @click="${this.handleUsernameClick}">${userName}</button>`
                        : html`<span class="username-nolink">${userName}</span>`
                    : ''}
            </div>
        `;
    }
}
