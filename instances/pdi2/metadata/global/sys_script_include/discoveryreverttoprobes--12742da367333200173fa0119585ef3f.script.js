var DiscoveryRevertToProbes;

(function() {

DiscoveryRevertToProbes = {
	revert: revert
};


function revert() {
	disablePattern('05c60b049ff322001d753758442e706e');
	disablePattern('06dbcfe5dbb52200868a7c841f961950');
	disablePattern('538599fc3762220006b216a543990efe');
	disablePattern('6b1595fc3762220006b216a543990e92');
	disablePattern('7292841b9f2322001d753758442e7069');
	disablePattern('8526513037a2220006b216a543990e7f');
	disablePattern('866451fc3762220006b216a543990e1b');
	disablePattern('a2152bf39f6322001d753758442e701a');
	disablePattern('b3b2b2379f5832001d753758442e701b');
	disablePattern('b90de6e3db9aa200868a7c841f96191e');
	disablePattern('cced1eb1dbd12200868a7c841f961969');
	disablePattern('de679d3037a2220006b216a543990e51');
	disablePattern('fc2007809ff322001d753758442e70b1');
	disablePattern('459056e64fd08300f8a571dd0210c717');
	disablePattern('adf67ae25fd2230049d89cb3de73139e');

	createProbe('Windows - OS Information', 'exploration', '6325f3ef0a0006bc3e2e2d83e75dc02a', 'c759f913c313200031e65ad8cbba8fd7');
	createProbe('WMIRunner-Windows - Amazon EC2', 'exploration', '45c3bb40374112000e4d03488e41f1c5', 'c277921c0a0a0b1c00719b2c948d2719', 'gs.getProperty(\'glide.discovery.discover_aws_ec2_host_metadata\') == \'true\'');
	createProbe('MultiProbe-Windows - Storage 2012', 'exploration', '9cf457b447510200d06d6f2ccee49049', 'c277e37c0a0a0b1c007b6daef23d8786', 'new Version(values.get(\'osVersion\')).greaterThan(\'6.1\')');
	createProbe('WMIRunner-Windows - Cluster', 'exploration', '123a9e6d4a36231d004cc8aa8252c209', 'c277921c0a0a0b1c00719b2c948d2719', 'values.get(\'isNode\')==\'true\'');
	createProbe('WMIRunner-Hyper-V - Cluster', 'exploration', '3a5e0896c330300031e65ad8cbba8f29', 'c759f913c313200031e65ad8cbba8fd7', 'values.get(\'isNode\')==\'true\'');
	createProbe('SNMP-SNMP - Routing', 'exploration', 'a2bada940a0a0b6100d5e020a828fdeb', 'b9e8a5b40ab30151007111d556cd0718', 'values.get(\'routing\') == \'true\' && values.get(\'block_router_exploration\') == \'false\'');
	createProbe('SNMP-SNMP - Routing', 'exploration', 'a2bada940a0a0b6100d5e020a828fdeb', 'b9d852c60ab3015100c74a8e158664ca', 'values.get(\'routing\') == \'true\' && values.get(\'block_router_exploration\') == \'false\'');
	createProbe('SSHCommand-Solaris - Zones', 'exploration', '17c3b4ce0a0a032700d51f4b08a8bd1e', 'c27c58df0a0a0b1c00991796ad6971ee');
	createProbe('SSHCommand-AIX - OS Patches', 'exploration', '20491c4c0a0a030e00b8bf8e17d26a33', 'c27bf9730a0a0b1c00427d6ef5e9c2e1');
	createProbe('SSHCommand-HP-UX - OS Patches', 'exploration', '204c4e480a0a030e006fd37c571ace17', 'c27bd8460a0a0b1c009b4a01dd95229e');
	createProbe('SSHCommand-Linux - Memory', 'exploration', '21297f810a0a0a8b0030701a2e4b01a5', 'c27c1ccf0a0a0b1c006149d6a38f3958');
	createProbe('SSHCommand-Linux - Find FQDN', 'exploration', '0d277610ef30110098d5925495c0fbc5', 'c27c1ccf0a0a0b1c006149d6a38f3958');
	createProbe('MultiProbe-Windows - Storage 2008', 'exploration', 'c34a5e9237422100dcd445cbbebe5d30', '0e5b55adc0a80a390075725cd6b0eeb5');
	createProbe('WMIRunner-Windows - Amazon EC2', 'exploration', '45c3bb40374112000e4d03488e41f1c5', '156bf4a137010100a664384c5dbe5d75', 'gs.getProperty(\'glide.discovery.discover_aws_ec2_host_metadata\') == \'true\'');
	createProbe('WMIRunner-Hyper-V - Resource Pools', 'exploration', '2751b68cc320300031e65ad8cbba8f00', '156bf4a137010100a664384c5dbe5d75', 'values.get(\'isHyperV\')==\'true\'');
	createProbe('WMIRunner-Hyper-V - Virtual Machines', 'exploration', '687d9297c313200031e65ad8cbba8f2d', '156bf4a137010100a664384c5dbe5d75', 'values.get(\'isHyperV\')==\'true\'');
	createProbe('WMIRunner-Hyper-V - Virtual Networks', 'exploration', '3471f675c350300031e65ad8cbba8fca', '156bf4a137010100a664384c5dbe5d75', 'values.get(\'isHyperV\')==\'true\'');
	createProbe('WMIRunner-Windows - Cluster', 'exploration', '123a9e6d4a36231d004cc8aa8252c209', '156bf4a137010100a664384c5dbe5d75', 'values.get(\'isNode\')==\'true\'');
	createProbe('WMIRunner-Windows - CPU / Memory', 'exploration', 'b141fd470a0a0ba5001d3c32c7d834fb', '156bf4a137010100a664384c5dbe5d75');
	createProbe('MultiProbe-Windows - Identity', 'identification', '8e2007e60a0a0b500044825832ac3d63', '156bf4a137010100a664384c5dbe5d75');
	createProbe('SSHCommand-HP-UX - CPU Speed', 'exploration', '287ee5530a0a0b481798012461c01dbc', 'c27bd8460a0a0b1c009b4a01dd95229e');
	createProbe('SSHCommand-HP-UX - Total Memory', 'exploration', '28e1854e0a0a0b48650bebd7e38556c1', 'c27bd8460a0a0b1c009b4a01dd95229e');
	createProbe('Powershell-Windows - Network ARP Table', 'exploration', 'd24ece5b9f02310020eede0f842e7086', '0e5b55adc0a80a390075725cd6b0eeb5');
	createProbe('Powershell-Windows - Network ARP Table', 'exploration', 'd24ece5b9f02310020eede0f842e7086', 'c277e37c0a0a0b1c007b6daef23d8786');
	createProbe('SSHCommand-UNIX - OS Filesystems', 'exploration', 'bd7f3a7a0a00002d0051caaec62f1cc6', 'c27bf9730a0a0b1c00427d6ef5e9c2e1');
	createProbe('SSHCommand-UNIX - OS Filesystems', 'exploration', 'bd7f3a7a0a00002d0051caaec62f1cc6', 'c27bd8460a0a0b1c009b4a01dd95229e');
	createProbe('SSHCommand-HP-UX - Hardware Model', 'exploration', '4cfe13470a0a0b20008b4b6f4d18d683', 'c27bd8460a0a0b1c009b4a01dd95229e');
	createProbe('SSHCommand-HP-UX - CPU Info', 'exploration', '5246daf50a0a0b2000741895af5905b5', 'c27bd8460a0a0b1c009b4a01dd95229e');
	createProbe('WMIRunner-Hyper-V - Resource Pools', 'exploration', '2751b68cc320300031e65ad8cbba8f00', 'c759f913c313200031e65ad8cbba8fd7');
	createProbe('MultiProbe-Windows - Storage 2008', 'exploration', 'c34a5e9237422100dcd445cbbebe5d30', 'c277e37c0a0a0b1c007b6daef23d8786', 'gs.nil(values.get(\'osVersion\')) || new Version(values.get(\'osVersion\')).lessThan(\'6.2\')');
	createProbe('DNS-DNS', 'exploration', '845331880a0a0bab008f5580d5b94a71', 'c759f913c313200031e65ad8cbba8fd7');
	createProbe('SSHCommand-Solaris - Disks', 'exploration', '6320a3c40a0a030c007aba13a2583b81', 'c27c58df0a0a0b1c00991796ad6971ee');
	createProbe('WMIRunner-Windows - OS Information', 'exploration', '6325f3ef0a0006bc3e2e2d83e75dc02a', '156bf4a137010100a664384c5dbe5d75');
	createProbe('WMIRunner-Windows - Printers', 'exploration', 'e2c966310a0a0ba50034ee1b8877a237', '156bf4a137010100a664384c5dbe5d75');
	createProbe('SNMP-SNMP - Switching', 'exploration', '62e9bb500a0a0b02002321355fa55452', 'b9d852c60ab3015100c74a8e158664ca', 'values.get(\'switching\') == \'true\' && values.get(\'block_switch_exploration\') == \'false\' && values.get(\'discover\') != \'Nets\'');
	createProbe('SSHCommand-Linux - Distribution', 'exploration', '5d0d176d0a0a0b5a38e584a5d95682db', 'c27c1ccf0a0a0b1c006149d6a38f3958');
	createProbe('SSHCommand-Linux - Memory Modules', 'exploration', '6ac0fab40a0007171dfa9895dbc49411', 'c27c1ccf0a0a0b1c006149d6a38f3958');
	createProbe('WMIRunner-Windows - CPU / Memory', 'exploration', 'b141fd470a0a0ba5001d3c32c7d834fb', 'c759f913c313200031e65ad8cbba8fd7');
	createProbe('SSHCommand-Solaris - CPU', 'exploration', '7b73e821ef75300098d5925495c0fb08', 'c27c58df0a0a0b1c00991796ad6971ee');
	createProbe('SSHCommand-Solaris - Memory', 'exploration', '6fd293e24a35ce820171b597fd3342ac', 'c27c58df0a0a0b1c00991796ad6971ee');
	createProbe('WMIRunner-Windows - OS Information', 'exploration', '6325f3ef0a0006bc3e2e2d83e75dc02a', 'c277921c0a0a0b1c00719b2c948d2719');
	createProbe('WMIRunner-Windows - OS Information', 'exploration', '6325f3ef0a0006bc3e2e2d83e75dc02a', '0e5b55adc0a80a390075725cd6b0eeb5');
	createProbe('WMIRunner-Windows - OS Information', 'exploration', '6325f3ef0a0006bc3e2e2d83e75dc02a', 'c277e37c0a0a0b1c007b6daef23d8786');
	createProbe('WMIRunner-Windows - Amazon EC2', 'exploration', '45c3bb40374112000e4d03488e41f1c5', 'c277e37c0a0a0b1c007b6daef23d8786', 'gs.getProperty(\'glide.discovery.discover_aws_ec2_host_metadata\') == \'true\'');
	createProbe('Powershell-Windows - Network ARP Table', 'exploration', 'd24ece5b9f02310020eede0f842e7086', '156bf4a137010100a664384c5dbe5d75');
	createProbe('WMIRunner-Hyper-V - Virtual Machines', 'exploration', '687d9297c313200031e65ad8cbba8f2d', '0e5b55adc0a80a390075725cd6b0eeb5', 'values.get(\'isHyperV\')==\'true\'');
	createProbe('SNMP-SNMP - Switching', 'exploration', '62e9bb500a0a0b02002321355fa55452', 'b9e8a5b40ab30151007111d556cd0718', 'values.get(\'switching\') == \'true\' && values.get(\'block_switch_exploration\') == \'false\' && values.get(\'discover\') != \'Nets\'');
	createProbe('SSHCommand-UNIX - OS Uptime', 'exploration', '7bbde08c0a0a0b2500e88aeee4bd8ed5', 'c27bd8460a0a0b1c009b4a01dd95229e');
	createProbe('SSHCommand-UNIX - OS Uptime', 'exploration', '7bbde08c0a0a0b2500e88aeee4bd8ed5', 'c27bf9730a0a0b1c00427d6ef5e9c2e1');
	createProbe('SSHCommand-UNIX - OS Uptime', 'exploration', '7bbde08c0a0a0b2500e88aeee4bd8ed5', 'c27c1ccf0a0a0b1c006149d6a38f3958');
	createProbe('SSHCommand-UNIX - OS Uptime', 'exploration', '7bbde08c0a0a0b2500e88aeee4bd8ed5', 'c27c58df0a0a0b1c00991796ad6971ee');
	createProbe('Powershell-Windows - Network ARP Table', 'exploration', 'd24ece5b9f02310020eede0f842e7086', 'c277921c0a0a0b1c00719b2c948d2719');
	createProbe('MultiProbe-Windows - Identity', 'identification', '8e2007e60a0a0b500044825832ac3d63', 'c759f913c313200031e65ad8cbba8fd7');
	createProbe('MultiProbe-SNMP - Identity', 'identification', '861bec1a0ab301530025151b59a3c6b0', 'b9d852c60ab3015100c74a8e158664ca');
	createProbe('MultiProbe-SNMP - Identity', 'identification', '861bec1a0ab301530025151b59a3c6b0', 'b9e8a5b40ab30151007111d556cd0718');
	createProbe('SSHCommand-Linux - Network ARP Tables', 'exploration', '251b065b9f02310020eede0f842e7040', 'c27c1ccf0a0a0b1c006149d6a38f3958');
	createProbe('WMIRunner-Windows - Amazon EC2', 'exploration', '45c3bb40374112000e4d03488e41f1c5', '0e5b55adc0a80a390075725cd6b0eeb5', 'gs.getProperty(\'glide.discovery.discover_aws_ec2_host_metadata\') == \'true\'');
	createProbe('WMIRunner-Windows - Cluster', 'exploration', '123a9e6d4a36231d004cc8aa8252c209', '0e5b55adc0a80a390075725cd6b0eeb5', 'values.get(\'isNode\')==\'true\'');
	createProbe('WMIRunner-Windows - CPU / Memory', 'exploration', 'b141fd470a0a0ba5001d3c32c7d834fb', '0e5b55adc0a80a390075725cd6b0eeb5');
	createProbe('WMIRunner-Windows - Printers', 'exploration', 'e2c966310a0a0ba50034ee1b8877a237', '0e5b55adc0a80a390075725cd6b0eeb5');
	createProbe('MultiProbe-Linux - Identity', 'identification', '8e8d62060a0a0baa0a9b38b69341a321', 'c27c1ccf0a0a0b1c006149d6a38f3958');
	createProbe('MultiProbe-Windows - Identity', 'identification', '8e2007e60a0a0b500044825832ac3d63', 'c277921c0a0a0b1c00719b2c948d2719');
	createProbe('MultiProbe-Windows - Identity', 'identification', '8e2007e60a0a0b500044825832ac3d63', '0e5b55adc0a80a390075725cd6b0eeb5');
	createProbe('MultiProbe-HP-UX - Identity', 'identification', '8f64dd100a0a0baa61fbb3161da04b5f', 'c27bd8460a0a0b1c009b4a01dd95229e');
	createProbe('MultiProbe-AIX - Identity', 'identification', '8f6552de0a0a0baa162708e8abb3bcc0', 'c27bf9730a0a0b1c00427d6ef5e9c2e1');
	createProbe('MultiProbe-Solaris - Identity', 'identification', '8f65e14e0a0a0baa2f810452d276ab62', 'c27c58df0a0a0b1c00991796ad6971ee');
	createProbe('MultiProbe-Windows - Identity', 'identification', '8e2007e60a0a0b500044825832ac3d63', 'c277e37c0a0a0b1c007b6daef23d8786');
	createProbe('MultiProbe-Windows - Storage 2012', 'exploration', '9cf457b447510200d06d6f2ccee49049', '156bf4a137010100a664384c5dbe5d75');
	createProbe('SSHCommand-UNIX - Find FQDN', 'exploration', 'b5fca69eef30110098d5925495c0fb64', 'c27c58df0a0a0b1c00991796ad6971ee');
	createProbe('Powershell-Windows - Network ARP Table', 'exploration', 'd24ece5b9f02310020eede0f842e7086', 'c759f913c313200031e65ad8cbba8fd7');
	createProbe('WMIRunner-Hyper-V - Virtual Networks', 'exploration', '3471f675c350300031e65ad8cbba8fca', 'c759f913c313200031e65ad8cbba8fd7');
	createProbe('SNMP-SNMP - Network - ArpTable', 'exploration', 'd1f275d79f02310020eede0f842e70bf', 'b9d852c60ab3015100c74a8e158664ca', 'values.get(\'block_switch_exploration\') == \'false\' && values.get(\'discover\') != \'Nets\'');
	createProbe('SSHCommand-AIX - Hardware Model', 'exploration', '9f52e2e50a0a146700093a064d8365f8', 'c27bf9730a0a0b1c00427d6ef5e9c2e1');
	createProbe('SSHCommand-AIX - OS Release', 'exploration', '9f2b308d0a0a146700408d6e1cd354f7', 'c27bf9730a0a0b1c00427d6ef5e9c2e1');
	createProbe('WMIRunner-Windows - Printers', 'exploration', 'e2c966310a0a0ba50034ee1b8877a237', 'c759f913c313200031e65ad8cbba8fd7');
	createProbe('SSHCommand-AIX - CPU', 'exploration', 'a7117dcca9fe156100afbcd624901028', 'c27bf9730a0a0b1c00427d6ef5e9c2e1');
	createProbe('WMIRunner-Hyper-V - Cluster', 'exploration', '3a5e0896c330300031e65ad8cbba8f29', '0e5b55adc0a80a390075725cd6b0eeb5', 'values.get(\'isNode\')==\'true\' && values.get(\'isHyperV\')==\'true\'');
	createProbe('WMIRunner-Windows - CPU / Memory', 'exploration', 'b141fd470a0a0ba5001d3c32c7d834fb', 'c277921c0a0a0b1c00719b2c948d2719');
	createProbe('WMIRunner-Windows - CPU / Memory', 'exploration', 'b141fd470a0a0ba5001d3c32c7d834fb', 'c277e37c0a0a0b1c007b6daef23d8786');
	createProbe('SSHCommand-AIX - Memory', 'exploration', 'b577856b0a00002d005798ea7529a40b', 'c27bf9730a0a0b1c00427d6ef5e9c2e1');
	createProbe('SSHCommand-AIX - OS Revision', 'exploration', 'bd75ef7b0a00002d003ca1dfd66a0b1b', 'c27bf9730a0a0b1c00427d6ef5e9c2e1');
	createProbe('SNMP-SNMP - Switch - Vlan', 'exploration', '636e0315eb71310020ee20b6a206fea0', 'b9e8a5b40ab30151007111d556cd0718', 'values.get(\'switching\') == \'true\' && values.get(\'block_switch_exploration\') == \'false\' && values.get(\'discover\') != \'Nets\'');
	createProbe('WMIRunner-Hyper-V - Virtual Networks', 'exploration', '3471f675c350300031e65ad8cbba8fca', '0e5b55adc0a80a390075725cd6b0eeb5', 'values.get(\'isHyperV\')==\'true\'');
	createProbe('SSHCommand-Linux - CPU', 'exploration', 'c7623b68a9fe1561006b8a2ad5a90231', 'c27c1ccf0a0a0b1c006149d6a38f3958');
	createProbe('SSHCommand-Linux - Storage', 'exploration', '9f9f9bf30a0a1467007642ca5a5fb6f0', 'c27c1ccf0a0a0b1c006149d6a38f3958');
	createProbe('MultiProbe-Windows - Storage 2008', 'exploration', 'c34a5e9237422100dcd445cbbebe5d30', 'c277921c0a0a0b1c00719b2c948d2719');
	createProbe('DNS-DNS', 'exploration', '845331880a0a0bab008f5580d5b94a71', 'c277e37c0a0a0b1c007b6daef23d8786');
	createProbe('DNS-DNS', 'exploration', '845331880a0a0bab008f5580d5b94a71', '0e5b55adc0a80a390075725cd6b0eeb5');
	createProbe('DNS-DNS', 'exploration', '845331880a0a0bab008f5580d5b94a71', 'c277921c0a0a0b1c00719b2c948d2719');
	createProbe('WMIRunner-Hyper-V - Virtual Machines', 'exploration', '687d9297c313200031e65ad8cbba8f2d', 'c759f913c313200031e65ad8cbba8fd7');
	createProbe('SSHCommand-Solaris - Network ARP Tables', 'exploration', '44729a9b9f02310020eede0f842e70aa', 'c27c58df0a0a0b1c00991796ad6971ee');
	createProbe('SSHCommand-UNIX - Find FQDN', 'exploration', 'b5fca69eef30110098d5925495c0fb64', 'c27bd8460a0a0b1c009b4a01dd95229e');
	createProbe('WMIRunner-Windows - Printers', 'exploration', 'e2c966310a0a0ba50034ee1b8877a237', 'c277921c0a0a0b1c00719b2c948d2719');
	createProbe('WMIRunner-Windows - Printers', 'exploration', 'e2c966310a0a0ba50034ee1b8877a237', 'c277e37c0a0a0b1c007b6daef23d8786');
	createProbe('WMIRunner-Hyper-V - Cluster', 'exploration', '3a5e0896c330300031e65ad8cbba8f29', '156bf4a137010100a664384c5dbe5d75', 'values.get(\'isNode\')==\'true\' && values.get(\'isHyperV\')==\'true\'');
	createProbe('SSHCommand-Solaris - Hardware Model', 'exploration', 'e71ace1ba9fe1561011c33bdea27a1bb', 'c27c58df0a0a0b1c00991796ad6971ee');
	createProbe('SNMP-SNMP - Switch - Vlan', 'exploration', '636e0315eb71310020ee20b6a206fea0', 'b9d852c60ab3015100c74a8e158664ca', 'values.get(\'block_switch_exploration\') == \'false\' && values.get(\'discover\') != \'Nets\'');
	createProbe('DNS-DNS', 'exploration', '845331880a0a0bab008f5580d5b94a71', 'c27bf9730a0a0b1c00427d6ef5e9c2e1');
	createProbe('SSHCommand-UNIX - Find FQDN', 'exploration', 'b5fca69eef30110098d5925495c0fb64', 'c27bf9730a0a0b1c00427d6ef5e9c2e1');
	createProbe('MultiProbe-Windows - Storage 2008', 'exploration', 'c34a5e9237422100dcd445cbbebe5d30', 'c759f913c313200031e65ad8cbba8fd7');
	createProbe('DNS-DNS', 'exploration', '845331880a0a0bab008f5580d5b94a71', '156bf4a137010100a664384c5dbe5d75');
	createProbe('DNS-DNS', 'exploration', '845331880a0a0bab008f5580d5b94a71', 'c27bd8460a0a0b1c009b4a01dd95229e');
	createProbe('DNS-DNS', 'exploration', '845331880a0a0bab008f5580d5b94a71', 'c27c1ccf0a0a0b1c006149d6a38f3958');
	createProbe('DNS-DNS', 'exploration', '845331880a0a0bab008f5580d5b94a71', 'b9d852c60ab3015100c74a8e158664ca', 'values.get(\'discover\') != \'Nets\'');
	createProbe('DNS-DNS', 'exploration', '845331880a0a0bab008f5580d5b94a71', 'b9e8a5b40ab30151007111d556cd0718', 'values.get(\'discover\') != \'Nets\'');
	createProbe('WMIRunner-Hyper-V - Resource Pools', 'exploration', '2751b68cc320300031e65ad8cbba8f00', '0e5b55adc0a80a390075725cd6b0eeb5', 'values.get(\'isHyperV\')==\'true\'');
	createProbe('SSHCommand-Linux - Amazon EC2', 'exploration', 'd4792a77377012000e4d03488e41f15a', 'c27c1ccf0a0a0b1c006149d6a38f3958', 'gs.getProperty(\'glide.discovery.discover_aws_ec2_host_metadata\') == \'true\'');
	createProbe('MultiProbe-Windows - Identity', 'identification', '8e2007e60a0a0b500044825832ac3d63', '98d98911cb293200a03ef59ea34c9c7e');
	createProbe('MultiProbe-Windows - Storage 2012', 'exploration', '9cf457b447510200d06d6f2ccee49049', '98d98911cb293200a03ef59ea34c9c7e');
	createProbe('Powershell-Windows - Network ARP Table', 'exploration', 'd24ece5b9f02310020eede0f842e7086', '98d98911cb293200a03ef59ea34c9c7e');
	createProbe('WMIRunner-Windows - Amazon EC2', 'exploration', '45c3bb40374112000e4d03488e41f1c5', '98d98911cb293200a03ef59ea34c9c7e');
	createProbe('WMIRunner-Windows - Cluster', 'exploration', '123a9e6d4a36231d004cc8aa8252c209', '98d98911cb293200a03ef59ea34c9c7e');
	createProbe('WMIRunner-Windows - CPU / Memory', 'exploration', 'b141fd470a0a0ba5001d3c32c7d834fb', '98d98911cb293200a03ef59ea34c9c7e');
	createProbe('WMIRunner-Windows - OS Information', 'exploration', '6325f3ef0a0006bc3e2e2d83e75dc02a', '98d98911cb293200a03ef59ea34c9c7e');
	createProbe('WMIRunner-Windows - Printers', 'exploration', 'e2c966310a0a0ba50034ee1b8877a237', '98d98911cb293200a03ef59ea34c9c7e');
	createProbe('SSHCommand-Linux - Azure', 'exploration', 'c52d09cbdbed76003398f1351d96192d', 'c27c1ccf0a0a0b1c006149d6a38f3958', 'gs.getProperty(\'glide.discovery.discover_azure_host_metadata\') == \'true\'');
	createProbe('Powershell-Windows - Azure', 'exploration', '8d028772dbd532003398f1351d961992', 'c277e37c0a0a0b1c007b6daef23d8786', 'gs.getProperty(\'glide.discovery.discover_azure_host_metadata\') == \'true\'');
	createProbe('Powershell-Windows - Azure', 'exploration', '8d028772dbd532003398f1351d961992', '156bf4a137010100a664384c5dbe5d75', 'gs.getProperty(\'glide.discovery.discover_azure_host_metadata\') == \'true\'');
	createProbe('Powershell-Windows - Azure', 'exploration', '8d028772dbd532003398f1351d961992', '0e5b55adc0a80a390075725cd6b0eeb5', 'gs.getProperty(\'glide.discovery.discover_azure_host_metadata\') == \'true\'');
	createProbe('Powershell-Windows - Azure', 'exploration', '8d028772dbd532003398f1351d961992', 'c277921c0a0a0b1c00719b2c948d2719', 'gs.getProperty(\'glide.discovery.discover_azure_host_metadata\') == \'true\'');
	createProbe('DNS-DNS', 'exploration', '845331880a0a0bab008f5580d5b94a71', '98d98911cb293200a03ef59ea34c9c7e');
	createProbe('WMIRunner-Hyper-V - Cluster', 'exploration', '3a5e0896c330300031e65ad8cbba8f29', '98d98911cb293200a03ef59ea34c9c7e', 'values.get(\'isNode\')==\'true\' && values.get(\'isHyperV\')==\'true\'');
	createProbe('WMIRunner-Hyper-V - Resource Pools', 'exploration', '2751b68cc320300031e65ad8cbba8f00', '98d98911cb293200a03ef59ea34c9c7e', 'values.get(\'isHyperV\')==\'true\'');
	createProbe('WMIRunner-Hyper-V - Virtual Networks', 'exploration', '3471f675c350300031e65ad8cbba8fca', '98d98911cb293200a03ef59ea34c9c7e', 'values.get(\'isHyperV\')==\'true\'');
	createProbe('WMIRunner-Hyper-V - Virtual Machines', 'exploration', '687d9297c313200031e65ad8cbba8f2d', '98d98911cb293200a03ef59ea34c9c7e', 'values.get(\'isHyperV\')==\'true\'');
	
	// windows 2019
	createProbe('MultiProbe-Windows - Identity', 'identification', '8e2007e60a0a0b500044825832ac3d63', '5456b6e25fd2230049d89cb3de7313e7');
	createProbe('MultiProbe-Windows - Storage 2012', 'exploration', '9cf457b447510200d06d6f2ccee49049', '5456b6e25fd2230049d89cb3de7313e7');
	createProbe('Powershell-Windows - Network ARP Table', 'exploration', 'd24ece5b9f02310020eede0f842e7086', '5456b6e25fd2230049d89cb3de7313e7');
	createProbe('WMIRunner-Windows - Amazon EC2', 'exploration', '45c3bb40374112000e4d03488e41f1c5', '5456b6e25fd2230049d89cb3de7313e7');
	createProbe('WMIRunner-Windows - Cluster', 'exploration', '123a9e6d4a36231d004cc8aa8252c209', '5456b6e25fd2230049d89cb3de7313e7');
	createProbe('WMIRunner-Windows - CPU / Memory', 'exploration', 'b141fd470a0a0ba5001d3c32c7d834fb', '5456b6e25fd2230049d89cb3de7313e7');
	createProbe('WMIRunner-Windows - OS Information', 'exploration', '6325f3ef0a0006bc3e2e2d83e75dc02a', '5456b6e25fd2230049d89cb3de7313e7');
	createProbe('WMIRunner-Windows - Printers', 'exploration', 'e2c966310a0a0ba50034ee1b8877a237', '5456b6e25fd2230049d89cb3de7313e7');
	createProbe('DNS-DNS', 'exploration', '845331880a0a0bab008f5580d5b94a71', '5456b6e25fd2230049d89cb3de7313e7');
	createProbe('WMIRunner-Hyper-V - Cluster', 'exploration', '3a5e0896c330300031e65ad8cbba8f29', '5456b6e25fd2230049d89cb3de7313e7', 'values.get(\'isNode\')==\'true\' && values.get(\'isHyperV\')==\'true\'');
	createProbe('WMIRunner-Hyper-V - Resource Pools', 'exploration', '2751b68cc320300031e65ad8cbba8f00', '5456b6e25fd2230049d89cb3de7313e7', 'values.get(\'isHyperV\')==\'true\'');
	createProbe('WMIRunner-Hyper-V - Virtual Networks', 'exploration', '3471f675c350300031e65ad8cbba8fca', '5456b6e25fd2230049d89cb3de7313e7', 'values.get(\'isHyperV\')==\'true\'');
	createProbe('WMIRunner-Hyper-V - Virtual Machines', 'exploration', '687d9297c313200031e65ad8cbba8f2d', '5456b6e25fd2230049d89cb3de7313e7', 'values.get(\'isHyperV\')==\'true\'');
	
	setPropertyForOSProbes('true');
	
}

function createProbe(name, phase, child, classy, script) {
	var gr = new GlideRecord('discovery_classifier_probe');
	gr.addQuery('child', child);
	gr.addQuery('classy', classy);
	gr.query();
	if (gr.next()) {
		if (gr.getValue('active') == 'false') {
			gr.setValue('active', 'true');
			gr.update();
		}
		gs.log('Record for probe "' + name + '" already exists: ' + gr.getValue('sys_id'));
		return;
	}

	gr.setValue('child', child);
	gr.setValue('classy', classy);
	gr.setValue('active', 'true');
	gr.setValue('name', name);
	gr.setValue('phase', phase);
	if (script)
		gr.setValue('condition_script', script);
	gr.insert();
	gs.log('Created record for probe ' + name);
}

function disablePattern(sysId) {
	var gr = new GlideRecord('discovery_classifier_probe');
	if (sysId && gr.get('sys_id', sysId)) {
		gr.setValue('active', 'false');
		gr.update();
	}
}
	
function setPropertyForOSProbes(enable) {
	var gr = new GlideRecord('sys_properties');
	gr.addQuery('name','glide.discovery.ip_based.active');
	gr.query();
	if (gr.hasNext()) {
		gr.next();
		gr.setValue('value',enable);
		gr.upate();
	} else {
		gr.initialize();
		gr.setValue('name','glide.discovery.ip_based.active');
		gr.setValue('value',enable);
		gr.insert();
	}
}

})();
