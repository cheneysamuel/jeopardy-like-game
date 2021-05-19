$(document).ready(function(){
//	alert("Created by ET1 Cheney.  Direct any questions towards him.");
	let gameOb = {};
	let myWindow = -1;

	document.getElementById('file').addEventListener('change', showFile, false);	
	let totalCount = 0;
	let finishedCount = 0;
	let currRound = 0;
	let view = "initial";	// we are just looking at the main screen and not a question/answer
	let currCellID = 0;
	let aqDisplayState = "answer"; // initialize

	$("#openIWindow").on('click', function(){
		
		openInstructorWindow();
		
	});
	
	
	
	$(".divTableCell").on('click', function(){

			cellClick(this);

	});

	$(".aqDisplay").click(function() {
		
//		alert(aqDisplayState);

		switch (aqDisplayState){

			case "displayDailyDoubleScreen":

				break;

			
			case "dailyDouble":
				// display a quick, clickable, daily double display, then on to the answer.
				// view the answer-question display:
				changeDisplays("displayAnswerQuestion");
					
				// load the answer-question text:
//				alert("currCellID: " + currCellID + ", aqDisplayState: " + aqDisplayState);
				loadAQStr(currCellID, aqDisplayState);
				break;

			case "finalJeopardy":
				// final jeopardy! is being shown.. it is clicked. bring up the question:
				aqDisplayState = "finalJeopardyAnswer";
				loadAQStr(-2, aqDisplayState);
				break;
			
			case "finalJeopardyAnswer":
				// final Jeopardy ANSWER is being shown... clicking will show the final jeopardy question:
				aqDisplayState = "finalJeopardyQuestion";
				loadAQStr(-2, aqDisplayState);
				break;
			
			case "finalJeopardyQuestion":
				// the round is now finished.  Do we have another round?
				aqDisplayState = "answer";
				changeDisplays("seeMainLocation");
//				alert("<implement> check for additional rounds, ready them if any.");
				// done with final jeopardy question. designate as false so we can move on to the next round, if there is one:
				gameOb.rounds[currRound].roundInfo.finalJeopardyIncluded = false;
				checkGameCompletion();
				break;
			
			case "answer":
				// the answer is currently being shown.  We must change it to the question:
//				alert("changing to question...");
				aqDisplayState = "question";
				loadAQStr(currCellID, aqDisplayState);
				break;
			
			case "question":
				// the question is currently being shown.  It is clicked so now we just close it:
				changeDisplays("seeMainLocation");
				// we are back at the main window.  Have we finished all the questions?:
				checkGameCompletion();
				break;
			
		}

	});


function openInstructorWindow(){
	
	myWindow = window.open("", "myWindow", "width=800,height=800");
	myWindow.document.write("<p>Move this window onto the extra screen area.</p>");
	myWindow.document.title = "Instructor Window";
	var qDiv = document.createElement('div');
	var aDiv = document.createElement('div');
	qDiv.style.margin = "20px";
	aDiv.style.margin = "20px";
	qDiv.style.padding = "20px";
	aDiv.style.padding = "20px";
	qDiv.style.textAlign = "center";
	aDiv.style.textAlign = "center";
	aDiv.style.fontSize = "60px";
	qDiv.style.fontSize = "60px";
	qDiv.innerHTML = "Example question";
	aDiv.innerHTML = "example answer";
	aDiv.style.backgroundColor = "red";
	qDiv.style.backgroundColor = "blue";
	aDiv.style.color = "white";
	qDiv.style.color = "white";
	myWindow.document.body.style.color = "white";
	myWindow.document.body.style.backgroundColor = "black";
	aDiv.id = "answer";
	qDiv.id = "question";
	myWindow.document.body.appendChild(aDiv);
	myWindow.document.body.appendChild(qDiv);
  
	
}


function updateInstructorWindow(str1, str2){
	
	// update the instructor window with proper information:
	myWindow.document.getElementById("answer").innerHTML = str1;
	myWindow.document.getElementById("question").innerHTML = str2;
	
}

function cellClick(theCell){

//		alert("clicked on cell div...");
		// check to see if this cell is selectable:
	
	
		// each cell has been given an ID of "aq" followed by an index number from 0.
		currCellID = theCell.id;

		let cellOb = gameOb.rounds[currRound].roundData[currCellID];
//		alert("id: " + currCellID);
		if(cellOb.selectable == true){
			


			// deactivate it:
			deactivateCell(currCellID);
			theCell.classList.add('nonselectable');
			theCell.innerHTML = "";
			
			// detect Daily Doubles:
			let isDailyDoubleQA = cellOb.isDailyDouble;

			// see if we clicked on a daily double:
			if(isDailyDoubleQA == true){
				
//				alert("daily double has been selected.");
				changeDisplays("displayDailyDouble");
				loadAQStr(-1, "displayDailyDoubleScreen");
			}
			else{
				
				// make sure we are in the right view:
				if(view == "initial" || view == "seeMainLocation"){
					
					// view the answer-question display:
					changeDisplays("displayAnswerQuestion");
				
					// load the answer-question text:
					loadAQStr(currCellID, aqDisplayState);

				}
			
			}

		}

}



function checkGameCompletion(){
	
//	alert("totalCount: " + totalCount + ", finishedCount: " + finishedCount);
	
	if(totalCount == finishedCount){
		
		if(gameOb.rounds[currRound].roundInfo.finalJeopardyIncluded == true ){
			
			// all have been selected, go to final Jeopardy! if there is one:
			showFinal();
		}
		else if(currRound < gameOb.rounds.length-1){
			
			alert("Click okay to begin next round.");
			
			// reset the answer/question counter:
			finishedCount = 0;

			// attempt to load the next round:

			currRound++;

			// build the game table:
			buildGameTable(currRound);
				
			// load the next round:
			loadRound(currRound);
					
		}
		else {
				
			// no more rounds left.  This game file is complete:
			alert("No rounds remaining. You have ended this game.");
			
			// reset the answer/question counter:
			finishedCount = 0;

		}	
	}

}


function deactivateCell(theCell){
	
	// 
	gameOb.rounds[currRound].roundData[theCell].selectable = false;
	finishedCount++;
	
}


function showFinal(){
	
	if(gameOb.rounds[currRound].roundInfo.finalJeopardyIncluded == true){
		//load the final question and answer
//		alert("loading final question...");
		aqDisplayState = "finalJeopardy";
		changeDisplays(aqDisplayState);
		
	}
}


function loadAQStr(num, aq){
	
	// load the AQ string into the aqDisplay:
//	alert("loading: " + aq);
	
	let topDisplay = document.getElementById("aqTop");
	let bottomDisplay = document.getElementById("aqBottom");
	
	let theCategory = "";
	
	if(num > -1){

		let catNum = gameOb.rounds[currRound].roundData[num].category;
		theCategory = gameOb.rounds[currRound].roundInfo.columnTitles[catNum];
		
	}

	let topStr = "";
	let bottomStr = "";
	let instrTopStr = "";
	let instrBottomStr = "";
	
	topDisplay.innerHTML = topStr;
	bottomDisplay.innerHTML = bottomStr;

	switch (aq) {
		
		case "answer":
//			alert("loading answer...");
			$("#aqMain").css("flex-direction", "column");
			$("#aqMain").css("justify-content", "flex-start");
			
			topStr = theCategory + " : " + gameOb.rounds[currRound].roundData[num].value;
			bottomStr = gameOb.rounds[currRound].roundData[num].answer;
			
			// show the question to the answer on the instructor window:
			
			instrTopStr = gameOb.rounds[currRound].roundData[num].question;
			instrBottomStr = gameOb.rounds[currRound].roundData[num].source;

			break;
	
		case "question":
//			alert(gameOb.rounds[currRound].roundData[num].question);
			$("#aqMain").css("flex-direction", "column-reverse");
			$("#aqMain").css("justify-content", "flex-end");
			bottomStr = gameOb.rounds[currRound].roundData[num].question;
			topStr = gameOb.rounds[currRound].roundData[num].source;

			instrTopStr = "-";
			instrBottomStr = "-";

			break;
		
		case "displayDailyDoubleScreen":
//			alert("daily double being called in loadAQstr.");
			$("#aqMain").css("flex-direction", "column-reverse");
			$("#aqMain").css("justify-content", "flex-end");
			
			topStr = "What is your wager?";
			bottomStr = "Daily Double!";

			// show the answer on the instructor window:

//			instrTopStr = gameOb.rounds[currRound].roundData[num].value;
//			instrBottomStr = gameOb.rounds[currRound].roundData[num].answer;

			break;

		case "finalJeopardy":
			$("#aqMain").css("flex-direction", "column-reverse");
			$("#aqMain").css("justify-content", "flex-end");
			
			topStr = "What is your wager?";
			bottomStr = "Final Jeopardy!";

			instrTopStr = gameOb.rounds[currRound].roundInfo.finalJeopardy.answer;
			instrBottomStr = "-";

			break;

		case "finalJeopardyAnswer":
			$("#aqMain").css("flex-direction", "column");
			$("#aqMain").css("justify-content", "flex-start");			
			topStr = "Final Jeopardy!";
			bottomStr = gameOb.rounds[currRound].roundInfo.finalJeopardy.answer;
			
			// show the question on the instructor window:
			
			instrTopStr = gameOb.rounds[currRound].roundInfo.finalJeopardy.question;
			instrBottomStr = gameOb.rounds[currRound].roundInfo.finalJeopardy.source;
			

			break;
		
		case "finalJeopardyQuestion":
			$("#aqMain").css("flex-direction", "column-reverse");
			$("#aqMain").css("justify-content", "flex-end");			
			topStr = gameOb.rounds[currRound].roundInfo.finalJeopardy.source;
			bottomStr = gameOb.rounds[currRound].roundInfo.finalJeopardy.question;

			instrTopStr = "-";
			instrBottomStr = "-";

			break;
		
		
	}

	// display an answer:
//	alert("loading: " + aq);
	
	// fill the containers:


//	topDisplay.innerHTML = topStr;
//	bottomDisplay.innerHTML = bottomStr;


//  TO BE USED WHEN ALL DATA IS URI ENCODED:
	topDisplay.innerHTML = decodeURIComponent(topStr);
	bottomDisplay.innerHTML = decodeURIComponent(bottomStr);

//	alert(fixedEncodeURIComponent(bottomStr));

	if(myWindow != -1){
//		updateInstructorWindow(instrTopStr, instrBottomStr);

	//  TO BE USED WHEN ALL DATA IS URI ENCODED:
		updateInstructorWindow(decodeURIComponent(instrTopStr), decodeURIComponent(instrBottomStr));
		
	}


	
}


function fixedEncodeURIComponent (str) {  
	return encodeURIComponent(str).replace(/[!'()*]/g, escape);  
}


function changeDisplays(location){

	let pos = $(".blueTable").position();
	let posItem = $(".blueTable");
	let theAQDisplay = $(".aqDisplay");

	let bgColor = "#0000FF";

	if(gameOb.gameInfo.backgroundColor != undefined){
		bgColor = decodeURIComponent(gameOb.gameInfo.backgroundColor);
	}
	

	// the location is a string.
	switch (location) {
		case "seeMainLocation":
			aqDisplayState = "answer";
			view = "seeMainLocation";
			theAQDisplay.fadeOut(300).css({ 'visibility':'hidden' });
			theAQDisplay.css({ 'background-color': bgColor });
			break;
		case "displayAnswerQuestion":
			view = "AQView";
			aqDisplayState = "answer";
			theAQDisplay.css({ 'visibility':'visible' }).fadeIn(300); 
			theAQDisplay.css({ 'background-color': bgColor });
			break;
		case "setInitial":
			aqDisplayState = "answer";
			theAQDisplay.hide();
			break;
		case "displayDailyDouble":
			view = "dailyDouble";
			aqDisplayState = "dailyDouble";
			theAQDisplay.css({ 'visibility':'visible' }).fadeIn(300);
			theAQDisplay.css({ 'background-color':'red'});
			break;

		case "finalJeopardy":
			view = "finalJeopardy";
			aqDisplayState = "finalJeopardy";
			theAQDisplay.css({ 'visibility':'visible' }).fadeIn(300);
			theAQDisplay.css({ 'background-color': bgColor });

			// unique ending.  Load strings for final:
			document.getElementById("aqBottom").innerHTML = "Final Jeopardy!";
			document.getElementById("aqTop").innerHTML = "What is your wager?";
			break;
	}

}

function showFile() {

	var preview = document.getElementById('title');
	
	var file = document.querySelector('input[type=file]').files[0];
	
	var reader = new FileReader()
	
	var textFile = /text.*/;
	
	if (file.type.match(textFile)) {
		reader.onload = function (event) {
//			preview.innerHTML = event.target.result;
//			alert(event.target.result);
//			gameOb = {};
			gameOb = JSON.parse(event.target.result);
			currRound = 0;
			// build the game table:
			buildGameTable(0);
			
			// load the round data:
			loadRound(0);
//			alert(gameOb.rounds[0].roundData[0].selectable);
			
		}
	}
	else {
		preview.innerHTML = "It doesn't seem to be a proper game text file!";
	}
	reader.readAsText(file);
}


function loadRoundTitles(roundNum){
//	alert("loadRoundTitles called...");
	// load each title into the header cells:
//	alert(document.getElementsByClassName("divTableHead").length);
	// find out how many columns we have:
	let numOfColumns = gameOb.rounds[roundNum].roundInfo.columnTitles.length;
//	alert("numOfColumns: " + numOfColumns);
	// iterate through a list of "head#" id's and assign innerHTML:
	for(var i = 0; i < numOfColumns; i++){
		// create the id name:

//		alert(gameOb.rounds[roundNum].roundInfo.columnTitles[i]);
		// assign the ID it's appropriate title from the JSON object:
		document.getElementsByClassName("divTableHead")[i].innerHTML = decodeURIComponent(gameOb.rounds[roundNum].roundInfo.columnTitles[i]);
		
	}

}


function loadCellValues(roundNum){
//	alert("loadCellValues called...");
	//load each value into the appropriate cell innerHTML:
	// find out how many cells we have:
	let numOfColumns = gameOb.rounds[roundNum].roundInfo.columnTitles.length;

	let numOfRows = gameOb.rounds[roundNum].roundInfo.numberOfQuestionRows;

	// iterate through a list of cells and assign innerHTML:
	for(var j = 0; j < numOfRows; j++){

		for(let k = 0; k < numOfColumns; k++){

			let cellIndex = gameOb.rounds[roundNum].roundData.findIndex(function(qa){
				return qa.pos == j+1 && qa.category == k;
			});

			// assign the ID it's appropriate value from the JSON object:
			let cellItem = document.getElementById(j+","+k);
			
			cellItem.innerHTML = gameOb.rounds[roundNum].roundData[cellIndex].value;

			cellItem.id = cellIndex;



		}
		
	}
//	alert("cell values added.");
//	alert("final?: " + gameOb.rounds[roundNum].roundInfo.finalJeopardyIncluded);


}


function loadRound(roundNum){
//	alert("loading round: " + roundNum);
	
	// load the titles:
	loadRoundTitles(roundNum);
	
	// load cell values:
	loadCellValues(roundNum);

	totalCount = gameOb.rounds[roundNum].roundInfo.columnTitles.length * gameOb.rounds[roundNum].roundInfo.numberOfQuestionRows;

//	for debugging, quick round ending:
//	totalCount = 2;
}


function buildGameTable(round){
//	alert("backgroundColor..." + unescape(gameOb.gameInfo.backgroundColor));

	let bgColor = unescape(gameOb.gameInfo.backgroundColor);
	let textColor = unescape(gameOb.gameInfo.textColor);

//	// set table colors:
	if(gameOb.gameInfo.backgroundColor == undefined){
		bgColor = "#232AA4";
	}

	// set table text color:
	if(gameOb.gameInfo.textColor == undefined){
		textColor = "#FFFFFF";
	}

	// set displayed answer/question colors:
	document.getElementById("aqMain").style.backgroundColor = bgColor;
	document.getElementById("aqTop").style.backgroundColor = bgColor;
	document.getElementById("aqBottom").style.backgroundColor = bgColor;

	// establish the numbers of columns and rows:
	
//	alert(gameOb.rounds[round].roundInfo.columnTitles.length);
//	alert("roundName: " + gameOb.rounds[round].roundInfo.roundName);
	
	let numberOfColumns = gameOb.rounds[round].roundInfo.columnTitles.length;
	let numberOfRows = gameOb.rounds[round].roundInfo.numberOfQuestionRows;
	
	// delete all table cells (the id "contentGroup" contains all the div's):
		// delete all:
//		alert("deleting all child nodes");
		let allNode = document.getElementById("contentGroup");
		while(allNode.hasChildNodes()){
			allNode.removeChild(allNode.lastChild);
		}
	
	// add a div (class = divTableHeading):
		let headerDiv = document.createElement("div");
		headerDiv.className = "divTableHeading";
		allNode.appendChild(headerDiv);
//		alert("added headerDiv.");

	// add a div (class = divTableBody):
		let bodyDiv = document.createElement("div");
		bodyDiv.className = "divTableBody";
		bodyDiv.id = "cellBody";
		allNode.appendChild(bodyDiv);
//		alert("added bodyDiv.");
	
	// get the number of rows, add one for the headers, and add rows:
		// add a header row to (class = divTableHeading):
		let headerRow = document.createElement("div");
		headerRow.className = "divTableRow";
		headerRow.id = "titleRow";
		headerRow.style.backgroundColor = bgColor;
		headerRow.style.color = textColor;
		headerDiv.appendChild(headerRow);
		
		// add the number of rows to (class = divTableBody):
		for(var i = 0; i < numberOfRows; i++){
			let rowDiv = document.createElement("div");
			rowDiv.className = "divTableRow";
			rowDiv.id = "cellRow" + i;
			bodyDiv.appendChild(rowDiv);
//			alert("added divTableRow: " + rowDiv.id);
		}
		

	// add header row cells:
		// get the number of columns from columnTitles.length and add that number of (class = divTableHead) with (id = "head" + # (starting from 0))):
		for(var i = 0; i < numberOfColumns; i++){
			// add header row elements:
			let headerCell = document.createElement("div");
			headerCell.className = "divTableHead";
			headerCell.id = "head" + i;
			document.getElementById("titleRow").appendChild(headerCell);
//			alert("added divTableHead: " + headerCell.id);
		}	




	// add row cells:
		// for each row added to the (class = divTableBody), add (class = divTableCell)'s to each ((columnTitles.length) of them), with (id = "aq" + # (starting from 0)):
			// create a list of the row divs in the body:
			let allBodyDivs = document.getElementById("cellBody").children;
			
			// for each of the div's.. add the appropriate number of cell div's:
			for(var i = 0; i < allBodyDivs.length; i++){
				// add row elements:
				
					for(var j = 0; j < numberOfColumns; j++){
							let bodyCell = document.createElement("div");
							bodyCell.id = i+","+j;
							bodyCell.className = "divTableCell";
							bodyCell.style.backgroundColor = bgColor;
							bodyCell.style.color = textColor;
		//					alert(bodyCell.id);
							bodyCell.addEventListener("click", function(){cellClick(bodyCell);});
							allBodyDivs[i].appendChild(bodyCell);
					}

			}

}



});




