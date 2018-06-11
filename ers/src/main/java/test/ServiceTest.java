package test;

import java.io.IOException;
import java.util.ArrayList;

import javax.servlet.ServletException;

import reimburse.pojo.Reimbursement;
import reimburse.service.ServiceERS;
import reimburse.servlet.NiceServlet;

public class ServiceTest {
	public static void main(String[] args) throws ServletException, IOException {
		ServiceERS serv = new ServiceERS();
		NiceServlet ns = new NiceServlet();

		ArrayList<Reimbursement> list = serv.getAllReimb(2, 2);
		for(Reimbursement r : list) {
			System.out.println(r);
		}
		ns.listToJSON(list);
		
	}
}
