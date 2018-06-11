package reimburse.service;

import java.util.ArrayList;

import reimburse.dao.ReimbEmployeeDAOImpl;
import reimburse.dao.ReimbManagerDAOImpl;
import reimburse.dao.UserDAOImpl;
import reimburse.pojo.Reimbursement;
import reimburse.pojo.User;

public class ServiceERS {
	UserDAOImpl userdao = new UserDAOImpl();
	ReimbEmployeeDAOImpl employeedao = new ReimbEmployeeDAOImpl();
	ReimbManagerDAOImpl managerdao = new ReimbManagerDAOImpl();
	
	
	private ArrayList<User> getAllUsers() {
		return userdao.getAll();
	}
	
	public ArrayList<Reimbursement> getAllReimb(int id, int role) {
		if(role == 1) {
			return employeedao.getAll(id);
		}
		else if(role == 2) {
			return managerdao.getAll(id);
		}
		return null;
	}
	
	/**
	 * 
	 * 
	 * @param username
	 * @param password
	 * @param firstname
	 * @param lastname
	 * @param email
	 * @param role
	 * @return 0 for good, 1 for bad username, 2 for bad email, 3 for bad both
	 */
	public int register(String username, String password, String firstname, String lastname, String email, String role) {
		ArrayList<User> list = getAllUsers();
		for(User u : list) {
			if(u.getUsername().equals(username) && u.getEmail().equals(email)) {
				return 3;
			}
			else if(u.getEmail().equals(email)) {
				return 2;
			}
			else if(u.getUsername().equals(username)) {
				return 1;
			}
		}
		
		User newguy = userdao.insertUser(username, password, firstname, lastname, email, role);
		return 0;
	}
	
	/**
	 * 
	 * @param username
	 * @param password
	 * @return 0 for good, 1 for bad 
	 */
	public int login(String username, String password) {
		ArrayList<User> list = getAllUsers();
		for(User u : list) {
			if(u.getUsername().equals(username) && u.getPassword().equals(password)) {
				return 0;
			}			
		}
		return 1;
	}
	
	/**
	 * Inserts a ticket
	 * @param amount
	 * @param description
	 * @param username
	 * @param type
	 */
	public void insertTicket(double amount, String description, String username, String type) {
		if(amount <= 0 || description == null) {
			return;
		}
		
		User author = getUser(username);		
		employeedao.insertTicket(amount, description, author, type);
	}
	
	/**
	 * Resolves a ticket
	 * @param reimbid
	 * @param managerid
	 * @param approved
	 */
	public void resolveTicket(int reimbid, int managerid, boolean approved) {
		managerdao.resolveTicket(reimbid, managerid, approved);
	}
	
	public User getUser(String username) {
		ArrayList<User> list = getAllUsers();
		for(User u : list) {
			if(u.getUsername().equals(username)) {
				return u;
			}
		}
		return null;
	}

}
