answer = getPARenabledInstanceCount();

        function getPARenabledInstanceCount() {
        var tier2TechnicalDashboardRecord = new GlideRecord('sys_ux_screen');
        var tier2PARDashboardRecord = new GlideRecord('sys_ux_screen');

        var tier2TechnicalDashboardExists = tier2TechnicalDashboardRecord.get('cbc2f24977070110949878dabd5a9935');
        var tier2TechnicalDashboardActive = tier2TechnicalDashboardExists && tier2TechnicalDashboardRecord.getValue('active') == '1';
        var tier2TechnicalDashboardOrderValue = tier2TechnicalDashboardActive ? parseFloat(tier2TechnicalDashboardRecord.getValue('order')) : null;

        var tier2PARDashboardExists = tier2PARDashboardRecord.get('002732ff47409210632ef855516d43b7');
        var tier2PARDashboardActive = tier2PARDashboardExists && tier2PARDashboardRecord.getValue('active') == '1';
        var tier2PARDashboardOrderValue = tier2PARDashboardActive ? parseFloat(tier2PARDashboardRecord.getValue('order')) : null;

        if (tier2PARDashboardActive && !tier2TechnicalDashboardActive) {
            return 1; 
        }
        else if (tier2PARDashboardActive && tier2TechnicalDashboardActive) {
            return (tier2PARDashboardOrderValue < tier2TechnicalDashboardOrderValue) ? 1 : 0;
        }
        else {
            return 0;
        }
        }
