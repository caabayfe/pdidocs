var ConnectionURL = Class.create();

ConnectionURL.prototype = {
	initialize : function(gr) {
		this.sysDataSourceGR = gr;
		this.connection_url;
	},
	
	getJDBCConnectionURL : function () {
		var SQLServer = "com.microsoft.sqlserver.jdbc.SQLServerDriver";
		var MySQL = "org.mariadb.jdbc.Driver";
		var oldMySQL = "com.mysql.jdbc.Driver";
		var Oracle = "oracle.jdbc.OracleDriver";
		var DB2 = "com.ibm.db2.jcc.DB2Driver";
		var Sybase = "com.sybase.jdbc3.jdbc.SybDriver";
		
		var format = this.sysDataSourceGR.format;
		var instanceName = this.sysDataSourceGR.instance_name;
		var databaseName = this.sysDataSourceGR.database_name;
		var server = this.sysDataSourceGR.host;
		var port = this.sysDataSourceGR.port;
		var connection_url_parameters =  this.sysDataSourceGR.connection_url_parameters;
		
		if (format == MySQL || format == oldMySQL || format == SQLServer) {
			if (!this.sysDataSourceGR.port.nil())
				port = ":" + port;
			else
				port = "";
			
			var driver = "jdbc:mysql://";
			if (format == SQLServer)
				driver = "jdbc:sqlserver://";
			
			this.connection_url = driver + server + port;
			
			if (format == SQLServer) {
				if (JSUtil.notNil(instanceName))
					this.connection_url += ";instanceName=" + instanceName;
				
				this.connection_url += ";selectMethod=cursor;databaseName=" + databaseName;
				
				if (this.sysDataSourceGR.use_integrated_authentication == true)
					this.connection_url += ";integratedSecurity=true";
				
			} else {
				this.connection_url += "/" + databaseName;
			}
		}
		
		if (format == Sybase) {
			this.connection_url = "jdbc:sybase:Tds:" + server + ":" +
			port + "/" + databaseName;
		}
		
		if (format == Oracle) {
			this.connection_url = "jdbc:oracle:thin:@" + server + ":" +
			this.sysDataSourceGR.oracle_port + ":" + this.sysDataSourceGR.oracle_sid;
		}
		
		if (format == DB2) {
			this.connection_url = "jdbc:db2://" + server + ":" +
			port + "/" + databaseName;
		}
		
		if (JSUtil.notNil(connection_url_parameters)) {
			this.connection_url += ";" + connection_url_parameters;
		}
		return this.connection_url;
	},
	
	getConnectionURL : function () {
			return this.getJDBCConnectionURL();
	}
};

var j = new ConnectionURL(current);
current.connection_url = j.getConnectionURL();
