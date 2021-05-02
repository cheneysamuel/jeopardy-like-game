// jplayer.js is used by the jeopardygame.html file to provide all functionality.  

$(document).ready(function() {

  // the game object to store all the game and rounds information:

  // listen for the load file button:
  document.getElementById('file').addEventListener('change', showFile, false);

  // listen for buttons:
  
  
	$("#openIWindow").on('click', function(){
		
		openInstructorWindow();
		
	});

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


let currentCategory = 0;
let currentRow = 0;

var instructorWindow;

function GameOb() {
  this.gameInfo = new GameInfoOb();
  this.rounds = [];

  this.addRound = function() {
    this.rounds.push(new roundOb(roundCounter, new roundInfoOb("Round 1", 2, ["Category 1", "Category 2"]), []));
    roundCounter++;
  }
}


function GameInfoOb() {
  this.creator = "creator";
  this.dateCreated = "date created";
  this.comments = "comments.";
  this.backgroundColor = "#0000FF";
  this.fontColor = "#FFFFFF";
}


function roundOb(id, info, data) {
  this.roundID = id;
  this.roundInfo = info;
  this.categories = [];

   this.addCategory = function() {
     this.categories.push(new categoryOb("New Category"));
   }
}


function roundInfoOb(_roundName, _numOfQuestionRows) {
  this.roundName = _roundName;
  this.numberOfQuestionRows = _numOfQuestionRows;
  this.finalJeopardyIncluded = false;
  this.finalJeopardy = new finalJ("", "", "", "");
}


function categoryOb(_title){
    this.title = _title;
    this.qaObs = [];
    this.addQAob = function(pos, val){
        this.qaObs.push(new QAob(true, pos, val, 30, "", "", "", "", false));
    }
}


function QAob(_selectable, _pos, _points, _timerInSeconds, _answer, _question, _source, _comments, _isDailyDouble) {
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


function finalJ(_answer, _question, _source, _comments) {
  this.answer = _answer;
  this.question = _question;
  this.source = _source;
  this.comments = _comments;
}



let gameOb = new GameOb(); // "ET1", "now", "none.", [0,0,255], [0,0,0]
let currentRound = 0;


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

      alert("here");

      Object.assign(gameOb, JSON.parse(event.target.result));

      // load the round data:
      populateFromLoadedGameOb();
      

    }
  } else {
    preview.innerHTML = "Invalid filetype";
  }
  reader.readAsText(file);
}

function openInstructorWindow(){

    // create the window and load the appropriate css file:
    if(!instructorWindow || instructorWindow.closed){
      // the window was never opened. open it and load the appropriate game and round information:
      instructorWindow = window.open("", "Instructor Controls", "width=800,height=800");

      initializeInstructorWindowContent();



        // let creatorDiv = instructorWindow.document.getElementById('creator-div');
        // let dateCreatedDiv = instructorWindow.document.getElementById('date-created-div');
        // let gameCommentsDiv = instructorWindow.document.getElementById('game-comments-div');
      
        // let questionDiv = instructorWindow.document.getElementById('question-div');
        // let answerDiv = instructorWindow.document.getElementById('answer-div');
        // let sourceDiv = instructorWindow.document.getElementById('source-div');
        // let commentsDiv = instructorWindow.document.getElementById('comments-div');
    
        // creatorDiv.innerHTML = "example creator";
        // dateCreatedDiv.innerHTML = "example date created";
        // gameCommentsDiv.innerHTML = "example game comments";   
      
        // questionDiv.innerHTML = "example question";
        // answerDiv.innerHTML = "example answer";
        // sourceDiv.innerHTML = "example source";
        // commentsDiv.innerHTML = "example comments";

    }
//     let head = Document.getElementByTagName('HEAD')[0];
//     let link = Document.creatElement('link');
//     link.rel = 'stylesheet';
//     link.type = 'text/css';
//     link.href = 'instructor-window.css';
//     head.appendChild(link);
    
    // create the instructor window elements:
//     instructorWindow.document.write("<p>Move this window onto the extra screen area.</p>");
//     instructorWindow.document.title = "Instructor Window";
	

	
//     answerDiv.id = "answer-div";
//     questionDiv.id = "question-div";
//     sourceDiv.id = "source-div";
//     commentsDiv.id = "comments-div";
	
//     instructorWindow.document.body.appendChild(answerDiv);
//     instructorWindow.document.body.appendChild(questionDiv);
//     instructorWindow.document.body.appendChild(sourceDiv);
//     instructorWindow.document.body.appendChild(commentsDiv);
  

}


function initializeInstructorWindowContent(){
  
  // due to CSRF protections, we need to build this from scratch:

  //alert("initializing...");

  instructorWindow.document.write("<p>Move this window onto the extra screen area.</p>");
  instructorWindow.document.title = "Instructor Window";

  let cssSource = instructorWindow.document.createElement("link");
  cssSource.type = "text/css";
  cssSource.rel = "stylesheet";
  cssSource.href = "instructor-window.css";
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

    let totalRoundsDiv = instructorWindow.document.createElement("div");
    totalRoundsDiv.classList.add("round-info-field");
    totalRoundsDiv.id = "total-rounds-div";

    let finalJeopardyIncludedDiv = instructorWindow.document.createElement("div");
    finalJeopardyIncludedDiv.classList.add("round-info-field");
    finalJeopardyIncludedDiv.id = "final-jeopardy-included-div";

  roundDiv.appendChild(roundNameDiv);
  roundDiv.appendChild(roundNumberDiv);
  roundDiv.appendChild(totalRoundsDiv);
  roundDiv.appendChild(finalJeopardyIncludedDiv);

  topInfo.appendChild(roundDiv);

  instructorWindow.document.body.appendChild(topInfo);


  // QA information section:
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

  QAdiv.appendChild(answerDiv);
  QAdiv.appendChild(questionDiv);
  QAdiv.appendChild(sourceDiv);
  QAdiv.appendChild(commentsDiv);
  QAdiv.appendChild(pointsDiv);
  QAdiv.appendChild(timerDiv);

  instructorWindow.document.body.appendChild(QAdiv);


}



function initializeInstructorWindowWithGameInformation(str1, str2, str3){
	
    instructorWindow.document.getElementById("creator-div").innerHTML = str1;
    instructorWindow.document.getElementById("date-created-div").innerHTML = str2;
    instructorWindow.document.getElementById("game-comments-div").innerHTML = str3;
	
}


function updateInstructorWindow_roundInfo(str1, str2, str3, str4){

  instructorWindow.document.getElementById("round-name-div").innerHTML = str1;
  instructorWindow.document.getElementById("round-number-div").innerHTML = str2;
  instructorWindow.document.getElementById("total-rounds-div").innerHTML = str3;
  instructorWindow.document.getElementById("final-jeopardy-included-div").innerHTML = str4;

}

function updateInstructorWindow_QA(round, category, row){

  alert("round: " + round + ", category: " + category + ", row: " + row);

  switch(state.current_game_state){
    case "final_jeopardy":
    case "final_jeopardy_answer":
    case "final_jeopardy_question_source":
      let fj = gameOb.rounds[round].roundInfo.finalJeopardy;

      instructorWindow.document.getElementById("answer-div").innerHTML = unescape(fj.answer);
      instructorWindow.document.getElementById("question-div").innerHTML = unescape(fj.question);
      instructorWindow.document.getElementById("source-div").innerHTML = unescape(fj.source);
      instructorWindow.document.getElementById("comments-div").innerHTML = unescape(fj.comments);
    break;
    case "show_answer":
    case "give_question_source":
      let thisQA = gameOb.rounds[round].categories[category].qaObs[row];

      instructorWindow.document.getElementById("answer-div").innerHTML = unescape(thisQA.answer);
      instructorWindow.document.getElementById("question-div").innerHTML = unescape(thisQA.question);
      instructorWindow.document.getElementById("source-div").innerHTML = unescape(thisQA.source);
      instructorWindow.document.getElementById("comments-div").innerHTML = unescape(thisQA.comments);
      instructorWindow.document.getElementById("points-div").innerHTML = thisQA.points;
      instructorWindow.document.getElementById("timer-div").innerHTML = thisQA.timerInSeconds;
    break;
  }

  if(state.current_game_state == "final_jeopardy"){


  }
  else{

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

  updateInstructorWindow_roundInfo(rName, (currentRound + 1), gameOb.rounds.length);


  // create the jeopardy table for the first round (round 0):
  createJeopardyTable(0);

}


 //     $("#rounds").empty();


function createJeopardyTable(roundNum) {

  // change gamestate:
  state.current_file_state = "game_loaded";
  state.current_game_state = "game_started";
  state.current_display_state = "main_board";

  // use the rows and columns to fill a div with a grid/table thing:

  // clear the grid:
  $("#finalGrid").empty();

  let cols = gameOb.rounds[roundNum].categories.length;
  let rows = gameOb.rounds[roundNum].categories[0].qaObs.length;

  // create a div for each category column container:
  for(let x = 0; x < cols; x++){
      let categoryColumn = document.createElement('div');
      categoryColumn.classList.add("category-container");

      // add a qa_item div for each qa_item and put it into the column_container:
      for(let obs = 0; obs < rows+1; obs++){

          if (obs == 0) {
              // it's a title row. Make div's:
              let categoryTitle = document.createElement('div');
              categoryTitle.classList.add("qa_title");
              categoryTitle.innerHTML = unescape(gameOb.rounds[currentRound].categories[x].title);
              categoryColumn.appendChild(categoryTitle);
            } else {

              // regular cell, make divs's:
              let obCell = document.createElement('div');
              obCell.classList.add("qa_item");
              obCell.classList.add("incomplete");
              obCell.id = x + "," + (obs-1);
              obCell.addEventListener('click', function(){
                  playQA(obs-1, x, this);
              }, false);

              // we have enough qa_items.  fill the cell with the qa_item points:
              obCell.innerHTML = gameOb.rounds[currentRound].categories[x].qaObs[obs-1].points;

              categoryColumn.appendChild(obCell);

          }

      }

      document.getElementById("finalGrid").appendChild(categoryColumn);

  }

}


function playQA(row, col, ob){

  // change gamestate:
  state.current_display_state = "show_answer";

  currentCategory = col;
  currentRow = row;

  let overlayBox = document.getElementById("overlay-box");

  let currentQA = gameOb.rounds[currentRound].categories[currentCategory].qaObs[currentRow];

  // instructor clicked on the QA cell, play it.  

  // load the question and points onto the overlay:
  document.getElementById("overlay-points").innerHTML = currentQA.points;
  document.getElementById("overlay-answer").innerHTML = unescape(currentQA.answer);
  document.getElementById("overlay-question").innerHTML = unescape(currentQA.question);
  document.getElementById("overlay-source").innerHTML = unescape(currentQA.source);

  document.getElementById("overlay-points").style.display = "block";
  document.getElementById("overlay-answer").style.display = "block";

  // display the overlay:
  overlayBox.style.display = "block";

  // update the instructor window information with QA info:
  updateInstructorWindow_QA(currentRound, currentCategory, currentRow);

  changeOverlayState();

  ob.classList.remove("incomplete");
  ob.classList.add("selected");

}


function clickOverlay(ob){

  switch(state.current_display_state){
    case "show_answer":

    // now show the question and source:
      state.current_display_state = "give_question_source";

      changeOverlayState();

      break;
    case "give_question_source":

      state.current_display_state = "main_board";

      // clicking out of question/source, check for end of round & final Jeopardy:

      // manage classes for keeping track of cells:
      ob.classList.remove("selected");
      ob.classList.add("finished");

      // remove and reset the overlay:
      document.getElementById("overlay-box").style.display = "none";

      changeOverlayState();

      // remove the points text from the overlay box:
      ob.innerHTML = "";

      checkForRoundCompletion();

      break;
    case "final_jeopardy":

      // final jeopardy! is being displayed.  click on this should give you your fj answer:
      state.current_display_state = "final_jeopardy_answer";

      // fill the overlay with the fj answer:
      updateInstructorWindow_QA(currentRound, currentCategory, currentRow);

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

    document.getElementById("overlay-box").style.display = "none";

    // do we have another round?

      break;
  }

}


function checkForRoundCompletion(){

  // do we have any divs with the "incomplete" class?:
  if(document.getElementsByClassName("incomplete").length < 1){

    // we don't.  Now check for final jeopardy:
    if(gameOb.rounds[currentRound].roundInfo.finalJeopardyIncluded){
  
      // we have final Jeopardy! play it!:
      displayFinalJeopardyAnnouncement();
    }
    else{

      // no final jeopardy.  check for a next round:
      if(currentRound < gameOb.rounds.length-1){
  
        // we have another round. Load it:
        currentRound++;
        createJeopardyTable(currentRound);
      }
      else{
        
        // we have no more rounds.  end of game:
        alert("Congratulations!  You have finished all rounds!");
        state.current_game_state = "game_ended";
      }
    }
  }

}



function displayFinalJeopardyAnnouncement(){

  // change gamestate:
  state.current_game_state = "final_jeopardy";

  changeOverlayState();

  // display the overlay:
  let overlayBox = document.getElementById("overlay-box");

  overlayBox.style.display = "block";
  
  // say: "Final Jeopardy!":

  document.getElementById("overlay-question").innerHTML = "Final Jeopardy!";


}


function changeOverlayState(){
  switch(state.current_display_state){
    case "show_answer":
      document.getElementById("overlay-points").style.display = "block";
      document.getElementById("overlay-answer").style.display = "block";
      document.getElementById("overlay-question").style.display = "none";
      document.getElementById("overlay-source").style.display = "none";
      break;
    
    case "give_question_source":
      document.getElementById("overlay-points").style.display = "none";
      document.getElementById("overlay-answer").style.display = "none";
      document.getElementById("overlay-question").style.display = "block";
      document.getElementById("overlay-source").style.display = "block";
      break;
    case "final_jeopardy_answer":
      document.getElementById("overlay-points").style.display = "none";
      document.getElementById("overlay-answer").style.display = "block";
      document.getElementById("overlay-question").style.display = "none";
      document.getElementById("overlay-source").style.display = "none";
      break;
    
    case "final_jeopardy_question_source":
      document.getElementById("overlay-points").style.display = "none";
      document.getElementById("overlay-answer").style.display = "none";
      document.getElementById("overlay-question").style.display = "block";
      document.getElementById("overlay-source").style.display = "block";
      break;

    // first clicked. show points and answer:
    
  }

  let currentQA = gameOb.rounds[currentRound].categories[currentCategory].qaObs[currentRow];

  document.getElementById("overlay-points").innerHTML = currentQA.points;
  document.getElementById("overlay-answer").innerHTML = unescape(currentQA.answer);
  document.getElementById("overlay-question").innerHTML = unescape(currentQA.question);
  document.getElementById("overlay-source").innerHTML = unescape(currentQA.source);

  document.getElementById("overlay-points").style.display = "block";
  document.getElementById("overlay-answer").style.display = "block";

}


