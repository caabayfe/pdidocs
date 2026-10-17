// HTTP gateway to the Foundry conversation/turn API. Pure transport and
// payload construction: builds requests, mints the signed KAA JWT through the
// auth seam, carries it in the HTTP Bearer scheme, and translates HTTP results
// into the plain return values below.
// Never throws — a transport exception or a non-2xx/non-JSON response becomes
// `false`. Turning a falsy dispatch into a raised error is the caller's job,
// not this module's.
import { gs } from '@servicenow/glide';
import { RESTMessageV2 } from '@servicenow/glide/sn_ws';
import { BuildAgentUtil } from '@servicenow/glide/sn_build_agent';
import { mintUserToken } from './auth.ts';
import { resolveProviderConfig } from './providerConfig.ts';
import { AE_WORK_ITEM_EXECUTION_CAPABILITY } from '../glide/assistBilling.ts';
function executionAgentPackId() {
    return 'autoeng_developer';
}
function resolveInstanceUrl() {
    // Prefer the explicitly provisioned instance URL over glide.servlet.uri:
    // on a cloned/DB-dumped instance the latter can resolve to a
    // node-internal address that outbound calls (this URL is handed back to
    // the foundry worker, and to the OBO mint) cannot actually reach.
    return gs.getProperty('sn_build_agent.instance_url', '') || gs.getProperty('glide.servlet.uri', '');
}
export function resolveFoundryBaseUrl(instanceUrl) {
    const configured = gs.getProperty('sn_build_agent.foundry_base_url', '/sncapps/code/assist/foundry');
    if (/^https?:\/\//i.test(configured))
        return configured.replace(/\/$/, '');
    const origin = instanceUrl.replace(/\/$/, '');
    const path = configured ? `/${configured.replace(/^\/+/, '')}` : '/sncapps/code/assist/foundry';
    return `${origin}${path}`;
}
function parseJsonBody(raw) {
    if (!raw)
        return null;
    try {
        return JSON.parse(raw);
    }
    catch (e) {
        return null;
    }
}
// Fires one HTTP call and reports back a normalized {status, body} shape, or
// null on any transport-level exception (network down, TLS, a thrown
// execute()). A non-JSON response body is folded into `body: null` rather
// than thrown, so a garbled proxy/gateway error page can never crash the
// caller. Shared by post() and get() below — same never-throws contract,
// same logging shape, for every HTTP method this module speaks.
function request(method, baseUrl, path, body, token, extraHeaders) {
    if (!token) {
        gs.warn(`[build-agent] ${method} ${path} skipped: KAA token unavailable`);
        return null;
    }
    try {
        const req = new RESTMessageV2();
        req.setEndpoint(`${baseUrl}${path}`);
        req.setHttpMethod(method);
        req.setRequestHeader('Authorization', `Bearer ${token}`);
        if (extraHeaders) {
            for (const name of Object.keys(extraHeaders))
                req.setRequestHeader(name, extraHeaders[name]);
        }
        if (body !== undefined) {
            req.setRequestHeader('Content-Type', 'application/json');
            req.setRequestBody(JSON.stringify(body));
        }
        const response = req.execute();
        const status = Number(response.getStatusCode());
        // Say WHY on a non-2xx. execute() does NOT throw when the platform refuses the
        // call: it returns status 0 with an empty body, and the reason is readable only
        // from getErrorMessage(). The refusal we hit in anger was
        //   SecurityException: Illegal access to outbound HTTP in <app>.
        //   Use an async business rule to perform outbound HTTP requests.
        // raised because a synchronous business rule re-entered the engine and the drain
        // ran dispatch inside that rule's frame. Without this log the only symptom is a
        // generic "no run conversation", which hides the actionable platform error.
        // The token is never logged.
        if (status < 200 || status > 299) {
            gs.warn(`[build-agent] ${method} ${path} -> status ${status}: ${String(response.getErrorMessage() || '(no error message)')}`);
        }
        return { status, body: parseJsonBody(response.getBody()) };
    }
    catch (e) {
        gs.warn(`[build-agent] ${method} ${path} threw: ${e instanceof Error ? e.message : String(e)}`);
        return null;
    }
}
function post(baseUrl, path, body, token, extraHeaders) {
    return request('POST', baseUrl, path, body, token, extraHeaders);
}
// Fetches Foundry's model catalog (GET /v1/models) — no request body, so
// Content-Type/body are skipped entirely (see request()'s `body !== undefined`
// guard). Same never-throws contract as post().
function get(baseUrl, path, token, extraHeaders) {
    return request('GET', baseUrl, path, undefined, token, extraHeaders);
}
// Mirrors FoundryAgentSession.buildFoundryLiveModelConfig() (idex/src/nirvana/FoundryAgentSession.ts,
// post-DEF0883788): the large model's full config comes from Foundry's catalog
// default version for the resolved provider, not from instance config. Same
// selection rule as forge's own getDefaultVersion() (model-registry.ts) and
// ProviderService.executeProviderQuery() (providerService.ts) — first version
// flagged `default`, else the first in the array. Falls back to `fallback`
// (the instance-resolved large config) on any failure: unreachable Foundry,
// non-2xx, malformed JSON, or the resolved provider missing from the
// registry — enqueueToForge must never fail because Foundry is unreachable.
function resolveLargeModelFromForge(baseUrl, instanceUrl, token, provider, fallback) {
    // Forge's GET routes (services/foundry/src/model-routes.ts) read the
    // instance URL ONLY from this header and 400 without a body/query
    // fallback (unlike the POST routes above, which accept body.instanceUrl)
    // — omitting it makes every call 400 and this feature a silent no-op.
    const result = get(baseUrl, '/v1/models', token, { 'X-Foundry-Instance-Url': instanceUrl });
    if (!result || result.status < 200 || result.status > 299 || !result.body)
        return fallback;
    const registry = result.body;
    const entry = registry[provider];
    if (!entry || !Array.isArray(entry.versions) || entry.versions.length === 0) {
        gs.warn(`[foundry] provider ${provider} not found in Foundry's model registry; using instance-resolved large config`);
        return fallback;
    }
    const version = entry.versions.find(v => v.default) ?? entry.versions[0];
    gs.info(`[foundry] large model config sourced from Foundry catalog: provider=${provider} model=${version.id}`);
    return {
        model: version.id,
        temperature: version.temperature,
        maxOutputTokens: version.maxOutputTokens,
        thinkingTokens: version.thinkingTokens ?? 0
    };
}
// Instance metadata for the turn, read through the same-scope script-include the
// interactive paths use so the two cannot drift. Replaces a hardcoded
// `{instanceName: 'local', glideVersion: 'local'}` placeholder that reported
// every instance — including a real one — as "local".
//
// `userId` is deliberately overridden with the run's principal. The script
// include reads `gs.getUserID()`, which in a dispatch is the *triggering*
// transaction's user (an approver, or `system` for a scheduled cascade), while
// the interactive paths report the user actually driving the turn. `principal`
// is that user here, and is already who the signed KAA JWT is minted for.
//
// Wrapped because this module's contract is that it never throws: if the module
// loader cannot resolve the script-include, the turn still goes out carrying
// `instanceUrl`, which is the only attribute the protocol requires
// (idex/src/nirvana/protocol-v1.ts:111).
function resolveGlideAttributes(instanceUrl, principal) {
    try {
        return { ...BuildAgentUtil.getGlideAttributes(), instanceUrl, userId: principal };
    }
    catch (e) {
        gs.warn(`[foundry] BuildAgentUtil.getGlideAttributes() unavailable; sending instanceUrl only: ${e}`);
        return { instanceUrl };
    }
}
// Assembles the non-interactive Foundry turn. Its capabilities are limited to
// what Developer needs for project/filesystem work, server tools, and durable
// execution. No elicitation capability is advertised.
function buildTurnPayload(conversationId, prompt, instanceUrl, principal, providerConfig, instructions, atfWithApp, atfWithAppRunUi) {
    return {
        message: {
            type: 'message',
            conversation_id: conversationId,
            content: prompt,
            agent_pack: { id: executionAgentPackId() },
            agentPermissionMode: 'async',
            conversationHistory: [],
            // Pre-fetched instructions for the runner — no elicitation client
            // available in the non-interactive path.
            ...(instructions && { instanceInstructions: instructions })
        },
        capabilities: {
            permission_module: {},
            memfs: {},
            working_set: {},
            server_tools: {},
            server_side_persistence: {},
            glob_and_grep: {},
            keyword_search: {},
            sub_agents: {},
            // Mirrors the interactive path's isAtfWithAppEnabled()/
            // isUiAtfInLoopEnabled() gates and their nesting
            // (NirvanaWebSocketClient.buildClientCapabilities) — captured by
            // the caller at executePlan() time, since no live IDE preference
            // exists in this non-interactive dispatch. atf_with_app_run_ui is
            // only meaningful alongside atf_with_app, never on its own.
            ...(atfWithApp && {
                atf_with_app: {},
                ...(atfWithAppRunUi && { atf_with_app_run_ui: {} })
            })
        },
        invokeOptions: {
            // DEF0906139 — this turn is always the async, unattended AE execution
            // path (buildTurnPayload is non-interactive-only, see the comment
            // above), so attribution is always AE, never Build Agent.
            applicationName: 'Autonomous Engineer',
            stream: true,
            // provider / model / baseUrl are RESOLVED from the instance's configured
            // default GenAI capability (resolveProviderConfig) — the same source the
            // interactive path uses — never hardcoded. See ./providerConfig.ts.
            modelConfig: providerConfig.modelConfig,
            glideAttributes: resolveGlideAttributes(instanceUrl, principal),
            attributes: {
                ...providerConfig.attributes,
                conversationId,
                turnId: conversationId,
                transactionId: conversationId
            },
            // Same capability effects.ts already charges for this run, not Build Agent's.
            genAIConfig: { capabilityId: AE_WORK_ITEM_EXECUTION_CAPABILITY }
        },
        instanceUrl
    };
}
// Conversation creation deliberately does not live here. Server-side AutoEng
// inserts its run and rework rows locally; Forge's /v1/conversations remains
// available to browser and other off-instance callers.
// Enqueues a turn against an existing conversation for asynchronous,
// non-interactive execution. Work-item and plan context live in the trusted
// message content; the Foundry turn contract has no separate context field.
// `principal` (per-user KAA assertion minting) stays a separate parameter.
// Returns true only on 202 (accepted); false on any other response
// or failure, including an unresolvable provider config — resolved first so a
// misconfigured instance (no default provider, or BYOK) never attempts (or mints
// a token for) a call it already knows will fail.
export function enqueueToForge(conversationId, prompt, principal, instructions, atfWithApp, atfWithAppRunUi) {
    const providerConfig = resolveProviderConfig();
    if (!providerConfig)
        return false;
    const instanceUrl = resolveInstanceUrl();
    const baseUrl = resolveFoundryBaseUrl(instanceUrl);
    const token = mintUserToken(principal);
    // Called unconditionally rather than gated on some "is the instance config
    // already stale" check — there's no cheap way to know that without asking
    // Foundry, so the round-trip IS the check. Acceptable here because dispatch
    // is already async and multi-round-trip (mintUserToken, this call, then the
    // POST below); it is not on a synchronous/interactive latency path, and
    // correctness of the large-model selection matters more than shaving one
    // outbound call off an already-async turn enqueue.
    const modelConfig = {
        ...providerConfig.modelConfig,
        largeConfig: resolveLargeModelFromForge(baseUrl, instanceUrl, token, providerConfig.modelConfig.provider, providerConfig.modelConfig.largeConfig)
    };
    const body = buildTurnPayload(conversationId, prompt, instanceUrl, principal, { ...providerConfig, modelConfig }, instructions, atfWithApp, atfWithAppRunUi);
    const result = post(baseUrl, `/v1/conversations/${conversationId}/turns`, body, token, { 'X-Foundry-Class': 'non-interactive' });
    return !!result && result.status === 202;
}
// Best-effort cancel of an in-flight turn on a conversation (Forge's shipped
// `POST /v1/conversations/{cid}/cancel`). Callers — report_outcome's
// post-flip cleanup, stop/cancel-of-running, the stall watchdog — never gate
// their own transition on this: like enqueueToForge above,
// this never throws. A transport failure, a non-2xx, and a "no active turn"
// answer (which the platform reports as a 2xx, same as a real cancel) all
// collapse to a plain boolean the caller may log but is never required to act
// on.
export function cancelTurn(conversationId, principal) {
    const instanceUrl = resolveInstanceUrl();
    const baseUrl = resolveFoundryBaseUrl(instanceUrl);
    const token = mintUserToken(principal);
    const result = post(baseUrl, `/v1/conversations/${conversationId}/cancel`, {}, token);
    return !!result && result.status >= 200 && result.status < 300;
}
