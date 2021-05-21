// jplayer.js is used by the jeopardygame.html file to provide all functionality.  

$(document).ready(function() {

  // the game object to store all the game and rounds information:

  // listen for the load file button:
  document.getElementById('file').addEventListener('change', showFile, false);

  // listen for window/tab reload or close and close the instructor window with it:
  window.addEventListener('beforeunload', (event) => {
    if(instructorWindow != null || instructorWindow.closed){
      instructorWindow.close();
      instructorWindow = null;
      event.returnValue = '';
    }
  });

  // listen for buttons:
  
  
	$("#openIWindow").on('click', function(){
		
		openInstructorWindow();
		
	});

  $("#collapse_icon").on('click', function(){
    console.log("toggling...");
    toggleTitle();
  });

  //document.getElementById("collapse_icon").addEventListener('click', toggleTitle, false);

  // listen for field changes:

  // document.getElementById('qaPoints').addEventListener('change', validateNum, false);
  // document.getElementById('qaTimerInSeconds').addEventListener('change', validateNum, false);
  
  let finalAnswerField = document.getElementById('finalAnswerField');
  let finalQuestionField = document.getElementById('finalQuestionField');
  let finalSourceField = document.getElementById('finalSourceField');
  let finalCommentsField = document.getElementById('finalCommentsField');

  let qaAnswerField = document.getElementById('qaAnswer');
  let qaQuestionField = document.getElementById('qaQuestion');
  let qaSourceField = document.getElementById('qaSource');
  let qaCommentsField = document.getElementById('qaComments');



});


let state = { "file_states":["game_not_loaded", 
                             "game_loaded"],
             "game_states":["game_not_begun", 
                            "game_started", 
                            "game_ended"],
             "displayStates":["blank", 
                              "main_board", 
                              "show_answer", 
                              "give_question_source", 
                              "show_daily_double", 
                              "final_jeopardy", 
                              "final_jeopardy_answer", 
                              "final_jeopardy_question_source"],
             "current_file_state":"game_not_loaded",
             "current_game_state":"game_not_begun",
             "current_display_state":"blank"
            }

const eventTypes = {
  GAME:"game",
  ROUND:"round",
  DISPLAY_ANSWER:"display_answer",
  DISPLAY_QUESTION:"display_question",
  DISPLAY_DD:"display_dd",
  DISPLAY_FJ:"display_fj"

}

let currentCategory = 0;
let currentRow = 0;

var instructorWindow;

class LogOb {
  constructor() {
    this.logArray = [];

    this.addEntry = function (logStr, eventType) {
      let dtg = new Date();
      let ss = ((dtg.getSeconds()-10) < 0)?("0"+dtg.getSeconds()):dtg.getSeconds();
      let mm = ((dtg.getMinutes()-10) < 0)?("0"+dtg.getMinutes()):dtg.getMinutes();
      let hh = ((dtg.getHours()-10) < 0)?("0"+dtg.getHours()):dtg.getHours();
      let dtgString = hh + ":" + mm + ":" + ss;
      this.logArray.push({ "logStr": logStr, "dtg": dtgString, "dtgRaw":dtg.getTime(), "eventType":eventType });
    };
  }
}

class GameOb {
  constructor() {
    this.gameInfo = new GameInfoOb();
    this.rounds = [];

    this.addRound = function () {
      this.rounds.push(new roundOb(roundCounter, new roundInfoOb("Round 1", 2, ["Category 1", "Category 2"]), []));
      roundCounter++;
    };
  }
}


class GameInfoOb {
  constructor() {
    this.creator = "creator";
    this.dateCreated = "date created";
    this.comments = "comments.";
    this.backgroundColor = "#0000FF";
    this.fontColor = "#FFFFFF";
  }
}


class roundOb {
  constructor(id, info, data) {
    this.roundID = id;
    this.roundInfo = info;
    this.categories = [];

    this.addCategory = function () {
      this.categories.push(new categoryOb("New Category"));
    };
  }
}


class roundInfoOb {
  constructor(_roundName, _numOfQuestionRows) {
    this.roundName = _roundName;
    this.numberOfQuestionRows = _numOfQuestionRows;
    this.finalJeopardyIncluded = false;
    this.finalJeopardy = new finalJ("", "", "", "");
  }
}


class categoryOb {
  constructor(_title) {
    this.title = _title;
    this.qaObs = [];
    this.addQAob = function (pos, val) {
      this.qaObs.push(new QAob(true, pos, val, 30, "", "", "", "", false));
    };
  }
}


class QAob {
  constructor(_selectable, _pos, _points, _timerInSeconds, _answer, _question, _source, _comments, _isDailyDouble) {
    this.selectable = _selectable;
    this.pos = _pos;
    this.points = _points;
    this.timerInSeconds = _timerInSeconds;
    this.answer = _answer;
    this.question = _question;
    this.source = _source;
    this.comments = _comments;
    this.isDailyDouble = _isDailyDouble;
  }
}


class finalJ {
  constructor(_answer, _question, _source, _comments) {
    this.answer = _answer;
    this.question = _question;
    this.source = _source;
    this.comments = _comments;
  }
}



let gameOb = new GameOb(); // "ET1", "now", "none.", [0,0,255], [0,0,0]
let currentRound = 0;

let gameLog = new LogOb();
state.file_states = "game_not_loaded";


function toggleTitle(){
  // if title area is expanded, collapse it:
  if($("#top_sub_container").css('display') == "flex"){
    console.log("collapse it.");
    $("#top_sub_container").css('display', 'none');
    $("#collapse_icon").addClass("collapsed");
    $(".icon_period").css('display', 'none');
  }
  else{
    console.log("open it.");
    $("#top_sub_container").css('display', 'flex');
    $("#collapse_icon").removeClass("collapsed");
    $(".icon_period").css('display', 'block');
  }
  // if title area is collapsed, expand it:
}


function showFile() {
  //	alert("showFile called...");

  var preview = document.getElementById('title');

  var file = document.querySelector('input[type=file]').files[0];

  var reader = new FileReader()

  var textFile = /text.*/;

  if (file.type.match(textFile)) {
    reader.onload = function(event) {

      // once successfully loaded, purge the gameOb and all fields:

      gameOb = new GameOb();

      Object.assign(gameOb, JSON.parse(event.target.result));

      state.file_states = "game_loaded";

      writeToGameLog("Game file loaded.", eventTypes.GAME);

      // load the round data:
      populateFromLoadedGameOb();
      
      // change overlay colors:
      updateOverlayColors();
	    
    }
  } else {
    preview.innerHTML = "Invalid filetype";
  }
  reader.readAsText(file);
}


function updateOverlayColors(){
	// apply the colors noted in the game file to the overlay:
	let overlayOb = document.getElementById("overlay-box");

	overlayOb.style.backgroundColor = unescape(gameOb.gameInfo.backgroundColor);
	overlayOb.style.color = unescape(gameOb.gameInfo.fontColor);

}


function openInstructorWindow(){

    console.log(instructorWindow);
    // create the window and load the appropriate css file:
    if(!instructorWindow || instructorWindow.closed){
      // the window was never opened. open it and load the appropriate game and round information:
      instructorWindow = window.open("", "Instructor Controls", "width=800,height=800");
      instructorWindow.document.body.innerHTML = "";
    }
    else{
      // it was open from a previous game.  destroy it and reinitialize:
      instructorWindow = null;
      instructorWindow = window.open("", "Instructor Controls", "width=800,height=800");
      instructorWindow.document.body.innerHTML = "";

    }


    initializeInstructorWindowContent();

    //toggleTitle();
    
    let infoOb = gameOb.gameInfo;

    // load the gameInfo information:
    initializeInstructorWindowWithGameInformation(unescape(infoOb.creator), unescape(infoOb.dateCreated), unescape(infoOb.comments));
  
    let rName = unescape(gameOb.rounds[currentRound].roundInfo.roundName);
  
    updateInstructorWindow_roundInfo(rName, (currentRound + 1), gameOb.rounds[currentRound].roundInfo.finalJeopardyIncluded);

}


function initializeInstructorWindowContent(){
  
  // due to CSRF protections, we need to build this from scratch:
  console.log("initializing instructor window content...");

  instructorWindow.document.write("<p>Move this window onto the extra screen area.</p>");
  instructorWindow.document.title = "Instructor Window";

  let cssSource = instructorWindow.document.createElement("link");
  cssSource.type = "text/css";
  cssSource.rel = "stylesheet";
  cssSource.href = "scripts/instructor-window.css";
  instructorWindow.document.head.appendChild(cssSource);

  let topInfo = instructorWindow.document.createElement("div");
  topInfo.classList.add("top-info-div");

  // game information section:
  let infoDiv = instructorWindow.document.createElement("div");
  infoDiv.classList.add("game-info-field");

    let creatorDiv = instructorWindow.document.createElement("div");
    creatorDiv.classList.add("game-info-field");
    creatorDiv.id = "creator-div";

    let dateCreatedDiv = instructorWindow.document.createElement("div");
    dateCreatedDiv.classList.add("game-info-field");
    dateCreatedDiv.id = "date-created-div";

    let gameCommentsDiv = instructorWindow.document.createElement("div");
    gameCommentsDiv.classList.add("game-info-field");
    gameCommentsDiv.id = "game-comments-div";

  infoDiv.appendChild(creatorDiv);
  infoDiv.appendChild(dateCreatedDiv);
  infoDiv.appendChild(gameCommentsDiv);

  topInfo.appendChild(infoDiv);

  
  // round information section:
  let roundDiv = instructorWindow.document.createElement("div");
  roundDiv.classList.add("round-div");

    let roundNameDiv = instructorWindow.document.createElement("div");
    roundNameDiv.classList.add("round-info-field");
    roundNameDiv.id = "round-name-div";

    let roundNumberDiv = instructorWindow.document.createElement("div");
    roundNumberDiv.classList.add("round-info-field");
    roundNumberDiv.id = "round-number-div";

    for(let round = 0; round < gameOb.rounds.length; round++){
      console.log("creating clickable round element...");
      let aRound = instructorWindow.document.createElement("div");
      aRound.classList.add("round-number-div");
      aRound.setAttribute('round-number', round);
      aRound.innerHTML = (round + 1) + ":" + unescape(gameOb.rounds[round].roundInfo.roundName);
      if(round == currentRound){
        // this is the current round. color it red:
        aRound.classList.add('selected-round');
      }
      aRound.addEventListener('click', function(evt){
        let newRoundNumber = parseInt(evt.target.getAttribute('round-number'))
        console.log("round: " + newRoundNumber);
        currentRound = newRoundNumber;
        state.current_display_state = "main_board";
        createJeopardyTable(newRoundNumber);
        changeOverlayState();

      });
      roundNumberDiv.appendChild(aRound);
    }

    //let totalRoundsDiv = instructorWindow.document.createElement("div");
    //totalRoundsDiv.classList.add("round-info-field");
    //totalRoundsDiv.id = "total-rounds-div";

    let finalJeopardyIncludedDiv = instructorWindow.document.createElement("div");
    finalJeopardyIncludedDiv.classList.add("round-info-field");
    finalJeopardyIncludedDiv.id = "final-jeopardy-included-div";

  roundDiv.appendChild(roundNameDiv);
  roundDiv.appendChild(roundNumberDiv);
  //roundDiv.appendChild(totalRoundsDiv);
  roundDiv.appendChild(finalJeopardyIncludedDiv);

  topInfo.appendChild(roundDiv);

  instructorWindow.document.body.appendChild(topInfo);

  // QA information section:
  let bottomDiv = instructorWindow.document.createElement("div");
  bottomDiv.classList.add("bottom-div");
	
  // game actions log section:
  let logDiv = instructorWindow.document.createElement("div");
  logDiv.classList.add("log-div");
  logDiv.classList.add("scroll");
  logDiv.id = "logDiv";

  let QAdiv = instructorWindow.document.createElement("div");
  QAdiv.classList.add("qa-div");
	
    let answerDiv = instructorWindow.document.createElement("div");
    answerDiv.classList.add("aq-field-div");
    answerDiv.id = "answer-div";

    let questionDiv = instructorWindow.document.createElement("div");
    questionDiv.classList.add("aq-field-div");
    questionDiv.id = "question-div";

    let sourceDiv = instructorWindow.document.createElement("div");
    sourceDiv.classList.add("aq-field-div");
    sourceDiv.id = "source-div";

    let commentsDiv = instructorWindow.document.createElement("div");
    commentsDiv.classList.add("aq-field-div");
    commentsDiv.id = "comments-div";

    let pointsDiv = instructorWindow.document.createElement("div");
    pointsDiv.classList.add("aq-field-div");
    pointsDiv.id = "points-div";

    let timerDiv = instructorWindow.document.createElement("div");
    timerDiv.classList.add("aq-field-div");
    timerDiv.id = "timer-div";
	
  QAdiv.appendChild(logDiv);
  QAdiv.appendChild(pointsDiv);
  QAdiv.appendChild(answerDiv);
  QAdiv.appendChild(questionDiv);
  QAdiv.appendChild(sourceDiv);
  QAdiv.appendChild(commentsDiv);
  // QAdiv.appendChild(timerDiv);

  bottomDiv.appendChild(logDiv);
  bottomDiv.appendChild(QAdiv);

  instructorWindow.document.body.appendChild(bottomDiv);

  writeToGameLog();

}


function initializeInstructorWindowWithGameInformation(str1, str2, str3){
	
    instructorWindow.document.getElementById("creator-div").innerHTML = "creator: " + str1;
    instructorWindow.document.getElementById("date-created-div").innerHTML = "created: " + str2;
    instructorWindow.document.getElementById("game-comments-div").innerHTML = "comments: " + str3;
	
}


function updateInstructorWindow_roundInfo(str1, str2, str3){

  instructorWindow.document.getElementById("round-name-div").innerHTML = "Round " + str2 + ": " + str1;
  //instructorWindow.document.getElementById("round-number-div").innerHTML = "Round #: " + str2;
  instructorWindow.document.getElementById("final-jeopardy-included-div").innerHTML = "Final Jeopardy this round: " + str3;

}

function updateInstructorWindow_QA(round, category, row){

  console.log("Updating instructor window: round: " + round + ", category: " + category + ", row: " + row + ", state: " + state.current_display_state);

  if(instructorWindow.open){

    switch(state.current_display_state){
      case "final_jeopardy":
      case "final_jeopardy_answer":
      case "final_jeopardy_question_source":
        let fj = gameOb.rounds[round].roundInfo.finalJeopardy;

        instructorWindow.document.getElementById("answer-div").innerHTML = unescape(fj.answer);
        instructorWindow.document.getElementById("question-div").innerHTML = unescape(fj.question);
        instructorWindow.document.getElementById("source-div").innerHTML = unescape(fj.source);
        instructorWindow.document.getElementById("comments-div").innerHTML = unescape(fj.comments);
      break;
      case "show_daily_double":
      case "show_answer":
      case "give_question_source":
        let thisQA = gameOb.rounds[round].categories[category].qaObs[row];

        instructorWindow.document.getElementById("answer-div").innerHTML = unescape(thisQA.answer);
        instructorWindow.document.getElementById("question-div").innerHTML = unescape(thisQA.question);
        instructorWindow.document.getElementById("source-div").innerHTML = "source: " + unescape(thisQA.source);
        instructorWindow.document.getElementById("comments-div").innerHTML = "comments: " + unescape(thisQA.comments);
        instructorWindow.document.getElementById("points-div").innerHTML = "Points: " + thisQA.points;
        // instructorWindow.document.getElementById("timer-div").innerHTML = thisQA.timerInSeconds;
      break;
    }
  }
	
}


function populateFromLoadedGameOb() {

  // change gamestate:
  state.current_file_state = "game_loaded";
  state.current_game_state = "game_not_begun";
  state.current_display_state = "main_board";

  openInstructorWindow();
  //		alert("populating from the loaded gameOb");

  let infoOb = gameOb.gameInfo;

  // load the gameInfo information:
  initializeInstructorWindowWithGameInformation(unescape(infoOb.creator), unescape(infoOb.dateCreated), unescape(infoOb.comments));

  let rName = unescape(gameOb.rounds[currentRound].roundInfo.roundName);

  updateInstructorWindow_roundInfo(rName, (currentRound + 1), gameOb.rounds[currentRound].roundInfo.finalJeopardyIncluded);


  // create the jeopardy table for the first round (round 0):
  createJeopardyTable(0);

}


 //     $("#rounds").empty();


function createJeopardyTable(roundNum) {
  writeToGameLog(("Beginning round #: " + (roundNum + 1)), eventTypes.ROUND);
  // change gamestate:
  state.current_file_state = "game_loaded";
  state.current_game_state = "game_started";
  state.current_display_state = "main_board";

  // use the rows and columns to fill a div with a grid/table thing:



  // clear the grid:
  $("#finalGrid").empty();

  let cols = gameOb.rounds[roundNum].categories.length;
  let rows = gameOb.rounds[roundNum].categories[0].qaObs.length;

  // issues with the divs.. change to table:

  let gameTable = document.createElement("table");
  gameTable.id = "game-table";
  gameTable.style.tableLayout = "fixed";

  for(let tr = 0; tr < rows+1; tr++){
    let newRow = document.createElement("tr");
    gameTable.appendChild(newRow);

    for(let tc = 0; tc < cols; tc++){

      if(tr == 0){
        // title:
        let newTitle = document.createElement("th");
        newTitle.classList.add("qa_title");
        newTitle.style.width = (100.0/cols) + "%";
	newTitle.style.backgroundColor = unescape(gameOb.gameInfo.backgroundColor);
	newTitle.style.color = unescape(gameOb.gameInfo.fontColor);
        newTitle.innerHTML = unescape(gameOb.rounds[roundNum].categories[tc].title);
        newRow.appendChild(newTitle);
      }
      else{
        // it's a qa_item:
        let newItem = document.createElement("td");
        newItem.classList.add("qa_item");
        newItem.classList.add("incomplete");
	newItem.style.backgroundColor = unescape(gameOb.gameInfo.backgroundColor);
	newItem.style.color = unescape(gameOb.gameInfo.fontColor);
        newItem.innerHTML = gameOb.rounds[currentRound].categories[tc].qaObs[tr-1].points;
        newItem.addEventListener('click', function(){
          console.log("clicked on cell");
          let currRow = tr-1;
          console.log(currRow);
          playQA(currRow, tc, this);
        }, false);
        newRow.appendChild(newItem);
      }
    }

    gameTable.appendChild(newRow);

    document.getElementById("finalGrid").appendChild(gameTable);

    let font_size = (document.body.offsetHeight / rows) * 0.5;

    changeQAfontSize(font_size);
  }

  //updateInstructorWindow_gameInfo(gameOb.gameInfo.creator, gameOb.gameInfo.dateCreated, gameOb.gameInfo.comments);

  //updateInstructorWindow_roundInfo(gameOb.rounds[roundNum].roundInfo.roundName, roundNumber, gameOb.rounds[roundNum].roundInfo.finalJeopardyIncluded);

  openInstructorWindow();
}


function changeQAfontSize(size){
      // change font sizes according to the size of the final grid after being populated.

      // get the array of QA elements:
      let qaArray = Array.from(document.getElementsByClassName("qa_item"));
      let titleArray = Array.from(document.getElementsByClassName("qa_title"));

      //console.log("titleArray: " + titleArray);

      let cellHeight = (document.body.offsetHeight/(gameOb.rounds[currentRound].categories[currentCategory].qaObs.length+2)) - document.getElementsByClassName("qa_title")[0].style.height;
      //console.log("cellHeight: " + cellHeight);
      qaArray.forEach(function(qa){
        // iterate and change size:
        qa.style.fontSize = size + "px";
        qa.style.height = cellHeight + "px";
      });

      titleArray.forEach(function(title){
        title.style.fontSize = (size/2) + "px";
      });

}


function playQA(row, col, ob){

  console.log("row: " + row + ", column: " + col);
  
//  writeToGameLog("    -answer: " + unescape(gameOb.rounds[currentRound].categories[currentCategory].qaObs[row].answer));
//  writeToGameLog("    -question: " + unescape(gameOb.rounds[currentRound].categories[currentCategory].qaObs[row].question));
//  writeToGameLog("    -source: " + unescape(gameOb.rounds[currentRound].categories[currentCategory].qaObs[row].source));
  // has this cell been played yet?
  if(ob.classList.contains("finished")){
    
    // we've clicked on a used cell.  Ask if user wants to restore it?
    if(confirm("Restore this question?")){
      ob.classList.remove("finished");
      ob.classList.add("incomplete");
      ob.innerHTML = gameOb.rounds[currentRound].categories[currentCategory].qaObs[row].points;
    }
  }
  else{

    writeToGameLog((gameOb.rounds[currentRound].categories[currentCategory].title + " for " + gameOb.rounds[currentRound].categories[currentCategory].qaObs[row].points), eventTypes.DISPLAY_ANSWER);
    let overlayBox = document.getElementById("overlay-box");
    currentCategory = col;
    currentRow = row;
    // check for daily double:

    if(gameOb.rounds[currentRound].categories[currentCategory].qaObs[row].isDailyDouble == true){
      state.current_display_state = "show_daily_double";
      document.getElementById("overlay-box").style.display = "flex";
      changeOverlayState();
      updateInstructorWindow_QA(currentRound, currentCategory, currentRow);
    }
    else{

      // change gamestate:
      state.current_display_state = "show_answer";

      let currentQA = gameOb.rounds[currentRound].categories[currentCategory].qaObs[currentRow];

      // instructor clicked on the QA cell, play it.  

      // load the question and points onto the overlay:
      document.getElementById("overlay-points").innerHTML = unescape(gameOb.rounds[currentRound].categories[currentCategory].title) + ": " + currentQA.points;
      document.getElementById("overlay-answer").innerHTML = unescape(currentQA.answer);
      document.getElementById("overlay-question").innerHTML = unescape(currentQA.question);
      document.getElementById("overlay-source").innerHTML = unescape(currentQA.source);

      document.getElementById("overlay-points").style.display = "flex";
      document.getElementById("overlay-answer").style.display = "flex";

      // update the instructor window information with QA info:
      updateInstructorWindow_QA(currentRound, currentCategory, currentRow);

      changeOverlayState();

    }

    // display the overlay:
    overlayBox.style.display = "flex";

    ob.classList.remove("incomplete");
    ob.classList.add("selected");

  }

}


function clickOverlay(ob){

  switch(state.current_display_state){
    case "show_daily_double":
      state.current_display_state = "show_answer";
      // document.getElementById("overlay-box").style.display = "flex";
      changeOverlayState();

      break;
    case "show_answer":
      let sec = (Date.now() - gameLog.logArray[gameLog.logArray.length-1].dtgRaw)/1000;
      let min = Math.floor(sec/60);
      sec = Math.floor(sec%60);
      writeToGameLog(("Took " + ((min > 0)?(min + " minute"+ ((min > 1)?"s":"") + " and "):" ") + sec + " second" + ((sec == 1)?"":"s") + "."), eventTypes.DISPLAY_QUESTION);
      // now show the question and source:
      state.current_display_state = "give_question_source";

      changeOverlayState();

      break;
    case "give_question_source":
      
      state.current_display_state = "main_board";

      // clicking out of question/source, check for end of round & final Jeopardy:

      // manage classes for keeping track of cells:
      let currentQA = document.getElementsByClassName("selected")[0];

      currentQA.classList.remove("selected");
      currentQA.classList.add("finished");

      // remove and reset the overlay:
      document.getElementById("overlay-box").style.display = "none";

      changeOverlayState();

      // remove the points text from the overlay box:
      currentQA.innerHTML = "";

      checkForRoundCompletion();

      break;
    case "final_jeopardy":
      writeToGameLog("Begin final jeopardy", eventTypes.ROUND);

      // final jeopardy! is being displayed.  click on this should give you your fj answer:
      state.current_display_state = "final_jeopardy_answer";

      // fill the overlay with the fj answer:
      updateInstructorWindow_QA(currentRound, currentCategory, currentRow);
      playFinalJeopardy();
      changeOverlayState();
      
      break;
    case "final_jeopardy_answer":

      // clicked on the fj answer. ready for question and source to be displayed:
      state.current_display_state = "final_jeopardy_question_source";

      changeOverlayState();

      break;
    case "final_jeopardy_question_source":

    // clicked on the final jeopardy question/source.  make it go away:
    state.current_display_state = "main_board";

    changeOverlayState();

    document.getElementById("overlay-box").style.display = "none";

    // do we have another round?

    if(currentRound < (gameOb.rounds.length - 1)){
      // we have another round.  Load it:
      currentRound++;
      createJeopardyTable(currentRound);
    }
    else{
      // end of the end.
      writeToGameLog("Finished all rounds", eventTypes.GAME);
      alert("You have finished all rounds.");
      state.current_game_state = "game_ended";
    }

      break;
  }

}


function checkForRoundCompletion(){

  // do we have any divs with the "incomplete" class?:
  if(document.getElementsByClassName("incomplete").length < 1){

    // we don't.  Now check for final jeopardy:
    if(gameOb.rounds[currentRound].roundInfo.finalJeopardyIncluded){
  
      // we have final Jeopardy! play it!:
    //  writeToGameLog("Begin final jeopardy", eventTypes.ROUND);
      state.current_display_state = "final_jeopardy";

      changeOverlayState();

      document.getElementById("overlay-box").style.display = "flex";
    }
    else{

      // no final jeopardy.  check for a next round:
      if(currentRound < gameOb.rounds.length-1){
        writeToGameLog("Finished with current round", eventTypes.ROUND);
        state.current_display_state = "main_board";
        changeOverlayState();
        document.getElementById("overlay-box").style.display = "none";
        alert("You have finished this round.  Click OK to go to next round");
        // we have another round. Load it:
        currentRound++;
        createJeopardyTable(currentRound);
      }
      else{
        
        // we have no more rounds.  end of game:
        writeToGameLog("Finished all rounds", eventTypes.GAME);
        alert("Congratulations!  You have finished all rounds!");
        state.current_game_state = "game_ended";
        state.current_display_state = "main_board";
        changeOverlayState();
        document.getElementById("overlay-box").style.display = "none";
      }
    }
  }

}


function playFinalJeopardy(){
  // populate the overlay:


  // display the overlay:


}



function writeToGameLog(message, eventType){
	console.log("writing to log: " + message + ", eventType: " + eventType);
	if(message == undefined){
		// if i'm just asking to writeToGameLog. Send everything.  user may have closed the instructor window and needs all log items:
		// iterate through the entire log and create an object to send over:
    if(gameLog.logArray.length > 0){
      gameLog.logArray.forEach(function(item,index){addToInstructorLog(index)});
    }
	}
	else{
		// validate message has only regular characters:
		  let patt1 = /[^A-Za-z0-9-.: &?]/g;
		  let result = message.replace(patt1, "");
		// write to the log object:
		gameLog.addEntry(result, eventType);

		// if the instructor window is open, update it:
		if(!instructorWindow || instructorWindow.closed){
			// instructor window now open. send to console.log:
			console.log(result);
		}
		else{
      addToInstructorLog((gameLog.logArray.length-1),eventType);
		}
	}
}


function addToInstructorLog(index,eventType){
  // update the instructor window log div:
  let logEntryDiv = instructorWindow.document.createElement("div");
  logEntryDiv.classList.add("logEntryContainer");
  logEntryDiv.classList.add(eventType);

  let logdtgDiv = instructorWindow.document.createElement("span");
  logdtgDiv.classList.add("logdtgDiv");
  logdtgDiv.setAttribute('dtgraw', gameLog.logArray[index].dtgRaw);
  logdtgDiv.innerHTML = gameLog.logArray[index].dtg; // logStr
  
  let logStrDiv = instructorWindow.document.createElement("span");
  logStrDiv.classList.add("logStrDiv");
  logStrDiv.innerHTML = gameLog.logArray[index].logStr;
  
  logEntryDiv.appendChild(logdtgDiv);
  logEntryDiv.appendChild(logStrDiv);
  
  // how append child to the actual log object:
  
  instructorWindow.document.getElementById("logDiv").appendChild(logEntryDiv);
  logEntryDiv.scrollIntoView({behavior: "smooth"});
  
  // scroll the log to the bottom?
  // log div needs to be flex column.
}


function changeOverlayState(){

  let pointsDiv = document.getElementById("overlay-points");
  let answerDiv = document.getElementById("overlay-answer");
  let questionDiv = document.getElementById("overlay-question");
  let sourceDiv = document.getElementById("overlay-source");

  switch(state.current_display_state){
    case "main_board":
      console.log("show main board.");
      pointsDiv.style.display = "none";
      answerDiv.style.display = "none";
      questionDiv.style.display = "none";
      sourceDiv.style.display = "none";
      break;

      case "show_daily_double":
        console.log("show daily double.");
        writeToGameLog("Daily double selected.", eventTypes.DISPLAY_DD);
        pointsDiv.style.display = "block";
        answerDiv.style.display = "block";
        questionDiv.style.display = "none";
        sourceDiv.style.display = "none";
        break;

    case "show_answer":
      console.log("show answer, hide question & source.");
      answerDiv.style.display = "block";
      questionDiv.style.display = "none";
      sourceDiv.style.display = "none";
      if(!gameOb.rounds[currentRound].categories[currentCategory].qaObs[currentRow].isDailyDouble){
        // it's a daily double.  don't show points as the team/individual will wager:
        pointsDiv.style.display = "block";
      }
      else{
        pointsDiv.style.display = "none";
      }
      break;
    
    case "give_question_source":
      console.log("hide points & answer");
      pointsDiv.style.display = "none";
      answerDiv.style.display = "none";
      questionDiv.style.display = "block";
      sourceDiv.style.display = "block";
      break;

      case "final_jeopardy":
        writeToGameLog("Final Jeopardy.", eventTypes.DISPLAY_FJ);
        pointsDiv.style.display = "none";
        answerDiv.style.display = "block";
        answerDiv.innerHTML = "Final Jeopardy!";
        questionDiv.style.display = "none";
        sourceDiv.style.display = "none";
        break;

    case "final_jeopardy_answer":
      writeToGameLog("Show answer.", eventTypes.DISPLAY_ANSWER);
      pointsDiv.style.display = "none";
      answerDiv.style.display = "block";
      questionDiv.style.display = "none";
      sourceDiv.style.display = "none";
      break;
    
    case "final_jeopardy_question_source":
      writeToGameLog("Give question.", eventTypes.DISPLAY_QUESTION);
      pointsDiv.style.display = "none";
      answerDiv.style.display = "none";
      questionDiv.style.display = "block";
      sourceDiv.style.display = "block";
      break;

    // first clicked. show points and answer:
    
  }

  let currentQA = gameOb.rounds[currentRound].categories[currentCategory].qaObs[currentRow];

  switch(state.current_display_state){
    case "main_board":
    case "show_answer":
    case "give_question_source":
      answerDiv.innerHTML = unescape(currentQA.answer);
      questionDiv.innerHTML = unescape(currentQA.question);
      sourceDiv.innerHTML = unescape(currentQA.source);
      if(!gameOb.rounds[currentRound].categories[currentCategory].qaObs[currentRow].isDailyDouble){
        // it's a daily double.  don't show points as the team/individual will wager:
        pointsDiv.innerHTML = unescape(gameOb.rounds[currentRound].categories[currentCategory].title) + ": " + currentQA.points;
      }
    break;
    case "show_daily_double":
      pointsDiv.innerHTML = "Daily Double!";
      answerDiv.innerHTML = "Wager?";
    break;
    case "final_jeopardy":
      answerDiv.innerHTML = "Final Jeopardy!";
    break;
    case "final_jeopardy_answer":
    case "final_jeopardy_question_source":
      let fjOb = gameOb.rounds[currentRound].roundInfo.finalJeopardy;
      pointsDiv.innerHTML = "";
      answerDiv.innerHTML = unescape(fjOb.answer);
      questionDiv.innerHTML = unescape(fjOb.question);
      sourceDiv.innerHTML = unescape(fjOb.source);
    break;
  }

}


