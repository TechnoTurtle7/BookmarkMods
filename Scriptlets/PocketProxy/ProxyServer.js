const ws = require("ws");
const port = 8080;
const wss = new ws.Server({
	port: port,
	clientTracking: true
});

var activeIDs = [];

wss.on("connection", (ws) => {
	ws.id = generateUUID();
	
	console.log(`Client ${ws.id} connected`);
	
	ws.on("message", (data) => {
		if(data.toString().startsWith("URL")) {
			const requestedURL = data.toString().substring(5, data.toString().length - 1);
			console.log(`Client ${ws.id} request URL: ${requestedURL}`);
			
			const http = require("follow-redirects/http");
			const options = {
				hostname: requestedURL,
				method: "GET"
			};
			
			const req = http.request(options, (res) => {
				var data = "";
				
				res.on("data", (chunk) => {
					data += chunk;
				});
				
				res.on("end", () => {
					wss.sendTo(ws.id, `DAT [${data}]`);
					wss.sendTo(ws.id, "TERMINATE");
				});
			});
			
			req.on("error", (error) => {
				console.log(`status: ${req.statusCode}`);
				console.log(error);
				
				wss.sendTo(ws.id, `ERR [${error}]`);
			});
			
			req.end();
		}
	});
	
	ws.on("close", () => {
		console.log(`Client ${ws.id} disconnected`);
		activeIDs.splice(activeIDs.indexOf(ws.id));
	});
	
	ws.onerror = () => {
		console.log("!An error occured!");
	}
});

console.log(`Started websocket server successfully | Port: ${port}`);

function generateUUID() {
	const template = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
	
	var uuid = template.replaceAll(/[xy]/g, c => {
		var r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
	
	if(activeIDs.includes(uuid)) {
		return generateUUID();
	}
	else {
		activeIDs.push(uuid);
		return uuid;
	}
};

wss.sendTo = (id, msg) => {
	wss.clients.forEach((client) => {
		if(client.id == id) {
			client.send(msg);
			return;
		}
	});
}