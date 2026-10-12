answer = getPARenabledInstanceCount();

        function getPARenabledInstanceCount() {
            var tier1TechnicalDashboardRecord = new GlideRecord('sys_ux_screen');
            var tier1PARDashboardRecord = new GlideRecord('sys_ux_screen');

            var tier1TechnicalDashboardExists = tier1TechnicalDashboardRecord.get('b034cf7877410110c05d885d9f5a9912');
            var tier1TechnicalDashboardActive = tier1TechnicalDashboardExists && tier1TechnicalDashboardRecord.getValue('active') == '1';
            var tier1TechnicalDashboardOrderValue = tier1TechnicalDashboardActive ? parseFloat(tier1TechnicalDashboardRecord.getValue('order')) : null;

            var tier1PARDashboardExists = tier1PARDashboardRecord.get('ad0e332c470c5210632ef855516d43ed');
            var tier1PARDashboardActive = tier1PARDashboardExists && tier1PARDashboardRecord.getValue('active') == '1';
            var tier1PARDashboardOrderValue = tier1PARDashboardActive ? parseFloat(tier1PARDashboardRecord.getValue('order')) : null;

            if (tier1PARDashboardActive && !tier1TechnicalDashboardActive) {
                return 1;
            }
            else if (tier1PARDashboardActive && tier1TechnicalDashboardActive) {
                return (tier1PARDashboardOrderValue < tier1TechnicalDashboardOrderValue) ? 1 : 0;
            }
            else {
                return 0;
            }
        }
