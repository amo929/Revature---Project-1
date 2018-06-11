console.log("script loaded!?");

var user = null;
var list = null;
var row = null;

var click_event = document.querySelectorAll("#result-body tr");
click_event.forEach((item) => {
	item.addEventListener('click', () => {
		if(row) row.style.background = "white";
		row = item;
		row.style.background = "red";
		console.log(row.querySelector("th").innerHTML);
	});

});

$("#update-button").click(() => {
	console.log("hit the update button");
	if(!user || !row) return;
	showReimb(user);
});

// document.getElementById("update-button")

// FUNCTION FOR LOGGING IN, HAS BASIC INPUT VERIFICATION
$("#login-button").on('click', () => {
	console.log("Log in button was clicked");
	var inputs = document.getElementsByClassName("login");

	//verify user input
	var badinput = false;
	for(let i=0; i<inputs.length; i++) {
		if(inputs[i].value.trim().length <= 0 || inputs[i].value === "null") {
			inputs[i].style.border = "1px solid red";
			badinput = true;
		}
	}
	if(badinput) return;

	$.ajax({
		url: "niceserv",
		data: {
			topic: "login",
			username: inputs[0].value,
			password: inputs[1].value
		},
		type: "post",
		dataType: "json",
		success: (data) => {
			console.log(data);
			if(data['id'] < 0) {
				document.getElementById("login_error").style.visibility = "visible";
			}
			else {
				// Go to user menu page
				console.log("LOG IN IS GOOD TO GO")
				user = data;
				clearInputs(inputs, "1px solid black");
				document.getElementById("login_error").style.visibility = "hidden";
				showReimb(user);
				// CHANGE RULES FOR USER
				hideButtons();
				showMenu();
			}
		}
	});
});

function hideButtons() {
	if(user['role'] == "1") {
		//display ticket button
		document.getElementById("ticket-button").style.display = "inline-block";
		// hide approve and deny
		document.getElementById("resolve-approve").style.display = "none";
		document.getElementById("resolve-deny").style.display = "none";
	}
	if(user['role'] == "2") {
		//hide ticket button
		document.getElementById("ticket-button").style.display = "none";
		// display approve and deny
		document.getElementById("resolve-approve").style.display = "inline-block";
		document.getElementById("resolve-deny").style.display = "inline-block";
	}
}

// FUNCTION FOR REGISTERING ACCOUNT, HAS BASIC INPUT VERIFICATION
document.getElementById("make-account-button").addEventListener('click', registerAccount);

function registerAccount() {
	console.log("tried registerAccount()");
	var inputs = document.getElementsByClassName("register");

	//verify user input
	var badinput = false;
	for(let i=0; i<inputs.length; i++) {
		if(inputs[i].value.trim().length <= 0 || inputs[i].value === "null") {
			inputs[i].style.border = "1px solid red";
			badinput = true;
		}
	}
	if(badinput) return;

	//good-enough user input, make ajax call for user
	$.ajax({
		url: "niceserv",
		data: {
			topic: "register",
			username: inputs[0].value,
			password: inputs[1].value,
			firstname: inputs[2].value,
			lastname: inputs[3].value,
			email: inputs[4].value,
			role: inputs[5].options[inputs[5].selectedIndex].value
		},
		type: "post",
		dataType: "json",
		success: (data) => {
			console.log("WE GOT A RESPONSE FROM POST");
			console.log(data);
			// We got an error
			// -1 is bad username, -2 is bad email, -3 is bad both
			if(data['id'] === -1 || data['id'] === -3) {
				document.getElementById("reg_username").style.border = "1px solid red";
			}
			else if(data['id'] === -2 || data['id'] === -3) {
				document.getElementById("reg_email").style.border = "1px solid red";
			}
			else { //Good user input
				clearInputs(inputs, "1px solid black");
				// return to login page
				showLogin();
			}

		}
	});
}


// SHOW REMIBURSEMENTS
function showReimb(curruser) {
	if(!curruser) return "No valid user in arguments (need to put one in)";
	console.log(curruser);
	var id = curruser['id'];
	var role = curruser['role'];

	$.ajax({
		url: "niceserv",
		data: {
			topic: "reimb",
			id: id,
			role: role
		},
		type: "get",
		dataType: "json",
		success: (data) => {
			console.log(data['list']);
			list = data['list'];
			console.log("we got here");
			console.log(list);
			replaceTable(list);
		}
	});
}

// INSERT A TICKET
document.getElementById('request-button').addEventListener('click', () => {insertTicket(user)});

function insertTicket(curruser) {
	console.log("Tried to use insertTicket()");
	var amount = document.getElementById("request-amount").value;
	var type = document.getElementById("request-type").options[document.getElementById("request-type").selectedIndex].value;
	var desc = document.getElementById("request-desc").value;

	console.log("amount: " + amount);
	console.log("type: " + type);
	console.log("desc: " + desc);

	$.ajax({
		url: "niceserv",
		data: {
			topic: "insert",
			username: curruser['username'],
			amount: amount,
			type: type,
			description: desc
		},
		type: "post",
		dataType: "json",
		success: (data) => {
			// console.log(data);
			// console.log("SUPPOSED TO UPDATE AFTER INSERT");
		}
	});
	showReimb(user);
}

// RESOLVE A TICKET
document.getElementById("resolve-approve").addEventListener('click', () => {resolveTicket(user, true)});
document.getElementById("resolve-deny").addEventListener('click', () => {resolveTicket(user, false)});

function resolveTicket(curruser, approved) {
	if(!row) return;
	var reimbid = row.querySelector("th").innerHTML;
	var managerid = curruser['id'];

	console.log(reimbid);
	console.log(managerid);
	console.log(approved);

	$.ajax({
		url: "niceserv",
		data: {
			topic: "resolve",
			reimbid: reimbid ,
			managerid: curruser['id'],
			approved: approved
		},
		type: "post",
		dataType: "json"
	});
	console.log("ABOUT TO REPRINT LIST AFTER RESOLVING");
	console.log("curruser")
	showReimb(user);
}

// HELPER FUNCTION CALLED TO REPLACE THE TABLE
function replaceTable(currlist) {
	var body = document.getElementById("result-body");
	body.innerHTML = "";

	for(let i=0; i<currlist.length; i++) {
		// fix submitted and username, type, and status
		let author = currlist[i]['author']['id'];
		let submitted = getShortDate(currlist[i]['submitted']);
		let type = getType(currlist[i]['type']);
		let status = getStatus(currlist[i]['status']);
		body.innerHTML += `
		<tr class="row">
			<th class="col-sm-2" scope="row">${currlist[i]['id']}</th>
			<td class="col-sm-2">${submitted}</td>
			<td class="col-sm-2">${author}</td>
			<td class="col-sm-2">${'$' + currlist[i]['amount']}</td>
			<td class="col-sm-2">${type}</td>
			<td class="col-sm-2">${status}</td>
		</tr>`;
	}
	var click_event = document.querySelectorAll("#result-body tr");
	click_event.forEach((item) => {
		item.addEventListener('click', () => {
			if(row) row.style.background = "white";
			row = item;
			row.style.background = "red";
			console.log(row.querySelector("th").innerHTML);
		});
		
	});
}


$("#menu-logout-button").click(() => {
	user = null;
	list = null;
	row = null;
	showLogin();
});
$("#reg-goback-button").click(showLogin);
$("#register-button").click(showRegister);

document.getElementById("ticket-button").addEventListener('click', () => {
	console.log("HIT THE TICKET BUTTON");
	document.getElementById("request-amount").value = "";
	document.getElementById("request-desc").value = "";
	updateTicket(user);
});


// UPDATES THE TICKET VIEW (HTML ONLY)
function updateTicket(curruser) {
	if(curruser) {
		document.getElementById("ticket-userinfo").innerHTML = `
			<div>${curruser['username']}</div>
			<div>${curruser['email']}</div>
			<div>${curruser['firstname']} ${curruser['lastname']}</div>
		`;
	}
}


// UPDATES THE DETAIL VIEW (HTML ONLY)
document.getElementById("detail-button").addEventListener('click', () => {
	console.log("HIT THE DETAIL BUTTON");
	updateDetail();
});

function updateDetail() {
	if(!row) return;

	var item = getReimb(list);
	document.getElementById("detail-author").innerHTML = `
		<div>Ticket # ${item['id']}</div>
		<div>Amount: $${item['amount']}</div>
		<div>Type: ${getType(item['type'])} </div>
		<div>${getLongDate(item['submitted'])}</div>
		<div>${item['author']['username']}</div>
		<div>${item['author']['email']}</div>
		<div>${item['author']['firstname']} ${item['author']['lastname']}</div>`;

	if(!item['resolver']) {
		document.getElementById("detail-resolver").innerHTML = `<div>Pending</div>`;
	}
	else {
		document.getElementById("detail-resolver").innerHTML = `
			<div>${getStatus(item['status'])}</div>
			<div>Resolved By</div>
			<div>${item['resolver']['username']}</div>
			<div>${item['resolver']['email']}</div>
			<div>${item['resolver']['firstname']} ${item['resolver']['lastname']}</div>
			<div>${getLongDate(item['resolved'])}</div>`;
	}

	document.getElementById("detail-desc").innerHTML = `${item['description']}`;
}

// CHANGE THE DISPLAYED TABLE BASED ON STATUS FILTER
var ts = document.getElementById("table-select");
ts.addEventListener('change', () => {
	// inputs[5].options[inputs[5].selectedIndex].value
	var status = ts.options[ts.selectedIndex].value;
	filterStatus(list, status);
})

function filterStatus(currlist, status) {
	if(status == "All") {
		replaceTable(list);
		return;
	}

	var arr = [];
	for(let i=0; i<currlist.length; i++) {
		if(getStatus(currlist[i]['status']) == status) {
			arr.push(currlist[i]);
		}
	}
	replaceTable(arr);
}


function getReimb(currlist) {
	if(!row) return -1;
	var id = row.querySelector("th").innerHTML;
	for(let i=0; i<currlist.length; i++) {
		if(currlist[i]['id'] == id) {
			return currlist[i];
		}
	}
	return -2;
}




function showLogin() {
	hideCont();
	document.getElementById("login-container").style.display = "block";
}

function showRegister() {
	hideCont();
	document.getElementById("register-container").style.display = "block";
}

function showMenu() {
	hideCont();
	document.getElementById("menu-container").style.display = "block";
}

function hideCont() {
	var arr = document.getElementsByClassName("cont");
	for(let i=0; i<arr.length; i++) {
		arr[i].style.display = "none";
	}
}




function getRole(num) {
	if(num == 1) return "Employee";
	if(num == 2) return "Finance Manager";
	return "n/a";
}

function getType(num) {
	if(num == 1) return "Lodging";
	if(num == 2) return "Food";
	if(num == 3) return "Travel";
	if(num == 4) return "Other";
	return "n/a";
}

function getStatus(num) {
	if(num == 1) return "Pending";
	if(num == 2) return "Approved";
	if(num == 3) return "Denied";
	return "n/a";
}

function getShortDate(ms) {
	var date = (new Date(ms)).toString().split(' ');
	return `${date[1]} ${date[2]}, ${date[3]}`;
}

function getLongDate(ms) {
	var date = (new Date(ms)).toString().split(' ');
	return `${date[1]} ${date[2]}, ${date[3]}  --  ${date[4]}`;
}


// HELPER FUNCTION TO CLEAR INPUTS AND RESET BORDERS
function clearInputs(arr, border) {
	for(let i=0; i<arr.length; i++) {
		arr[i].style.border = border;
		arr[i].value = "";
	}
}


var testemp = {
  id: 1,
  username: "alexmoon",
  password: "password",
  firstname: "Alexander",
  lastname: "Moon",
  email: "amo@gmail.com",
  role: "1"
};

var testman = {
  id: 2,
  username: "realDonald",
  password: "password",
  firstname: "Donald",
  lastname: "Trump",
  email: "thedon@trump.com",
  role: "2"
};

var testlist = [
    {
      id: 5,
      amount: 600.5,
      submitted: 1528431346957,
      resolved: null,
      description: "testing new insert",
      author: {
        id: 14,
        username: "anothertest",
        password: "password",
        firstname: "ye",
        lastname: "gge",
        email: "anoth@yahoo.com",
        role: "2"
      },
      resolver: null,
      status: 1,
      type: 3
    },
    {
      id: 4,
      amount: 500,
      submitted: 1528423623022,
      resolved: null,
      description: "testing it out",
      author: {
        id: 14,
        username: "anothertest",
        password: "password",
        firstname: "ye",
        lastname: "gge",
        email: "anoth@yahoo.com",
        role: "2"
      },
      resolver: null,
      status: 1,
      type: 2
    },
    {
      id: 3,
      amount: 500,
      submitted: 1528423518704,
      resolved: 1528436947198,
      description: "testing it out",
      author: {
        id: 14,
        username: "anothertest",
        password: "password",
        firstname: "ye",
        lastname: "gge",
        email: "anoth@yahoo.com",
        role: "2"
      },
      resolver: {
        id: 2,
        username: "realDonald",
        password: "password",
        firstname: "Donald",
        lastname: "Trump",
        email: "thedon@trump.com",
        role: "2"
      },
      status: 2,
      type: 2
    }
   ];