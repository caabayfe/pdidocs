var IpkiMigrationListService = Class.create();
IpkiMigrationListService.prototype = {

    MIGRATION_TABLE: 'sn_mid_infra_ipki_migration',
    ECC_AGENT_TABLE: 'ecc_agent',

    STATUS_COLOR: {
        not_started: 'low',
        pre_flight: 'warning',
        registration: 'info',
        cert_issued: 'moderate',
        succeeded: 'positive',
        failed: 'critical'
    },

    // Statuses whose elapsed time is frozen at completion (sys_updated_on) instead of ticking to now.
    TERMINAL_STATUSES: { succeeded: true, failed: true },

    initialize: function() {
        this.ipkiService = new IPKIService();
    },

    getRows: function() {
        var eligibleMids = this._loadEligibleMids();
        var midSysIds = Object.keys(eligibleMids);
        var latestByMid = this._loadLatestMigrationByMid(midSysIds);
        
        // Hoist getActiveAgentSysIds call outside the loop to avoid N+1 queries
        var activeIpkiMids = this.ipkiService.getActiveAgentSysIds();
        var activeIpkiSet = {};
        for (var i = 0; i < activeIpkiMids.length; i++) {
            activeIpkiSet[activeIpkiMids[i]] = true;
        }

        var rows = [];
        for (var i = 0; i < midSysIds.length; i++) {
            var midSysId = midSysIds[i];
            var mid = eligibleMids[midSysId];
            var latest = latestByMid[midSysId] || null;
            
            // Only show MIDs that have a migration record OR are not yet on iPKI.
            // This excludes MIDs that were put on iPKI outside the migration flow.
            if (!latest) {
                var isOnIpki = activeIpkiSet[midSysId] || false;
                if (isOnIpki) continue;
            }
            
            var bucket = this._bucket(mid.midUp, latest);
            if (!bucket) continue;
            rows.push(this._buildRow(midSysId, mid, latest, bucket));
        }
        var summary = this._summarize(rows);
        // Instance-wide gate for enabling bulk migration: true when at least one MID is
        // actually active on iPKI (sn_mid_infra_cert_map state=active), independent of the
        // migration table.
        summary.hasActiveIpki = this.ipkiService.hasActiveIpkiMid();
        return {
            rows: rows,
            summary: summary
        };
    },

    // Eligibility for the Auth Migration UI is "basic auth MIDs":
    //   ecc_agent.is_using_custom_cert = false
    // Custom-cert MIDs are excluded because they manage their own certificates.
    // Note: MIDs already on iPKI (in cert_map) are now included to show succeeded migrations.
    _loadEligibleMids: function() {
        var result = {};

        var midGr = new GlideRecord(this.ECC_AGENT_TABLE);
        midGr.addQuery('is_using_custom_cert', false);
        midGr.query();
        while (midGr.next()) {
            var midSysId = midGr.getUniqueValue();
            var validatedRaw = midGr.getValue('validated');
            result[midSysId] = {
                midName: midGr.getValue('name') || '',
                midHostName: midGr.getValue('host_name') || '',
                midUp: (midGr.getValue('status') || '').toLowerCase() === 'up',
                midValidated: validatedRaw === 'true' || validatedRaw === '1'
            };
        }
        return result;
    },

    _loadLatestMigrationByMid: function(midSysIds) {
        var latest = {};
        if (!midSysIds || midSysIds.length === 0) return latest;
        var gr = new GlideRecord(this.MIGRATION_TABLE);
        gr.addQuery('mid_server', 'IN', midSysIds.join(','));
        gr.orderByDesc('sys_created_on');
        gr.orderByDesc('sys_id');
        gr.query();
        while (gr.next()) {
            var midSysId = gr.getValue('mid_server');
            if (latest[midSysId]) continue;
            latest[midSysId] = {
                sysId: gr.getUniqueValue(),
                status: gr.getValue('status'),
                details: gr.getValue('details') || '',
                sysCreatedOn: gr.getValue('sys_created_on'),
                sysUpdatedOn: gr.getValue('sys_updated_on'),
                eccQueueOutboundSysId: gr.getValue('ecc_queue_outbound_record') || null,
                domainSysId: gr.getValue('sys_domain') || null
            };
        }
        return latest;
    },

    // Bucket rule:
    //   - down + no migration entry  -> 'offline'
    //   - everything else            -> 'active' 
    // Not Started rows for Up MIDs land on Active so the user can act on them.                                    
    _bucket: function(midUp, latest) {
        if (!latest && !midUp) return 'offline';
        return 'active';
    },

    _buildRow: function(midSysId, mid, latest, bucket) {
        var statusValue = latest ? latest.status : 'not_started';
        return {
            key: midSysId,
            migrationSysId: latest ? latest.sysId : null,
            bucket: bucket,
            midSysId: midSysId,
            midName: mid.midName,
            midHostName: mid.midHostName,
            midStatus: mid.midUp ? 'Up' : 'Down', // <-- capitalized to match the ecc_agent.status convention; clients compare to 'Up'
            midValidated: mid.midValidated,
            status: {
                value: statusValue,
                label: this._getStatusLabel(statusValue),
                color: this.STATUS_COLOR[statusValue] || 'neutral'
            },
            details: latest ? latest.details : (mid.midUp ? '' : gs.getMessage('This server is offline and cannot be migrated until it comes back online.')),
            elapsed: this._formatElapsedFor(latest),
            sysCreatedOn: latest ? latest.sysCreatedOn : '',
            eccQueueOutboundSysId: latest ? latest.eccQueueOutboundSysId : null,
            domainSysId: latest ? latest.domainSysId : null
        };
    },

    _summarize: function(rows) {
        var counts = {
            eligible: rows.length,
            notStarted: 0,
            preFlight: 0,
            registration: 0,
            certIssued: 0,
            succeeded: 0,
            failed: 0
        };
        for (var i = 0; i < rows.length; i++) {
            var v = rows[i].status.value;
            if (v === 'not_started') counts.notStarted++;
            else if (v === 'pre_flight') counts.preFlight++;
            else if (v === 'registration') counts.registration++;
            else if (v === 'cert_issued') counts.certIssued++;
            else if (v === 'succeeded') counts.succeeded++;
            else if (v === 'failed') counts.failed++;
        }
        counts.inProgress = counts.preFlight + counts.registration + counts.certIssued;
        return counts;
    },

    // Literal strings so the i18n extractor can resolve each key at build time.
    // See companion sys_ui_message records under src/server/ipki/sys_ui_message/.
    _getStatusLabel: function(statusValue) {
        switch (statusValue) {
            case 'not_started':  return gs.getMessage('sn_mid_infra: Not started');
            case 'pre_flight':   return gs.getMessage('sn_mid_infra: Pre-flight');
            case 'registration': return gs.getMessage('sn_mid_infra: Registration');
            case 'cert_issued':  return gs.getMessage('sn_mid_infra: Certificate issued');
            case 'succeeded':    return gs.getMessage('sn_mid_infra: Succeeded');
            case 'failed':       return gs.getMessage('sn_mid_infra: Failed');
            default:             return statusValue;
        }
    },

    // Chooses the elapsed window per row: terminal rows freeze at completion (sys_updated_on),
    // in-progress rows measure to now.
    _formatElapsedFor: function(latest) {
        if (!latest) return '-';
        var endValue = this.TERMINAL_STATUSES[latest.status] ? latest.sysUpdatedOn : null;
        return this._formatElapsed(latest.sysCreatedOn, endValue);
    },

    _formatElapsed: function(startValue, endValue) {
        if (!startValue) return '-';
        var start = new GlideDateTime();
        start.setValue(startValue);
        var startMs = start.getNumericValue();
        if (startMs <= 0) return '-';

        var endMs;
        if (endValue) {
            var end = new GlideDateTime();
            end.setValue(endValue);
            endMs = end.getNumericValue();
        } else {
            endMs = new GlideDateTime().getNumericValue();
        }

        var diffSec = Math.max(0, Math.floor((endMs - startMs) / 1000));
        var s = diffSec % 60;
        var totalMin = Math.floor(diffSec / 60);
        var m = totalMin % 60;
        var totalH = Math.floor(totalMin / 60);
        var h = totalH % 24;
        var d = Math.floor(totalH / 24);
        var pad2 = function(n) {
            return (n < 10 ? '0' : '') + n;
        };
        if (d > 0) return d + 'd ' + pad2(h) + ':' + pad2(m) + ':' + pad2(s);
        if (totalH > 0) return totalH + ':' + pad2(m) + ':' + pad2(s);
        return totalMin + ':' + pad2(s);
    },

    type: 'IpkiMigrationListService'
};
