package reimburse.servlet;

import java.io.IOException;
import java.util.ArrayList;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.fasterxml.jackson.databind.ObjectMapper;

import reimburse.pojo.Reimbursement;
import reimburse.pojo.User;
import reimburse.service.ServiceERS;

public class NiceServlet extends HttpServlet {
	
	ServiceERS serv = new ServiceERS();
	
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		System.out.println("REACHED THE GET METHOD");
		
		String topicname = req.getParameter("topic");
		System.out.println("the topicname: " + topicname);
		
		if(topicname.equalsIgnoreCase("reimb")) {
			int id = Integer.parseInt(req.getParameter("id"));
			int role = Integer.parseInt(req.getParameter("role"));
			System.out.println("id, role: [" + id + ", " + role + "]");
			ObjectMapper mapper = new ObjectMapper();
			if(req.getParameter("role").equals("1")) {
				// EMPLOYEE REIMBURSEMENT
				ArrayList<Reimbursement> list = serv.getAllReimb(id, role);
				String json = listToJSON(list);
				res.getWriter().write(json);
			}
			else if(req.getParameter("role").equals("2")) {
				// MANAGER REIMBURSEMENT
				ArrayList<Reimbursement> list = serv.getAllReimb(id, role);
				String json = listToJSON(list);
				res.getWriter().write(json);
			}
		}
	}

	public String listToJSON(ArrayList<Reimbursement> list) throws ServletException, IOException{
		ObjectMapper mapper = new ObjectMapper();
		StringBuilder str = new StringBuilder();
		//Create the JSON string
		str.append(("{\"list\": ["));
		for(Reimbursement r : list) {
			str.append(mapper.writeValueAsString(r));
			str.append(",");
		}
		if (str.charAt(str.length()-1)==',' && str.length() > 0) { //remove comma at the end
			   str.setLength(str.length() - 1);
		}
		str.append("]}");
		System.out.println(str.toString());
		return str.toString();
	}
	
	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		System.out.println("STARTING POST METHOD");
		String topicname = req.getParameter("topic");
		
		// POST METHOD FOR LOGIN
		if(topicname.equalsIgnoreCase("login")) {
			String username = req.getParameter("username");
			String password = req.getParameter("password");
			int result = serv.login(username, password);
			res.setContentType("text/html");
			if(result == 0) {
				ObjectMapper mapper = new ObjectMapper();
				User u = serv.getUser(req.getParameter("username"));
				String userjson = mapper.writeValueAsString(u);
				System.out.println(userjson);
				res.getWriter().write(userjson);
			}
			else if(result == 1) {
				String str = "{\"id\": -1}";
				res.getWriter().write(str);
			}
		}
		
		// POST METHOD FOR REGISTER
		if(topicname.equalsIgnoreCase("register")) {	
			int result = serv.register(
					req.getParameter("username"), 
					req.getParameter("password"), 
					req.getParameter("firstname"),
					req.getParameter("lastname"),  
					req.getParameter("email"), 
					req.getParameter("role")
					);
			res.setContentType("text/html");
			ObjectMapper mapper = new ObjectMapper();
			if(result == 0) {
				User u = serv.getUser(req.getParameter("username"));
				String userjson = mapper.writeValueAsString(u);
				System.out.println(userjson);
				res.getWriter().write(userjson);
			}
			else if(result == 1) {
				String str = "{\"id\": -1}";
				res.getWriter().write(str);
			}
			else if(result == 2) {
				String str = "{\"id\": -2}";
				res.getWriter().write(str);
			}
			else if(result == 3) {
				String str = "{\"id\": -3}";
				res.getWriter().write(str);
			}
		}

		// POST METHOD FOR INSERTING TICKET
		if(topicname.equalsIgnoreCase("insert")) {	
			Double amount = Double.parseDouble(req.getParameter("amount"));
			String desc = req.getParameter("description");
			String author = req.getParameter("username");
			String type = req.getParameter("type");
			System.out.println("parameters:");
			System.out.println(amount);
			System.out.println(desc);
			System.out.println(author);
			System.out.println(type);
			serv.insertTicket(amount, desc, author, type);
		}

		if(topicname.equalsIgnoreCase("resolve")) {	
//			reimbid: reimbid ,
//			managerid: curruser['id'],
//			approved: approved
			int reimbid = Integer.parseInt(req.getParameter("reimbid"));
			int managerid = Integer.parseInt(req.getParameter("managerid"));
			boolean approved = Boolean.parseBoolean(req.getParameter("approved"));
			System.out.println("parameters: ");
			System.out.println(reimbid);
			System.out.println(managerid);
			System.out.println(approved);
			serv.resolveTicket(reimbid, managerid, approved);
			System.out.println("AFTER RESOLVE");
		}
	}



	
	@Override
	public void init() throws ServletException {
		System.out.println("Servlet " + this.getServletName() + " has started");
	}
	@Override
	public void destroy() {
		System.out.println("Servlet " + this.getServletName() + " has stopped");
	}
	

	public String generateJSONData(String topicname) {
		StringBuffer returnData = null;
		
		if(topicname.equals("java")) {
			returnData = new StringBuffer("{\"topic\":{");
			returnData.append("\"name\": \"JAVA\", ");
			returnData.append("\"tutorial\": [");
			returnData.append("{\"name\": \"Introduction to java sockets\"},");
			returnData.append("{\"name\": \"Introduction to RMI\"},");
			returnData.append("{\"name\": \"equals method\"}]");
			returnData.append("}}");
		}
		else if(topicname.equals("oodp")) {
			returnData = new StringBuffer("{\"topic\":{");
			returnData.append("\"name\": \"oodp\", ");
			returnData.append("\"tutorial\": [");
			returnData.append("{\"name\": \"Factory\"},");
			returnData.append("{\"name\": \"Abstract\"},");
			returnData.append("{\"name\": \"singleton\"}]");
			returnData.append("}}");
		}
		else {
			returnData = new StringBuffer("{\"topic\":{");
			returnData.append("\"name\": \"topic: " + topicname + "\", ");
			returnData.append("\"tutorial\": [");
			returnData.append("{\"name\": \"No tutorials found\"}]");
			returnData.append("}}");
		}
		System.out.println("INSIDE generateJSONData(), ABOUT TO PRINT returnData");
		System.out.println(returnData);
		return returnData.toString();
	}
}
