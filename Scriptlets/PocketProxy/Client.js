javascript: {
	var targetURL = "";
	
	function resetSRCInChildren(parent) {
		if(parent.hasAttribute("src")) {
			if(parent.getAttribute("src").startsWith("/")) {
				parent.setAttribute("src", "https://www." + targetURL + parent.getAttribute("src"));
			}
		}
		if(parent.hasAttribute("href")) {
			if(parent.getAttribute("href").startsWith("/")) {
				parent.setAttribute("href", "https://www." + targetURL + parent.getAttribute("href"));
			}
		}
		
		if(parent.hasChildNodes) {
			Array.from(parent.children).forEach((child) => {
				resetSRCInChildren(child);
			})
		}
	}
	
	targetURL = prompt('Target URL:');
	
	const port = 'ws://localhost:8080';
	const ws = new WebSocket(port);
	
	ws.addEventListener('open', () => {
		console.log(`Succesfully connected to port: ${port}`);
		ws.send(`URL [${targetURL}]`);
	});
	
	ws.addEventListener('message', (data) => {
		if(data.data.startsWith('DAT')) {
			const webData = data.data.substring(5, data.data.length - 1);
			console.log("Successfully recieved data package");
			
			var doc = new DOMParser().parseFromString(webData, "text/html");
			Array.from(doc.children).forEach((child) => {
				resetSRCInChildren(child);
			});
			
			document.head.innerHTML = "";
			document.body.innerHTML = "";
			document.write(new XMLSerializer().serializeToString(doc));
		}
		else if(data.data == 'TERMINATE') {
			ws.close(1000, "done with service");
		}
		else if(data.data.startsWith('ERR')) {
			const error = data.data.substring(5, data.data.length - 1);
			alert(`An error occured: ${error}`);
		}
		else {
			console.log(`Message: ${data.data}`);
		}
	});
}