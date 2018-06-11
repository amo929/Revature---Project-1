package reimburse.servicing;

import java.util.ArrayList;

import reimburse.dao.UserDAOImpl;
import reimburse.pojo.User;

public class Servicing {
	
	
	public ArrayList<User> getAllUsers() {
		UserDAOImpl userdao = new UserDAOImpl();
		return userdao.getAll();
	}
	
}
