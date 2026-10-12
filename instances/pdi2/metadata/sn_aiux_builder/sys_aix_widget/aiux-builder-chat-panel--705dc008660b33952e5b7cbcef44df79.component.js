import { html, css, nothing } from 'lit';
import { AIUXWidgetElement } from '@servicenow/aiux-components-core';
import { i18n, locationService } from '@servicenow/aiux-services';

import { getUser } from '@servicenow/aiux-utils';
import '@servicenow/glide-widgets/sn_aiux_builder/aiux-omnibar';

/**
 * AIUX Builder Chat Panel v2
 *
 * Interactive chat panel for AI assistant with:
 * - Header with widget title
 * - Scrollable message thread with user/AI bubbles
 * - Accept/Decline action buttons on AI messages
 * - Sticky footer with compact omnibar (uses wb-omnibar)
 *
 * @fires wb-chat-submit - When user sends a message (detail: { prompt })
 * @fires wb-chat-action - When user clicks Accept/Decline (detail: { messageId, action })
 * @fires wb-chat-updated - When AI updates the widget (detail: { sysId, component, script, action })
 */
class AiuxBuilderChatPanel extends AIUXWidgetElement {
	static properties = {
		/** Title displayed in the header */
		widgetTitle: { type: String, attribute: 'widget-title' },
		/** Widget sys_id for AI updates */
		widgetSysId: { type: String, attribute: 'widget-sys-id' },
		/** Widget scope identifier (e.g. sn_ex_sp) for scoped API calls */
		widgetScope: { type: String, attribute: 'widget-scope' },
		/** User's display name for greeting */
		userName: { type: String, attribute: 'user-name' },
		/** Internal message list */
		_messages: { type: Array, state: true },
		/** AI thinking state */
		_thinking: { type: Boolean, state: true },
		/** Stream session active — set when createWidget hands off to the es-widget-skill-stream flow */
		_streaming: { type: Boolean, state: true },
		/** Read-only mode — disables sending messages */
		readOnly: { type: Boolean, attribute: 'read-only' },
	};

	constructor() {
		super();
		this.widgetTitle = i18n.getMessage('Widget');
		this.widgetSysId = '';
		this.widgetScope = '';
		this.userName = '';
		this._thinking = false;
		this._streaming = false;
		this._messages = [];
		this.readOnly = false;
	}

	// ── Session storage helpers ────────────────────────────────────────────

	static MAX_WIDGET_HISTORIES = 4;
	static MAX_MESSAGES_PER_WIDGET = 6;

	_getStorageKey(sysId) {
		const userPrefix = this.userSysId ? `${this.userSysId}-` : '';
		return `aiux-chat-${userPrefix}${sysId || this.widgetSysId}`;
	}

	_loadFromStorage() {
		if (!this.widgetSysId) return;
		try {
			const raw = sessionStorage.getItem(this._getStorageKey());
			if (raw) {
				this._messages = JSON.parse(raw);
			}
		} catch {
			// ignore parse/storage errors
		}
	}

	_saveToStorage() {
		if (!this.widgetSysId) return;
		try {
			const key = this._getStorageKey();
			if (this._messages.length > 0) {
				const trimmed = this._messages.slice(
					-AiuxBuilderChatPanel.MAX_MESSAGES_PER_WIDGET
				);
				sessionStorage.setItem(key, JSON.stringify(trimmed));
				this._touchLru(this.widgetSysId);
			} else {
				sessionStorage.removeItem(key);
			}
		} catch {
			// ignore quota/storage errors
		}
	}

	/**
	 * Maintain an LRU list of widget sysIds. Evicts the oldest
	 * entries when the list exceeds MAX_WIDGET_HISTORIES.
	 */
	_getLruKey() {
		return this.userSysId ? `aiux-chat-lru-${this.userSysId}` : 'aiux-chat-lru';
	}

	_touchLru(sysId) {
		try {
			const lruKey = this._getLruKey();
			const raw = sessionStorage.getItem(lruKey);
			let lru = raw ? JSON.parse(raw) : [];
			lru = lru.filter(id => id !== sysId);
			lru.push(sysId);
			while (lru.length > AiuxBuilderChatPanel.MAX_WIDGET_HISTORIES) {
				const oldest = lru.shift();
				sessionStorage.removeItem(this._getStorageKey(oldest));
			}
			sessionStorage.setItem(lruKey, JSON.stringify(lru));
		} catch {
			// ignore
		}
	}
	// ── Lifecycle ─────────────────────────────────────────────────────────

	connectedCallback() {
		super.connectedCallback();
		this._messages = [];
		this._fetchUserName();
		// If there's a pending prompt from the home omnibar, consume it;
		// otherwise restore any previous chat from sessionStorage.
		const hasPending = this._checkPendingPrompt();
		if (!hasPending && this.widgetSysId) {
			this._loadFromStorage();
		}
		window.addEventListener('es-widget-skill-stream', this._onWidgetSkillExecutionStream);
	}

	disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('es-widget-skill-stream', this._onWidgetSkillExecutionStream);
    }

	_fetchUserName() {
		if (this.userName) return;
		const { firstName = '', userId = '' } = getUser() || {};
		if (firstName) {
			this.userName = firstName;
			this.userSysId = userId;
		} else {
			this.userName = i18n.getMessage('there');
		}
	}
	/**
	 * Check for a pending prompt from the full omnibar (home page).
	 * If found, trigger the existing submit flow via _handleOmnibarSubmit.
	 * @returns {boolean} true if a pending prompt was found and consumed
	 */
	_checkPendingPrompt() {
		let pendingPrompt = null;
		try {
			pendingPrompt = sessionStorage.getItem('aiux-pending-prompt');
			if (pendingPrompt) {
				sessionStorage.removeItem('aiux-pending-prompt');
			}
		} catch {}
		if (!pendingPrompt) return false;

		// Wait for render so the component is fully ready, then submit
		this.updateComplete.then(() => {
			if (this.isConnected) {
				this._handleOmnibarSubmit({ detail: { prompt: pendingPrompt } });
			}
		});
		return true;
	}

	// ── Lifecycle: pre-render storage load ───────────────────────────────

	// Load chat history before the render so the thread shows immediately
	// with no flash of the empty/welcome state.
	willUpdate(changedProperties) {
		if (changedProperties.has('widgetSysId') && this.widgetSysId) {
			const previousId = changedProperties.get('widgetSysId');
			if (!previousId || previousId === '') {
				// Initial sysId assignment (page load or post-creation transition):
				// load from storage only when there are no in-memory messages so we
				// don't clobber an active creation-flow thread.
				if (this._messages.length === 0) {
					this._loadFromStorage();
				}
			} else {
				// Switching between widgets — clear then load the new widget's history.
				this._messages = [];
				this._loadFromStorage();
			}
		}
	}

	// ── After each update, scroll thread to bottom ────────────────────────

	updated(changedProperties) {
		this._scrollToBottom();
		if (changedProperties.has('_messages')) {
			this._saveToStorage();
		}
	}

	_scrollToBottom() {
		const thread = this.renderRoot.querySelector('.thread');
		if (thread) {
			thread.scrollTop = thread.scrollHeight;
		}
		// Scroll the last thinking card body if it exists, to ensure the active card content is streaming
		const thinkingCards = this.renderRoot.querySelectorAll('.thinking-card__body');
		const lastCard = thinkingCards[thinkingCards.length - 1];
		if (lastCard) {
			lastCard.scrollTop = lastCard.scrollHeight;
		}
	}

	// ── Error Helpers ─────────────────────────────────────────────────────

	/**
	 * Normalise an error payload into a user-facing message.
	 * Handles { error: { code, message } } objects, "CODE: message" legacy strings,
	 * and falls back to friendly copy for network / timeout failures.
	 */
	_friendlyError(err) {
		const errField = err?.error ?? err?.result?.error;
		if (errField && typeof errField === 'object' && errField.message) {
			return errField.message;
		}

		// Extract the error string from various shapes
		const raw =
			(typeof errField === 'string' ? errField : '') ||
			err?.message ||
			(typeof err === 'string' ? err : '');

		// Check for skill error codes: "CODE: message" — strip the code prefix
		const skillMatch = raw.match(/^[A-Z_]+:\s*(.+)/s);
		if (skillMatch) {
			return skillMatch[1].trim();
		}

		// Infrastructure error fallbacks
		const msg = raw.toLowerCase();
		const isTimeout = msg.includes('timeout') || msg.includes('timed out') || msg.includes('aborted');
		if (isTimeout) {
			return i18n.getMessage('The request took too long. Please try again with a simpler prompt.');
		}
		const isNetwork = msg.includes('network') || msg.includes('failed to fetch') || msg.includes('err_connection');
		if (isNetwork) {
			return i18n.getMessage('A network error occurred. Please check your connection and try again.');
		}

		if (raw) return raw;
		return i18n.getMessage('Something went wrong. Please try again.');
	}

	// ── Handlers ──────────────────────────────────────────────────────────

	async _handleOmnibarSubmit(e) {
		const text = e.detail?.prompt?.trim();
		if (!text || this._thinking) return;

		// Add user message
		const userMsg = { id: Date.now().toString(), role: 'user', text };
		this._messages = [...this._messages, userMsg];
		this._thinking = true;

		// Dispatch event to parent
		this.dispatchEvent(new CustomEvent('wb-chat-submit', {
			detail: { prompt: text },
			bubbles: true,
			composed: true,
		}));

		// Call AI via entity service
		try {
			const service = window.aiuxBuilderEntityService;
			if (!service?.createWidget) {
				throw new Error(i18n.getMessage('Entity service not available'));
			}
			const result = await service.createWidget(text, this.widgetSysId || undefined);

			if (result?.success && result?.message === 'Capability executed in Streaming mode' ){
				// result will be handled via _onWidgetSkillExecutionStream;
				// _thinking stays true until the stream ends so a second submit can't interleave
				this._streaming = true;
				this._messages = [...this._messages, {
					id: Date.now().toString(),
					role: 'assistant',
					text: i18n.getMessage('Reasoning through your request...\n'),
					type: 'thinking',
				}];

				return;
			}

			if (result?.success) {
				// Dispatch immediately so editor refreshes with new code
				this.dispatchEvent(new CustomEvent('wb-chat-updated', {
					detail: {
						sysId: result.sysId || this.widgetSysId,
						component: result.component,
						script: result.script,
						action: result.action,
					},
					bubbles: true,
					composed: true,
				}));

				// Creation flow (no existing sysId): add confirmation and persist
				// under the new sysId key so it survives the navigation redirect
				if (!this.widgetSysId) {
					const confirmMsg = {
						id: (Date.now() + 1).toString(),
						role: 'assistant',
						text: i18n.getMessage('Your widget has been created. Would you like to change anything?'),
					};
					this._messages = [...this._messages, confirmMsg];
					if (result.sysId) {
						try {
							const trimmed = this._messages.slice(
								-AiuxBuilderChatPanel.MAX_MESSAGES_PER_WIDGET
							);
							sessionStorage.setItem(
								this._getStorageKey(result.sysId),
								JSON.stringify(trimmed)
							);
							this._touchLru(result.sysId);
							// Persist fresh component so preview can use
							// refreshFromSource after the navigation redirect
							if (result.component) {
								sessionStorage.setItem(
									`aiux-pending-component-${result.sysId}`,
									result.component
								);
							}
						} catch {}
					}
				} else {
					// Existing widget edit: show AI response with accept/decline
					const aiMsg = {
						id: (Date.now() + 1).toString(),
						role: 'assistant',
						text: i18n.getMessage('I\'ve applied the changes. Does that look right?'),
						actions: [
							{ label: i18n.getMessage('Reject changes'), variant: 'secondary', key: 'decline' },
							{ label: i18n.getMessage('Accept changes'), variant: 'primary', key: 'accept' },
						],
						_result: result,
						_acceptText: i18n.getMessage('Changes applied. To make another update, ask a new question.'),
						_declineText: i18n.getMessage('Changes rejected. To make another update, ask a new question.'),
					};
					this._messages = [...this._messages, aiMsg];
				}
			} else {
				const aiMsg = {
					id: (Date.now() + 1).toString(),
					role: 'assistant',
					text: this._friendlyError(result),
					isError: true,
					errorCode: result?.error?.code || result?.code || '',
				};
				this._messages = [...this._messages, aiMsg];
				this.dispatchEvent(new CustomEvent('wb-chat-error', { bubbles: true, composed: true }));
			}
		} catch (err) {
			const aiMsg = {
				id: (Date.now() + 1).toString(),
				role: 'assistant',
				text: this._friendlyError(err),
				isError: true,
				errorCode: err?.code || err?.error?.code || '',
			};
			this._messages = [...this._messages, aiMsg];
			this.dispatchEvent(new CustomEvent('wb-chat-error', { bubbles: true, composed: true }));
		} finally {
			if (!this._streaming) this._thinking = false;
		}
	}

	_onWidgetSkillExecutionStream = (ambMessage) => {
		const { data } = ambMessage?.detail || {};

		const featureId = data?.features ? Object.keys(data.features)[0] : null;
		const featureResult = featureId ? data.features[featureId]?.result : null;
		const rawModelOutput = featureResult?.status === 'error'
			? { stopReason: 'invocation_error' }
			: featureResult?.raw_model_output ?? null;

		if (["invocation_error", "max_tokens", "stop_sequence", "refusal", "model_context_window_exceeded"].includes(rawModelOutput?.stopReason)) {
			// "invocation_error" + Claude specific stop reasons : https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons
			const reasonText = rawModelOutput.stopReason.replace(/_/g, ' ');
			const modelText = Array.isArray(rawModelOutput?.message?.content)
				? rawModelOutput.message.content.find(b => b.text && !b.reasoningContent)?.text
				: (typeof rawModelOutput?.message === 'string' ? rawModelOutput.message : null);
			const errorMessage =
				featureResult?.error?.message ||
				featureResult?.message ||
				(typeof featureResult?.error === 'string' ? featureResult.error : '') ||
				modelText ||
				i18n.getMessage('Generation failed due to reason: {0}.', [reasonText]);
			this._messages = [...this._messages, {
				id: Date.now().toString(),
				role: 'assistant',
				text: errorMessage,
				isError: true,
				errorCode: featureResult?.error?.code || rawModelOutput.stopReason,
			}];
			this.dispatchEvent(new CustomEvent('wb-chat-error', { bubbles: true, composed: true }));
			if (this.isConnected) {
				this._thinking = false;
				this._streaming = false;
			}
			return;
		}
		if( rawModelOutput?.stopReason === "end_turn" && data?.status === "completed" ) {
			this._onWidgetSkillExecutionStreamEnd(rawModelOutput?.message);
		}

		if (data.contentType && data.contentType === 'stream') {
			// safe to ignore message_start & message_stop
			const tagPattern = /<(thinking|text)>([\s\S]*?)<\/\1>/g;
			const think_stream = [];
			let match;
			const content = data.content.replace(/<signature>[^<]*<\/signature>/g,''); // remove signature if exists

			while ((match = tagPattern.exec(content)) !== null) {
				think_stream.push({
				type: match[1],
				message: match[2],
				sent_by: data.sent_by,
				});
			}

			for (const entry of think_stream) {
				const msg = {
					id: Date.now().toString(),
					role: entry.type === 'thinking' ? 'assistant' : 'user',
					text: entry.message,
					type: entry.type,
				};

				const current = this._messages || [];
				const lastMsg = current[current.length - 1];
				// last message & new message have the same type => append to last message
				if (lastMsg?.type === msg.type) {
					this._messages = [...current.slice(0, -1), { ...lastMsg, text: lastMsg.text + msg.text }];
				} else {
					this._messages = [...current, msg];
				}
			}
		}

	}

	// Extracts raw text from the final stream message.
	// Fallback chain: structured content blocks → XML string → last accumulated text message
	_extractRawText(message) {
		let rawText;
		if (message?.content) {
			// Exclude reasoningContent (thinking) blocks — only pick the text block
			const textBlock = message.content.find(b => b.text !== undefined && b.reasoningContent === undefined);
			rawText = textBlock?.text;
		} else if (typeof message === 'string') {
			const xmlMatch = /<text>([\s\S]*?)<\/text>/.exec(message);
			rawText = xmlMatch ? xmlMatch[1] : message;
		}
		if (!rawText) {
			const accumulated = [...(this._messages || [])].reverse().find(m => m.type === 'text');
			rawText = accumulated?.text;
		}
		return rawText;
	}

	// Parses and validates the widget JSON from raw LLM text.
	// Mirrors server-side _extractJson: fast path → strip fences → find outermost {}
	_parseWidgetJson(rawText) {
		let cleaned = rawText.trim();
		if (cleaned.charAt(0) !== '{') {
			cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '').trim();
		}
		if (cleaned.charAt(0) !== '{') {
			const firstBrace = cleaned.indexOf('{');
			const lastBrace = cleaned.lastIndexOf('}');
			if (firstBrace === -1 || lastBrace <= firstBrace) throw new Error('No JSON object found');
			cleaned = cleaned.substring(firstBrace, lastBrace + 1);
		}

		let widgetJson = JSON.parse(cleaned);

		if (widgetJson?.type === 'error') {
			const aiMessage =
				widgetJson.error?.message ||
				widgetJson.message ||
				(typeof widgetJson.error === 'string' ? widgetJson.error : '') ||
				i18n.getMessage('AI returned an error response.');
			const aiErr = new Error(aiMessage);
			aiErr.code = widgetJson.error?.code || widgetJson.code || '';
			throw aiErr;
		}
		if (widgetJson?.type && widgetJson?.data && typeof widgetJson.data === 'object') {
			widgetJson = widgetJson.data;
		}
		if (!widgetJson?.component) {
			throw new Error(i18n.getMessage('AI response is missing required widget fields.'));
		}

		// Unescape \${ → ${ (LLM escapes to avoid breaking JSON strings)
		['component', 'script'].forEach(field => {
			if (typeof widgetJson[field] === 'string') {
				widgetJson[field] = widgetJson[field].replace(/\\\$\{/g, '${');
			}
		});

		// Coerce objects → JSON strings, booleans → strings for the widget API
		const fields = [
			'id', 'name', 'description', 'best_for', 'category',
			'roles', 'template', 'dependent_widget_ids',
			'component', 'script', 'demo_data',
			'chat_compatible', 'interactive_view_compatible', 'servicenow',
			'client_tools', 'input_schema', 'required_translations',
		];
		const widgetData = {};
		for (const field of fields) {
			const val = widgetJson[field];
			if (val === undefined) continue;
			widgetData[field] = typeof val === 'object' ? JSON.stringify(val) : typeof val === 'boolean' ? String(val) : val;
		}
		return widgetData;
	}

	async _onWidgetSkillExecutionStreamEnd(message) {
		try {
			const rawText = this._extractRawText(message);
			if (!rawText) throw new Error(i18n.getMessage('No widget content in AI response.'));

			let widgetData;
			try {
				widgetData = this._parseWidgetJson(rawText);
			} catch (parseErr) {
				// Structured AI errors (incl. top-level message without code) pass through unchanged.
				if (!(parseErr instanceof SyntaxError)) throw parseErr;
				// JSON.parse failed — try to pull out the AI's "message" field directly so the user
				// sees the actionable text instead of a generic parse-fail message.
				const msgMatch = rawText.match(/"message"\s*:\s*"((?:\\.|[^"\\])*)"/);
				if (msgMatch) {
					const aiErr = new Error(msgMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n'));
					const codeMatch = rawText.match(/"code"\s*:\s*"([A-Z_]+)"/);
					if (codeMatch) aiErr.code = codeMatch[1];
					throw aiErr;
				}
				throw new Error(i18n.getMessage('Failed to parse widget response from AI.'));
			}

			const service = window.aiuxBuilderEntityService;
			if (!service) throw new Error(i18n.getMessage('Entity service not available.'));

			const isUpdate = !!this.widgetSysId;
			const savedRecord = isUpdate
				? await service.updateRecord('sys_aix_widget', this.widgetSysId, widgetData, {
					forceTableApi: true,
					transactionScope: this.widgetScope || undefined,
				})
				: await service.create('sys_aix_widget', widgetData);

			const savedSysId = isUpdate ?  this.widgetSysId : (typeof savedRecord === 'string' ? savedRecord : savedRecord?.sys_id?.value ?? savedRecord?.sys_id);

			this.dispatchEvent(new CustomEvent('wb-chat-updated', {
				detail: { sysId: savedSysId, component: widgetData.component, script: widgetData.script, action: isUpdate ? 'updated' : 'created' },
				bubbles: true,
				composed: true,
			}));

			if (isUpdate) {
				this._messages = [...this._messages, {
					id: Date.now().toString(),
					role: 'assistant',
					text: i18n.getMessage("I've applied the changes. Does that look right?"),
					actions: [
						{ label: i18n.getMessage('Reject changes'), variant: 'secondary', key: 'decline' },
						{ label: i18n.getMessage('Accept changes'), variant: 'primary', key: 'accept' },
					],
					_result: savedRecord,
					_acceptText: i18n.getMessage('Changes applied. To make another update, ask a new question.'),
					_declineText: i18n.getMessage('Changes rejected. To make another update, ask a new question.'),
				}];
			} else if (savedSysId) {
				try {
					this._messages = [...this._messages, {
						id: Date.now().toString(),
						role: 'assistant',
						text: i18n.getMessage('Your widget has been created. Would you like to change anything?'),
					}];
					const trimmed = this._messages.slice(-AiuxBuilderChatPanel.MAX_MESSAGES_PER_WIDGET);
					sessionStorage.setItem(this._getStorageKey(savedSysId), JSON.stringify(trimmed));
					this._touchLru(savedSysId);
					if (widgetData.component) {
						sessionStorage.setItem(`aiux-pending-component-${savedSysId}`, widgetData.component);
					}
				} catch {}
			}
		} catch (err) {
			this._messages = [...this._messages, {
				id: Date.now().toString(),
				role: 'assistant',
				text: this._friendlyError(err),
				isError: true,
				errorCode: err?.code || err?.error?.code || '',
			}];
			if (this.isConnected) {
				this.dispatchEvent(new CustomEvent('wb-chat-error', { bubbles: true, composed: true }));
			}
		} finally {
			if (this.isConnected) {
				this._thinking = false;
				this._streaming = false;
			}
		}
	}

	async _handleAction(msgId, key) {
		const msg = this._messages.find(m => m.id === msgId);
		this._messages = this._messages.map((m) => {
			if (m.id !== msgId) return m;
			return { ...m, actions: undefined, _resolved: key };
		});
		this.dispatchEvent(new CustomEvent('wb-chat-action', {
			detail: { messageId: msgId, action: key, result: msg?._result || null },
			bubbles: true,
			composed: true,
		}));

		// On decline, revert the widget to its previous version
		if (key === 'decline' && this.widgetSysId) {
			try {
				const service = window.aiuxBuilderEntityService;
				if (!service?.revertWidget) {
					throw new Error(i18n.getMessage('Entity service not available'));
				}
				const revertResult = await service.revertWidget(this.widgetSysId);
				const isRevertSuccess = revertResult === true || revertResult?.success || revertResult?.result === true;
				if (isRevertSuccess) {
					const reverted = await service.get('sys_aix_widget', this.widgetSysId);
					const str = (v) => (v?.value != null ? String(v.value) : (v != null ? String(v) : ''));
					this.dispatchEvent(new CustomEvent('wb-chat-updated', {
						detail: {
							sysId: this.widgetSysId,
							component: str(reverted?.component),
							script: str(reverted?.script),
							action: 'reverted',
						},
						bubbles: true,
						composed: true,
					}));
				} else {
					const errMsg = {
						id: (Date.now() + 2).toString(),
						role: 'assistant',
						text: this._friendlyError(revertResult),
						isError: true,
						errorCode: revertResult?.error?.code || '',
					};
					this._messages = [...this._messages, errMsg];
					return;
				}
			} catch (err) {
				const errMsg = {
					id: (Date.now() + 2).toString(),
					role: 'assistant',
					text: this._friendlyError(err),
					isError: true,
					errorCode: err?.code || err?.error?.code || '',
				};
				this._messages = [...this._messages, errMsg];
				return;
			}
		}

		// Add follow-up assistant message
		const followUpText = key === 'accept' ? msg?._acceptText : msg?._declineText;
		if (followUpText) {
			const followUp = {
				id: (Date.now() + 2).toString(),
				role: 'assistant',
				text: followUpText,
			};
			this._messages = [...this._messages, followUp];
		}
	}

	_handleBack() {
		this.dispatchEvent(new CustomEvent('wb-chat-back', { bubbles: true, composed: true }));
	}

	// ── Render helpers ────────────────────────────────────────────────────

	_renderHeader() {
		const isLoading = !this.widgetTitle || this.widgetTitle === 'Widget';
		return html`
			<header class="chat-header">
				<button class="back-btn" @click=${this._handleBack} aria-label="${i18n.getMessage('Back to widgets')}">
					<aiux-icon name="arrow-left" size="md"></aiux-icon>
				</button>
				${isLoading
					? html`<span class="chat-title-skeleton"></span>`
					: html`<span class="chat-title">${this.widgetTitle}</span>`
				}
			</header>
		`;
	}

	_renderUserMessage(msg) {
		return html`
			<div class="msg-row msg-row--user" role="listitem">
				<div class="bubble-user" aria-label="${i18n.getMessage('Your message: {0}', [msg.text])}">
					${msg.text}
				</div>
			</div>
		`;
	}

	_renderErrorMessage(msg) {
		const title = msg.errorCode || i18n.getMessage('Error');
		return html`
			<div class="msg-row msg-row--assistant" role="listitem">
				<div class="error-card" role="alert">
					<div class="error-card__header">
						<aiux-icon name="hexagon-exclamation-outline" size="md" class="error-card__icon"></aiux-icon>
						<span class="error-card__title" title="${title}">${title}</span>
					</div>
					<p class="error-card__body">${msg.text}</p>
				</div>
			</div>
		`;
	}

	_renderAssistantMessage(msg) {
		if (msg.isError) {
			return this._renderErrorMessage(msg);
		}

		const resolvedLabel =
			msg._resolved === 'accept'
				? i18n.getMessage('Accept')
				: msg._resolved === 'decline'
				? i18n.getMessage('Reject')
				: '';

		return html`
			<div class="msg-row msg-row--assistant" role="listitem">
				${msg.text ? html`<p class="assistant-text">${msg.text}</p>` : nothing}
				${msg.actions
					? html`
							<div class="msg-actions">
								${msg.actions.map(
									(a) => html`
										<button
											class="aiux-btn aiux-btn-sm ${a.variant === 'primary' ? 'aiux-btn-neutral' : 'aiux-btn-ghost'}"
											@click=${() => this._handleAction(msg.id, a.key)}
										>
											${a.label}
										</button>
									`
								)}
							</div>
					  `
					: nothing}
			</div>
			${resolvedLabel
				? html`
					<div class="msg-row msg-row--user" role="listitem">
						<div class="bubble-user" aria-label="${i18n.getMessage('Your action: {0}', [resolvedLabel])}">
							${resolvedLabel}
						</div>
					</div>
				`
				: nothing}
		`;
	}

	_renderThinking() {
		return html`
			<div class="msg-row msg-row--assistant" role="status" aria-label="${i18n.getMessage('AI is thinking')}">
				<div class="thinking-bubble">
					<p class="thinking-text">${i18n.getMessage('Generating, this may take a moment')}</p>
				</div>
			</div>
		`;
	}

	_getGreeting() {
		const h = new Date().getHours();
		if (h < 12) return i18n.getMessage('Good morning');
		if (h < 17) return i18n.getMessage('Good afternoon');
		return i18n.getMessage('Good evening');
	}

	_renderEmptyState() {
		return html`
			<div class="empty-state">
				<h2 class="empty-title">${i18n.getMessage('Hi, {0}!', [this.userName])}</h2>
				<p class="empty-subtitle">${i18n.getMessage("Describe the widget you'd like to create, including:")}</p>
				<ul class="empty-hints">
					<li>${i18n.getMessage('What it displays or does')}</li>
					<li>${i18n.getMessage('Who uses it')}</li>
					<li>${i18n.getMessage('Any actions or interactions')}</li>
				</ul>
			</div>
		`;
	}

	_renderStream(message, isActive) {
		if (message.type === 'thinking') {
			return this._renderStreamContent(message.text, isActive, i18n.getMessage('Thinking...'));
		} else if (message.type === 'text') {
			return this._renderStreamContent(null, isActive, i18n.getMessage('Generating your widget, this might take a while...'));
		}
		return nothing;
	}

	_renderStreamContent(message, isActive, status) {
		function formatMarkdown(text) {
			// Strip javascript: / data: from href attributes to prevent XSS
			// (Lit html handles <script> injection; link hrefs need explicit sanitisation)
			function safeHref(url) {
				return /^(javascript|data):/i.test(url.trim()) ? '#' : url;
			}
			// Odd-indexed segments from split are captured tokens — avoids false-positive seg[0] checks
			function parseInline(str) {
				return str.split(/(`[^`\n]+`|\*\*[^*\n]+\*\*|\*[^*\n]+\*|_[^_\n]+_|\[[^\]]+\]\([^)]+\))/g).map((seg, i) => {
					if (i % 2 === 0) return seg;
					if (seg[0] === '`')       return html`<code class="ht-ic">${seg.slice(1, -1)}</code>`;
					if (seg.startsWith('**')) return html`<strong>${seg.slice(2, -2)}</strong>`;
					if (seg[0] === '*' || seg[0] === '_') return html`<em>${seg.slice(1, -1)}</em>`;
					const m = seg.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
					if (m) return html`<a class="ht-link" href="${safeHref(m[2])}" target="_blank" rel="noopener noreferrer">${m[1]}</a>`;
					return seg;
				});
			}

			const nodes = [];
			let inCode = false, codeLines = [];
			let listType = null, listItems = [];

			function flushList() {
				if (!listItems.length) return;
				const items = listItems.map(item => html`<li>${parseInline(item)}</li>`);
				nodes.push(listType === 'ol'
					? html`<ol class="ht-ol">${items}</ol>`
					: html`<ul class="ht-ul">${items}</ul>`);
				listItems = []; listType = null;
			}

			for (const line of text.split('\n')) {
				if (!inCode && line.startsWith('```'))      { flushList(); inCode = true; codeLines = []; }
				else if (inCode && line.startsWith('```')) { nodes.push(html`<pre class="ht-pre"><code class="ht-code">${codeLines.join('\n')}</code></pre>`); inCode = false; codeLines = []; }
				else if (inCode)                           { codeLines.push(line); }
				else {
					const hMatch  = line.match(/^(#{1,6})\s+(.+)/);
					const ulMatch = line.match(/^[-*+]\s+(.+)/);
					const olMatch = line.match(/^\d+\.\s+(.+)/);
					if (hMatch)       { flushList(); nodes.push(html`<div class="ht-h ht-h${hMatch[1].length}">${parseInline(hMatch[2])}</div>`); }
					else if (ulMatch) { if (listType !== 'ul') { flushList(); listType = 'ul'; } listItems.push(ulMatch[1]); }
					else if (olMatch) { if (listType !== 'ol') { flushList(); listType = 'ol'; } listItems.push(olMatch[1]); }
					else if (!line)   { flushList(); nodes.push(html`<br>`); }
					else              { flushList(); nodes.push(html`<span class="ht-line">${parseInline(line)}</span>`); }
				}
			}
			flushList();
			if (inCode) nodes.push(html`<pre class="ht-pre"><code class="ht-code">${codeLines.join('\n')}</code></pre>`);
			return nodes;
		}
		return html`
			<div class="msg-row msg-row--assistant" role="${isActive ? 'status' : 'listitem'}" aria-label="${isActive ? i18n.getMessage('AI is thinking') : ''}">
				<div class="thinking-card">
					${message ? html`
						<div class="thinking-card__body">
							<div class="thinking-card__text">${formatMarkdown(message)}</div>
						</div>
					` : nothing}
					${isActive ? html`
						<div class="thinking-card__header">
							<span class="thinking-spinner"></span>
							<span class="thinking-label">${status}</span>
						</div>
					` : nothing}
				</div>
			</div>
		`;
	}

	_renderThread() {
		if (this._messages.length === 0 && !this._thinking) {
			return html`
				<div class="thread-wrap">
					${this._renderEmptyState()}
				</div>
			`;
		}

		return html`
			<div class="thread-wrap">
				<div class="thread" role="list" aria-label="${i18n.getMessage('Chat messages')}" aria-live="polite">
					${this._messages.map((m, i) =>
					['text', 'thinking'].includes(m.type)
						? this._renderStream(m, i === this._messages.length - 1)
							: m.role === 'user'
								? this._renderUserMessage(m)
								: this._renderAssistantMessage(m)
					)}
					${this._thinking && !this._streaming ? this._renderThinking() : nothing}
				</div>
			</div>
		`;
	}

	_renderFooter() {
		const placeholder = this.widgetSysId
			? i18n.getMessage('Describe changes to this widget')
			: i18n.getMessage('Describe your widget');
		return html`
			<footer class="chat-footer">
				<aiux-omnibar
					variant="compact"
					placeholder=${placeholder}
					?disabled=${this._thinking || this.readOnly}
					@wb-chat-submit=${this._handleOmnibarSubmit}
				></aiux-omnibar>
			</footer>
		`;
	}

	render() {
		return html`
			<div class="root">
				${this._renderHeader()}
				${this._renderThread()}
				${this._renderFooter()}
			</div>
		`;
	}

	// ── Styles ────────────────────────────────────────────────────────────

	static styles = css`
		:host {
			display: block;
			width: 100%;
			height: 100%;
			font-family: var(--font-sans, Inter);
		}

		/* ── Shell ───────────────────────────────────────────────────────── */
		.root {
			display: flex;
			flex-direction: column;
			width: 100%;
			height: 100%;
			background: transparent;
			overflow: hidden;
		}

		/* ── Header ──────────────────────────────────────────────────────── */
		.chat-header {
			display: flex;
			align-items: center;
			gap: calc(var(--spacing, 0.25rem) * 2);
			padding: calc(var(--spacing, 0.25rem) * 4) calc(var(--spacing, 0.25rem) * 5);
			flex-shrink: 0;
		}

		.back-btn {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			width: calc(var(--spacing, 0.25rem) * 8);
			height: calc(var(--spacing, 0.25rem) * 8);
			border: none;
			border-radius: var(--radius-full, 9999px);
			background: transparent;
			color: var(--color-base-content, #1e293b);
			cursor: pointer;
			flex-shrink: 0;
			transition: background 0.15s var(--ease-out, ease);
		}

		.back-btn:hover {
			background: var(--color-base-200, #f3f3f3);
		}

		.back-btn:focus-visible {
			outline: 2px solid var(--color-primary, #4c6ceb);
			outline-offset: 2px;
		}

		.chat-title {
			font-size: var(--text-lg, 1.125rem);
			font-weight: var(--font-weight-bold, 700);
			color: var(--color-base-content, #000000);
			line-height: 1.3;
		}

		.chat-title-skeleton {
			display: inline-block;
			width: calc(var(--spacing, 0.25rem) * 40);
			height: calc(var(--spacing, 0.25rem) * 5);
			border-radius: var(--radius-md, 0.375rem);
			background: linear-gradient(90deg, var(--color-base-200, #e8e8e8) 25%, var(--color-base-300, #d8d8d8) 50%, var(--color-base-200, #e8e8e8) 75%);
			background-size: 200% 100%;
			animation: chatSkelShimmer 1.4s ease-in-out infinite;
		}

		@keyframes chatSkelShimmer {
			0% { background-position: 200% 0; }
			100% { background-position: -200% 0; }
		}

		@media (prefers-reduced-motion: reduce) {
			.chat-title-skeleton {
				animation: none;
			}
		}

		/* ── Thread ──────────────────────────────────────────────────────── */
		.thread-wrap {
			flex: 1;
			min-height: 0;
			position: relative;
			overflow: hidden;
		}


		.thread {
			height: 100%;
			overflow-y: auto;
			overflow-x: hidden;
			padding: calc(var(--spacing, 0.25rem) * 4) calc(var(--spacing, 0.25rem) * 5) calc(var(--spacing, 0.25rem) * 5);
			display: flex;
			flex-direction: column;
			gap: calc(var(--spacing, 0.25rem) * 4);
			box-sizing: border-box;
			scroll-behavior: smooth;
		}

		.thread::-webkit-scrollbar {
			width: calc(var(--spacing, 0.25rem) * 1);
		}
		.thread::-webkit-scrollbar-track {
			background: transparent;
		}
		.thread::-webkit-scrollbar-thumb {
			background: var(--color-border-subtle, #e0e0e0);
			border-radius: var(--radius-sm, 0.25rem);
		}

		/* ── Message rows ────────────────────────────────────────────────── */
		.msg-row {
			display: flex;
			flex-direction: column;
			gap: calc(var(--spacing, 0.25rem) * 2);
			max-width: 100%;
		}

		/* User message — right aligned */
		.msg-row--user {
			align-items: flex-end;
		}

		/* AI message — left aligned */
		.msg-row--assistant {
			align-items: flex-start;
		}

		/* ── User bubble ─────────────────────────────────────────────────── */
		.bubble-user {
			max-width: 80%;
			background: var(--color-primary);
			color: var(--color-base-100);
			font-size: var(--text-md, 1rem);
			line-height: 1.5;
			padding: calc(var(--spacing, 0.25rem) * 3);
			border-radius: var(--radius-2xl, 1rem) var(--radius-md, 0.375rem) var(--radius-2xl, 1rem) var(--radius-2xl, 1rem);
			word-break: break-word;
		}

		/* ── AI message (plain text, no bubble) ──────────────────────────── */
		.assistant-text {
			margin: 0;
			padding: 0;
			max-width: 90%;
			font-size: var(--text-md, 1rem);
			line-height: 1.5;
			color: var(--color-base-content, #1e293b);
			word-break: break-word;
		}

		/* ── Error card ──────────────────────────────────────────────────── */
		.error-card {
			display: flex;
			flex-direction: column;
			gap: calc(var(--spacing, 0.25rem) * 2);
			width: 100%;
			max-width: 92%;
			padding: calc(var(--spacing, 0.25rem) * 4);
			background: var(--color-error-subtle, #fef2f2);
			border: 1px solid var(--color-error-border, #fecaca);
			border-radius: var(--radius-lg, 0.5rem);
			box-sizing: border-box;
			min-width: 0;
		}
		.error-card__header {
			display: flex;
			align-items: center;
			gap: calc(var(--spacing, 0.25rem) * 2);
			min-width: 0;
		}
		.error-card__icon {
			color: var(--color-error, #dc2626);
			flex-shrink: 0;
		}
		.error-card__title {
			flex: 1 1 auto;
			min-width: 0;
			font-size: var(--text-base, 1rem);
			font-weight: 400;
			color: var(--color-error, #dc2626);
			line-height: 1.4;
			word-break: break-word;
		}
		.error-card__body {
			margin: 0;
			font-size: var(--text-sm, 0.875rem);
			line-height: 1.6;
			font-weight: 400;
			color: var(--color-base-content, #1e293b);
			word-break: break-word;
			white-space: pre-wrap;
			max-height: 30vh;
			overflow-y: auto;
		}

		/* ── Action buttons ──────────────────────────────────────────────── */
		.msg-actions {
			display: flex;
			align-items: center;
			gap: calc(var(--spacing, 0.25rem) * 2);
			flex-wrap: wrap;
		}

		/* ── Thinking indicator ──────────────────────────────────────────── */
		.thinking-bubble {
			display: flex;
			flex-direction: column;
			gap: calc(var(--spacing, 0.25rem) * 1);
			padding: calc(var(--spacing, 0.25rem) * 3) calc(var(--spacing, 0.25rem) * 4);
			background: var(--color-base-200, #f3f3f3);
			border-radius: var(--radius-2xl, 1rem) var(--radius-2xl, 1rem) var(--radius-2xl, 1rem) var(--radius-sm, 0.25rem);
			max-width: 85%;
		}
		.thinking-text {
			margin: 0;
			font-size: var(--text-sm, 0.875rem);
			font-weight: var(--font-weight-normal, 400);
		}
		.animated-dots::after {
			content: '';
			animation: dotAnimation 1.5s infinite steps(4, end);
		}
		@keyframes dotAnimation {
			0%   { content: ''; }
			25%  { content: '.'; }
			50%  { content: '..'; }
			75%  { content: '...'; }
			100% { content: ''; }
		}

		/* ── Thinking stream card ────────────────────────────────────────── */
		.thinking-card {
			display: flex;
			flex-direction: column;
			gap: calc(var(--spacing, 0.25rem) * 3);
			max-width: 90%;
		}

		.thinking-card__header {
			display: flex;
			align-items: center;
			gap: calc(var(--spacing, 0.25rem) * 2);
		}

		.thinking-spinner {
			flex-shrink: 0;
			width: calc(var(--spacing, 0.25rem) * 4);
			height: calc(var(--spacing, 0.25rem) * 4);
			border-radius: var(--radius-full, 9999px);
			border: 2px solid var(--color-base-300, #e1e1e0);
			border-top-color: var(--color-primary, #4c6ceb);
			animation: thinkingSpinnerSpin 0.8s linear infinite;
		}

		@keyframes thinkingSpinnerSpin {
			to { transform: rotate(360deg); }
		}

		.thinking-label {
			font-size: var(--text-sm, 0.875rem);
			font-weight: var(--font-weight-medium, 500);
			background: linear-gradient(
				110deg,
				var(--color-base-content-secondary, #475569) 35%,
				var(--color-base-content, #1e293b) 50%,
				var(--color-base-content-secondary, #475569) 65%
			);
			background-size: 200% 100%;
			background-clip: text;
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
			animation: thinkingLabelShimmer 3s linear infinite;
		}

		@keyframes thinkingLabelShimmer {
			0% { background-position: 200% 0; }
			100% { background-position: -200% 0; }
		}


		.thinking-card__body {
			overflow-y: auto;
			max-height: 40vh;
			scroll-behavior: smooth;
			background: var(--color-base-200, #f3f3f3);
			border-radius: var(--radius-xl, 0.75rem);
			padding: calc(var(--spacing, 0.25rem) * 4);
		}

		.thinking-card__body::-webkit-scrollbar {
			width: calc(var(--spacing, 0.25rem) * 1);
		}

		.thinking-card__body::-webkit-scrollbar-track {
			background: var(--color-base-300, #e1e1e0);
			border-radius: var(--radius-xl, 0.75rem);
		}

		.thinking-card__body::-webkit-scrollbar-thumb {
			background: var(--color-accent-hover, #3852c6);
			border-radius: var(--radius-xl, 0.75rem);
		}

		.thinking-card__text {
			margin: 0;
			font-size: var(--text-sm, 0.875rem);
			line-height: 1.6;
			color: var(--color-base-content-secondary, #475569);
			white-space: pre-wrap;
			word-break: break-word;
		}

		.thinking-card__text .ht-line {
			display: block;
		}

		.thinking-card__text .ht-pre {
			background: var(--color-base-300, #e1e1e0);
			border-left: 2px solid var(--color-primary, #4c6ceb);
			border-radius: 0 var(--radius-md, 0.375rem) var(--radius-md, 0.375rem) 0;
			padding: calc(var(--spacing, 0.25rem) * 2) calc(var(--spacing, 0.25rem) * 3);
			overflow-x: auto;
			margin: calc(var(--spacing, 0.25rem) * 2) 0;
		}

		.thinking-card__text .ht-code {
			font-family: var(--font-mono, 'Menlo', 'Consolas', monospace);
			font-size: var(--text-xs, 0.75rem);
			color: var(--color-primary, #4c6ceb);
			white-space: pre;
			display: block;
		}

		.thinking-card__text .ht-ic {
			font-family: var(--font-mono, 'Menlo', 'Consolas', monospace);
			font-size: 0.8em;
			color: var(--color-primary, #4c6ceb);
			background: var(--color-base-300, #e1e1e0);
			border-radius: var(--radius-sm, 0.25rem);
			padding: 0.1em 0.35em;
		}

		.thinking-card__text .ht-h {
			display: block;
			font-weight: 600;
			color: var(--color-base-content, #1e293b);
			margin: calc(var(--spacing, 0.25rem) * 2) 0 calc(var(--spacing, 0.25rem) * 1) 0;
			line-height: 1.3;
		}
		.thinking-card__text .ht-h1 { font-size: var(--text-xl, 1.25rem); }
		.thinking-card__text .ht-h2 { font-size: var(--text-lg, 1.125rem); }
		.thinking-card__text .ht-h3 { font-size: var(--text-base, 1rem); }
		.thinking-card__text .ht-h4,
		.thinking-card__text .ht-h5,
		.thinking-card__text .ht-h6 { font-size: var(--text-sm, 0.875rem); }

		.thinking-card__text .ht-ul,
		.thinking-card__text .ht-ol {
			margin: calc(var(--spacing, 0.25rem) * 1) 0;
			padding-left: calc(var(--spacing, 0.25rem) * 5);
		}
		.thinking-card__text .ht-ul { list-style-type: disc; }
		.thinking-card__text .ht-ol { list-style-type: decimal; }
		.thinking-card__text li { display: list-item; }

		.thinking-card__text .ht-link {
			color: var(--color-primary, #4c6ceb);
			text-decoration: underline;
		}

		/* ── Empty State ─────────────────────────────────────────────────── */
		.empty-state {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			justify-content: center;
			height: 100%;
			padding: calc(var(--spacing, 0.25rem) * 10) calc(var(--spacing, 0.25rem) * 8);
			gap: calc(var(--spacing, 0.25rem) * 1);
		}

		.empty-title {
			font-family: var(--font-servicenow, 'ServiceNow Sans', sans-serif);
			font-size: var(--text-2xl, 1.5rem);
			font-weight: var(--font-weight-extrabold, 800);
			color: var(--color-primary, #4c6ceb);
			margin: 0;
			letter-spacing: -0.02em;
		}

		.empty-subtitle {
			font-family: var(--font-servicenow, 'ServiceNow Sans', sans-serif);
			font-size: var(--text-base, 1rem);
			font-style: normal;
			font-weight: var(--font-weight-light, 300);
			color: var(--color-base-content-secondary, #6b7280);
			margin: 0;
		}

		.empty-hints {
			list-style: disc;
			text-align: left;
			margin: calc(var(--spacing, 0.25rem) * 2) 0 0;
			padding-left: calc(var(--spacing, 0.25rem) * 5);
			font-size: var(--text-base, 1rem);
			font-weight: var(--font-weight-light, 300);
			color: var(--color-base-content, #1e293b);
			line-height: 1.7;
		}

		/* ── Footer ──────────────────────────────────────────────────────── */
		.chat-footer {
			flex-shrink: 0;
			padding: calc(var(--spacing, 0.25rem) * 2) calc(var(--spacing, 0.25rem) * 3) calc(var(--spacing, 0.25rem) * 3);
			background: transparent;
			overflow: visible;
		}

		wb-omnibar {
			width: 100%;
		}

		/* ── Disclaimer ──────────────────────────────────────────────────── */
		.disclaimer {
			display: block;
			margin: calc(var(--spacing, 0.25rem) * 1.5) 0 0;
			text-align: center;
			font-size: var(--text-xs, 0.75rem);
			color: var(--color-base-content-secondary, #656462);
			line-height: 1.4;
		}

		/* ── Generating status ───────────────────────────────────────────── */
		.generating-status {
			display: flex;
			align-items: center;
			gap: calc(var(--spacing, 0.25rem) * 2);
			padding: calc(var(--spacing, 0.25rem) * 2) 0;
		}

		.generating-label {
			font-size: var(--text-sm, 0.875rem);
			color: var(--color-base-content-secondary, #475569);
		}

		/* ── Accessibility ───────────────────────────────────────────────── */
		@media (prefers-reduced-motion: reduce) {
			.animated-dots::after {
				animation: none;
				content: '...';
			}
		}

	`;
}
