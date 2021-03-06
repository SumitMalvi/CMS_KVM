
import java.sql.*;

import javax.sql.DataSource;

import dbal.HostList;
import dbal.VMStatus;
import play.Application;
import play.GlobalSettings;
import play.db.*;
import java.util.Timer;

public class Global extends GlobalSettings {
	public void onStart(Application app) {

		initDB();
		
		Timer nwHostProber=new Timer(true);
		nwHostProber.schedule(new HostList(), 1000);
		Timer nwVMProber=new Timer(true);
		nwVMProber.schedule(new VMStatus(), 1000);
			
	}
	
	private void initDB() {
		//create tables
		DataSource ds=DB.getDataSource();
		Connection dbConn=null;
		Statement stmt=null;
		
		try {
			System.out.println("Creating table in given database ...");
			dbConn = ds.getConnection();
			stmt= dbConn.createStatement();
			String sql="CREATE TABLE IF NOT EXISTS Host " +
					"(hostIP VARCHAR(255), " + 
					" hostName VARCHAR(255) NOT NULL, " +
					"nfs1	BOOLEAN NOT NULL, " +
					"nfs2	BOOLEAN NOT NULL, " +
					"nfs3	BOOLEAN NOT NULL, " +
					"active BOOLEAN NOT NULL, " +
					" PRIMARY KEY ( hostIP ))"; 
			stmt.executeUpdate(sql);
			stmt.executeUpdate("TRUNCATE TABLE Host");
		
			sql = "CREATE TABLE IF NOT EXISTS VM " +
					"(vmuuid VARCHAR(255) NOT NULL, " +
					" state VARCHAR(255) NOT NULL, "+
					" cpu DECIMAL(5,2) NOT NULL, "+
					" memory DECIMAL(5,2) NOT NULL "+					
					") WITH OIDS";
			stmt.executeUpdate("TRUNCATE TABLE VM");
			if((stmt.executeUpdate(sql))<0)
				System.out.println("Created vm table in given database...");
			sql = "CREATE TABLE IF NOT EXISTS Network " +
	                "(name VARCHAR(255) NOT NULL, " +
	                "host VARCHAR(255) NOT NULL, " + 
	                "mode  VARCHAR(15), " +
	                "bridgename  VARCHAR(255),"+
	                "autostart VARCHAR(5) NOT NULL ,"+
	                "PRIMARY KEY(name))"; 
	                
	    	if((stmt.executeUpdate(sql))<0)
	    		System.out.println("Created NETWORK table in given database...");	

			stmt.close();
			dbConn.close();
			
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
}

