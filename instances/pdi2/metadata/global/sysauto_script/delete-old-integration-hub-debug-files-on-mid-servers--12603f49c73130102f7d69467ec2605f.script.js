
 var priority = 'Standard'; var eccParams = { 'source': 'deleteExpiredIHubPlans', 'topic': 'SystemCommand'}; new SNC.MidEccSender().broadcastToAllMidServers(priority, eccParams, {});
