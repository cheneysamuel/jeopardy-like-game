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

  document.getElementById('qaPoints').addEventListener('change', validateNum, false);
  document.getElementById('qaTimerInSeconds').addEventListener('change', validateNum, false);
  
  let finalAnswerField = document.getElementById('finalAnswerField');
  let finalQuestionField = document.getElementById('finalQuestionField');
  let finalSourceField = document.getElementById('finalSourceField');
  let finalCommentsField = document.getElementById('finalCommentsField');

  let qaAnswerField = document.getElementById('qaAnswer');
  let qaQuestionField = document.getElementById('qaQuestion');
  let qaSourceField = document.getElementById('qaSource');
  let qaCommentsField = document.getElementById('qaComments');


  enableEditRound(false);


});


let state = { "file_states":["game_not_loaded", 
                             "game_loaded"],
             "game_states":["game_not_begun", 
                            "game_begun", 
                            "game_ended"],
             "displayStates":["blank", 
                              "main_board", 
                              "show_question", 
                              "give_answer_source", 
                              "show_daily_double", 
                              "final_jeopardy", 
                              "final_jeopardy_question", 
                              "final_jeopardy_answer"],
             
             "current_file_state":"game_not_loaded",
             "current_game_state":"game_not_begun",
             "current_game_state":"blank"
            }


let currQA = {};



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


function showFile() {
  //	alert("showFile called...");


  var preview = document.getElementById('title');

  var file = document.querySelector('input[type=file]').files[0];

  var reader = new FileReader()

  var textFile = /text.*/;

  if (file.type.match(textFile)) {
    reader.onload = function(event) {

      // once successfully loaded, purge the gameOb and all fields:

      //		gameOb = new GameOb();

      purgeAll();

      Object.assign(gameOb, JSON.parse(event.target.result));



      // load the round data:

      populateFromLoadedGameOb();

      $("#game_information").accordion("option", "active", 0);

    }
  } else {
    preview.innerHTML = "Invalid filetype";
  }
  reader.readAsText(file);
}

function openInstructorWindow(){
	
    myWindow = window.open("", "myWindow", "width=800,height=800");
    let head = Document.getElementByTagName('HEAD')[0];
    let link = Document.creatElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'instructor-window.css';
    head.appendChild(link);
    
    myWindow.document.write("<p>Move this window onto the extra screen area.</p>");
    myWindow.document.title = "Instructor Window";
    var qDiv = document.createElement('div');
    var aDiv = document.createElement('div');

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




function populateFromLoadedGameOb() {


  //		alert("populating from the loaded gameOb");

  // load the gameInfo information:
  document.getElementById("creatorField").value = unescape(gameOb.gameInfo.creator);
  document.getElementById("dateCreatedField").value = unescape(gameOb.gameInfo.dateCreated);
  document.getElementById("commentsField").value = unescape(gameOb.gameInfo.comments);
  document.getElementById("background-color").value = unescape(gameOb.gameInfo.backgroundColor);
  document.getElementById("font-color").value = unescape(gameOb.gameInfo.fontColor);

  // update the roundID counter to reflect the current game file:
  for (var i = 0; i < gameOb.rounds.length; i++) {
    if (gameOb.rounds[i].roundID > roundCounter) {
      roundCounter = gameOb.rounds[i].roundID;
      //				alert("roundCounter: " + roundCounter + ", roundID: " + gameOb.rounds[i].roundID);
    }
  }

  //	alert("roundCounter: " + roundCounter);


  // load the rounds and their titles:
  populateRoundsFromFile();

}


function populateRoundsFromFile() {

  // empty out the rounds:


  $("#rounds").empty();

  //	alert("emptied the rounds.");

  // using the gameOb, count the number of rounds:

  var roundsThisGame = gameOb.rounds.length;

  for (var i = 0; i < roundsThisGame; i++) {

    // for every round, we need its name:
    button_createRound(gameOb.rounds[i].roundID);

  }

}


function button_createRound(theRoundID) {

  var thisRoundID = 0;

  var nameOfRound = "x";

  // create a new round on the list of rounds:

  if (theRoundID == "[object MouseEvent]" || theRoundID == "[object PointerEvent]") {

    // the user clicked on the "new round" button:

    //roundCounter++;

    thisRoundID = roundCounter;

    // auto-populate the name:
    nameOfRound = roundCounter;

    // add a round to the gameOb:

    gameOb.addRound();

    // set the roundID:
    gameOb.rounds[gameOb.rounds.length - 1].roundID = roundCounter;

  } else {
    // a file is being loaded.  set the ID to be the roundID from the gameOb:
    thisRoundID = theRoundID

    //roundCounter++;

    // search for the roundName's:
    for (var i = 0; i < gameOb.rounds.length; i++) {
      if (theRoundID == gameOb.rounds[i].roundID) {
        nameOfRound = unescape(gameOb.rounds[i].roundInfo.roundName);

      }
    }
  }

  var roundNumString = "<li id='" + thisRoundID + "'><span class='round-name'>" + nameOfRound + "</span><button id='reb" + roundCounter + "' onclick='button_editRoundItem(this.id)' type='button'>Edit</button><button type='button' id='rdb" + roundCounter + "' onclick='button_deleteRoundItem(this.id)' type='button'>Delete</button></li>";

  // add it to the list:
  $(roundNumString).appendTo("#rounds");

  // refresh the list:
  refreshAll();

}





function button_deleteRoundItem(but_id) {

  //	alert(but_id);

  // if the round being deleted is the round also being edited.. purge the round info:

  var roundID = $("#" + but_id).parent().index();

  //	alert("currRound: " + currRound + ", roundID: " + roundID);

  // remove the round:
  


  // if the round we deleted is the current round we are working on, purge the info fields:
  if (currRound == roundID) {
    purgeRoundInfo();
  }




  //	alert("number of rounds: " + gameOb.rounds.length);

  // confirm that the user wants to delete this round:
  if (confirm("are you sure you want to delete this round and all associated data?")) {

    // this object is actually the button, and the round is its parent, so remove the parent:
    $("#" + but_id).parent().remove();

    // now remove the round from the gameOb:
    gameOb.rounds.splice(roundID, 1);

    // refresh the sortable list:
    refreshAll();

  }

  //	alert("number of rounds(after): " + gameOb.rounds.length);

}


function updateRoundName() {
  // whenever editing the round name, change it in the other field:
  //	alert("updating...");

  document.getElementById('rounds').children[currRound].children[0].innerHTML = document.getElementById('roundNameField').value;

  //indicateChange();
}


function changeNumOfRows() {
  // get the new number of rows as input into the field:
  var newRowsNum = parseInt(document.getElementById("numOfRowsField").value);

  //	alert(gameOb.rounds[currRound].roundInfo.numberOfQuestionRows);

  // the number of rows has been changed.. do you want to continue, as data may be lost?
  if (gameOb.rounds[currRound].roundInfo.numberOfQuestionRows > newRowsNum) {
    //we may lose data, as our selection is less than the current number of rows. confirm:
    if (confirm("Are you sure you want to reduce the number of rows?  Some data may be lost.") == true) {
      // change the number of rows:
      gameOb.rounds[currRound].roundInfo.numberOfQuestionRows = newRowsNum;

    }
  } else {
    gameOb.rounds[currRound].roundInfo.numberOfQuestionRows = newRowsNum;
    createJeopardyTable(newRowsNum, gameOb.rounds[currRound].categories.length);
  }
  
  saveAllFields();

  

}


function enableEditRound(canEdit) {
  if (canEdit == true) {
    document.getElementById("roundNameField").disabled = false;
    document.getElementById("numOfRowsField").disabled = false;
    document.getElementById("createCategory").disabled = false;
    document.getElementById("finalJeopardyIncludedCheckbox").disabled = false;
    document.getElementById("finalAnswerField").disabled = false;
    document.getElementById("finalQuestionField").disabled = false;
    document.getElementById("finalSourceField").disabled = false;
    document.getElementById("finalCommentsField").disabled = false;
  } else {
    document.getElementById("roundNameField").disabled = true;
    document.getElementById("numOfRowsField").disabled = true;
    document.getElementById("createCategory").disabled = true;
    document.getElementById("finalJeopardyIncludedCheckbox").disabled = true;
    document.getElementById("finalAnswerField").disabled = true;
    document.getElementById("finalQuestionField").disabled = true;
    document.getElementById("finalSourceField").disabled = true;
    document.getElementById("finalCommentsField").disabled = true;
  }
}


function purgeAll() {
  // empty the gameOb:
  gameOb = {};

  // empty all fields:
  purgeQAdata();
  purgeRoundInfo();
  purgeGameInfo();

}


function purgeGameInfo() {

  document.getElementById("creatorField").value = null;
  document.getElementById("dateCreatedField").value = null;
  document.getElementById("commentsField").value = null;
  document.getElementById("background-color").value = "#0000FF";
  document.getElementById("font-color").value = "#FFFFFF";


}


function purgeRoundInfo() {

  //	alert("purgeRoundInfo called...");

  // When the currently selected round is deleted, delete also the round information:
  document.getElementById("roundNameField").value = null;
  document.getElementById("numOfRowsField").value = null;
  document.getElementById("createCategory").value = null;
  document.getElementById("finalJeopardyIncludedCheckbox").checked = false;
  document.getElementById("finalAnswerField").value = null;
  document.getElementById("finalQuestionField").value = null;
  document.getElementById("finalSourceField").value = null;
  document.getElementById("finalCommentsField").value = null;

  enableEditRound(false);
}


function button_editRoundItem(theID) {

    console.log("editing round...");

  //	alert($("#"+theID).parent().attr('id'));
  //	alert("theID: " + theID);
  // open the round information accordion pane:
  $("#round_information").accordion("option", "active", 0);

  var obIndex = $("#" + theID).parent().index();

  //	alert("obIndex: " + obIndex);
  //	alert("index: " + obIndex);
  var roundInfoOb = gameOb.rounds[obIndex].roundInfo;

  currRound = obIndex;

  //	alert("currRound: " + currRound + ", obIndex: " + obIndex);
  //	alert("roundName: " + roundInfoOb.roundName);

  enableEditRound(true);

  // load the roundInfo:

  //	alert(roundInfoOb.roundName);

  //	alert(unescape(roundInfoOb.roundName));

  document.getElementById("roundNameField").value = unescape(roundInfoOb.roundName);
  document.getElementById("numOfRowsField").value = roundInfoOb.numberOfQuestionRows;
  //	document.getElementById("colTitlesList").value = unescape(roundInfoOb.columnTitles);
  document.getElementById("finalJeopardyIncludedCheckbox").checked = roundInfoOb.finalJeopardyIncluded;
  document.getElementById("finalAnswerField").enabled = true;
  document.getElementById("finalQuestionField").enabled = true;
  document.getElementById("finalSourceField").enabled = true;
  document.getElementById("finalCommentsField").enabled = true;
  document.getElementById("finalAnswerField").value = unescape(roundInfoOb.finalJeopardy.answer);
  document.getElementById("finalQuestionField").value = unescape(roundInfoOb.finalJeopardy.question);
  document.getElementById("finalSourceField").value = unescape(roundInfoOb.finalJeopardy.source);
  document.getElementById("finalCommentsField").value = unescape(roundInfoOb.finalJeopardy.comments);

  createJeopardyTable(roundInfoOb.numberOfQuestionRows, gameOb.rounds[obIndex].categories.length);

  //	generateGameBoard(gameOb.rounds[currRound]);


  $("#colTitlesList").empty();
  
  console.log("creating column titles..." + gameOb.rounds[obIndex].categories.length + " titles");

  // load the colTitlesList from the array:
  for (var i = 0; i < gameOb.rounds[obIndex].categories.length; i++) {
    
    let titleDiv = document.createElement('div');
    titleDiv.id = "round" + obIndex + "cat" + i;

    let titleField = document.createElement('input');
    titleField.type = "field";
    titleField.value = unescape(gameOb.rounds[obIndex].categories[i].title);
    titleField.onfocusout = function(){saveAllFields()};

    let titleButton = document.createElement('button');
    titleButton.id = "cdb" + obIndex + "_" + i;
    titleButton.type = "button";
    titleButton.innerHTML = "delete";
    titleButton.onclick = function() {
      removeCategory(obIndex, i, this.id)
    };

    titleDiv.appendChild(titleField);
    titleDiv.appendChild(titleButton);
    
    console.log("appending title...");
    
    document.getElementById("colTitlesList").appendChild(titleDiv);



  }

  refreshAll();

  // load the roundData array:

  purgeQAdata();
  currQA = null;

}

// defunct:
function refreshAll() {
  //	$("#numOfRowsField").value = gameOb.rounds[currRound].roundInfo.numberOfQuestionRows;

}


function createJeopardyTable(rows, cols) {

  console.log("rows: " + rows + ", columns: " + cols);
  // use the rows and columns to fill a div with a grid/table thing:
  rowsNum = parseInt(rows);
  // clear the grid:
  //$("#gameGrid").empty();

  $("#finalGrid").empty();

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
              categoryTitle.innerHTML = unescape(gameOb.rounds[currRound].categories[x].title);
              categoryColumn.appendChild(categoryTitle);
            } else {

              // regular cell, make divs's:
              let obCell = document.createElement('div');
              obCell.classList.add("qa_item");
              obCell.id = x + "," + (obs-1);
              obCell.addEventListener('click', function(){
                  editQA(obs-1, x, this);
                  document.getElementById("qaPoints").scrollIntoView();
              }, false);


              if(obs > gameOb.rounds[currRound].categories[x].qaObs.length){
                  // we don't have enough qa_items to fill the rows.  Create it:
                  gameOb.rounds[currRound].categories[x].addQAob(obs-1, (obs*100));
                  obCell.classList.add("default");
              }
              else{
                  // we have enough qa_items.  fill the cell with the qa_item points:
                  obCell.innerHTML = gameOb.rounds[currRound].categories[x].qaObs[obs-1].points;
              }  

              categoryColumn.appendChild(obCell);

          }


      }

      document.getElementById("finalGrid").appendChild(categoryColumn);

      //  if(cols > 0){
      //    let colWidth = (100/cols).toString() + "%";
      //    console.log("colWidth: " + colWidth);
      //    $(".qa_title").css({'width':colWidth});
      //  }

  }

  // make columns equal widths:

  


  // $("#gen_tab").empty();


  // // prebuild the grid:

  // let tableEl = document.getElementById("gen_tab");

  // let tblBody = document.createElement('tbody');
  // tblBody.id = "1,2";
  // tableEl.appendChild(tblBody);

  // for (var t = 0; t < rowsNum + 1; t++) {
  //   // add a <tr> for each row, to include the title row:
  //   let tblRow = document.createElement('tr');

  //   //for each row, add the appropriate amount of cells (equal to the number of columns):
  //   for (var c = 0; c < cols; c++) {
  //     if (t == 0) {
  //       // it's a title row. Make <th>'s:
  //       let th = document.createElement('th');
  //       th.innerHTML = unescape(gameOb.rounds[currRound].categories[c].title);
  //       tblRow.appendChild(th);
  //     } else {
  //       // regular cell, make <td>'s:
  //       let td = document.createElement('td');
  //       td.id = t + "," + c;
  //       if(gameOb.rounds[currRound].categories[c].qaObs[t].points != undefined){
  //         td.innerHTML = gameOb.rounds[currRound].categories[c].qaObs[t].points;
  //       }
  //       else{
  //         td.innerHTML = "x";
  //       }
  //       td.classList.add("qa_item");
  //       let cellCall = td.id.split(",");
  //       td.addEventListener("click", function() {
  //         editQA(cellCall[0], cellCall[1], this);
  //         document.getElementById("qaPoints").scrollIntoView();
  //       }, false);
  //       tblRow.appendChild(td);
  //     }
  //   }

  //   tblBody.appendChild(tblRow);

  //   //	document.getElementById("#gameGrid").appendChild(tblBody);

  // }

  // document.getElementById("finalGrid").appendChild(tableEl);

  // now iterate through the roundData elements and place them into their proper places:

  // for (var e = 0; e < gameOb.rounds[currRound].roundData.length; e++) {
  //   // look at the category and position of each
  //   let thisQA = gameOb.rounds[currRound].roundData[e];

  //   // the row is the .pos+1, the column is the category:
  //   let cell = tblBody.children[thisQA.pos].children[thisQA.category];

  //   // add the cell points:
  //   cell.innerHTML = thisQA.points;


  // }


}


function exportText() {

  //	alert("rounds: " + gameOb.rounds.length);

  //	prompt("roundData:", JSON.stringify(gameOb));
  
  // save any fields that were not saved:
  
  saveAllFields();

  if (confirm("You are about to export a usable game file.  Continue?") == true) {

    // in order for the generated file to work with the current iteration of the game, all QAdata must be sorted by category then position:

    // for each round:

  //   for (var i = 0; i < gameOb.rounds.length; i++) {

  //     // look into the roundData array and sort by category then by position

  //     // sort the array by pos:
  //     gameOb.rounds[i].roundData.sort(function(a, b) {
  //       return a.pos - b.pos
  //     });

  //   }

    //	alert(gameOb.rounds[i].roundData);


    var blob = new Blob([JSON.stringify(gameOb)], {
      type: "text/plain;charset=utf-8"
    });
    saveAs(blob, "newGame.txt");

  }

}

function createCategory() {

  //	alert("attempting to create a category...");

  //	alert("currRound: " + currRound);

  var catPos = gameOb.rounds[currRound].categories.length;
  
  // create a new category field & button:
  var newCat = document.createElement("div");
  
  newCat.className = "categoryField";
  newCat.id = "round" + currRound + "cat" + catPos;
  
  // create the actual field:
  var newInputField = document.createElement("input");
  
  newInputField.type = "field";
  newInputField.value = "Example Category";
  
  newInputField.onfocusout = function(){saveAllFields()};
  
  // append the field to the div:
  newCat.appendChild(newInputField);
  
  // create the category delete button:
  
  var newDeleteButton = document.createElement("button");
  
  newDeleteButton.id = "ceb" + currRound + "_" + catPos;
  newDeleteButton.type = "button";
  newDeleteButton.innerHTML = "Delete";

  newDeleteButton.onclick = function(){removeCategory(currRound, catPos, this.id)};
  
  // append button to the div:
  
  newCat.appendChild(newDeleteButton);

  // due to the changing nature of the round information pane, you need to add the category into the array asap:
  //var titleStr = "<div class='categoryField' id='round" + currRound + "cat" + catPos + "'><input type='field' value='Example Category'/><button id='ceb" + currRound + "_" + catPos + "' type='button' onclick='removeCategory(" + currRound + ", " + catPos + ", this.id)'>Delete</button></div>";

  // now add it to the actual array:
  gameOb.rounds[currRound].addCategory();

  // add the category item into the list:
  //$(titleStr).appendTo("#colTitlesList");
  
  document.getElementById("colTitlesList").appendChild(newCat);
  
  newInputField.select();

  // flexbox, depending on the number of categories, make each column take up an equal width:
  
  refreshAll();

  // rebuild the game grid:
  createJeopardyTable(gameOb.rounds[currRound].roundInfo.numberOfQuestionRows, gameOb.rounds[currRound].categories.length);

  //	generateGameBoard(gameOb.rounds[currRound]);

}


function editQA(_pos, _col, element) {
  //	alert("_pos: " + _pos + ", _col: " + _col);

  //	alert(element.id);

  $("#category_data").accordion("option", "active", 0);


  let theRound = gameOb.rounds[currRound].categories[_col];

  // load the appropriate data:

  let thisQA = gameOb.rounds[currRound].categories[_col].qaObs[_pos];


  if (!thisQA) {
    //	alert("no data exists");
    // the QAob is not created.  Create one and load it, using the row and col:
    theRound.categories.addQAob(_pos, (100 * _pos));

    thisQA = theRound.qaObs[qaObs.length - 1];


  }

  // set the current working qa to thisQA:

  currQA = thisQA;

  //	alert(thisQA.question);
  //	alert(thisQA.answer);

  // we either loaded a QAob or created one.  Now load the variables into the fields:

  document.getElementById("qaPoints").value = thisQA.points;
  document.getElementById("qaTimerInSeconds").value = thisQA.timerInSeconds;
  document.getElementById("qaAnswer").value = unescape(thisQA.answer);
  document.getElementById("qaQuestion").value = unescape(thisQA.question);
  document.getElementById("qaSource").value = unescape(thisQA.source);
  document.getElementById("qaComments").value = unescape(thisQA.comments);
  document.getElementById("qaDailyDouble").checked = thisQA.isDailyDouble;

  // now designate the QA as being selected, removing it from any previous:

  let qaArray = document.getElementsByClassName("qa_item");

  for (var i = 0; i < qaArray.length; i++) {
    qaArray[i].classList.remove("selected");
  }

  // designate the item as selected by adding the class "selected":

  //	alert(element.classList);

  element.classList.add("selected");

}


function validateNum() {


  let valField = document.getElementById("qaPoints");
  // look at the value of the "qaPoints" field, and change the color of the field if it is NaN:
  if (isNaN(valField.points)) {
    // color the field red:
    valField.classList.add("invalidField");
  } else {
    // color the field white:
    valField.classList.remove("invalidField");
  }
}




function saveQAdata() {

  if (currQA != null) {

    if ($("#qaPoints").hasClass("invalidField") == false) {

      currQA.points = parseInt(document.getElementById("qaPoints").value);
      currQA.timerInSeconds = parseInt(document.getElementById("qaTimerInSeconds").value);
      currQA.answer = escape(document.getElementById("qaAnswer").value);
      currQA.question = escape(document.getElementById("qaQuestion").value);
      currQA.source = escape(document.getElementById("qaSource").value);
      currQA.comments = escape(document.getElementById("qaComments").value);
      currQA.isDailyDouble = document.getElementById("qaDailyDouble").checked;

      // change the currQA to be the value of the QA.  The first item should be the only item:

      $(".selected")[0].innerHTML = currQA.points;

    } else {
      alert("error: invalid value");
    }

  }

}


function purgeQAdata() {

  //	alert("purging QA data...");

  currQA = null;

  document.getElementById("qaPoints").value = null;
  document.getElementById("qaTimerInSeconds").value = null;
  document.getElementById("qaAnswer").value = null;
  document.getElementById("qaQuestion").value = null;
  document.getElementById("qaSource").value = null;
  document.getElementById("qaComments").value = null;
  document.getElementById("qaDailyDouble").checked = false;

}


function saveAllFields() {

    console.log("saving all fields...");

  //	alert("roundID: " + gameOb.rounds[currRound].roundID);

  // update the gameOb with field information:

  // information for the entire game:

  gameOb.gameInfo.creator = escape(document.getElementById("creatorField").value);
  gameOb.gameInfo.dateCreated = escape(document.getElementById("dateCreatedField").value);
  gameOb.gameInfo.comments = escape(document.getElementById("commentsField").value);
  gameOb.gameInfo.backgroundColor = escape(document.getElementById("background-color").value);
  gameOb.gameInfo.fontColor = escape(document.getElementById("font-color").value);

  // information for the current round being edited:

  gameOb.rounds[currRound].roundInfo.roundName = escape(document.getElementById("roundNameField").value);
  gameOb.rounds[currRound].roundInfo.numberOfQuestionRows = parseInt(document.getElementById("numOfRowsField").value);
  gameOb.rounds[currRound].roundInfo.finalJeopardyIncluded = document.getElementById("finalJeopardyIncludedCheckbox").checked;
  gameOb.rounds[currRound].roundInfo.finalJeopardy.answer = escape(document.getElementById("finalAnswerField").value);
  gameOb.rounds[currRound].roundInfo.finalJeopardy.question = escape(document.getElementById("finalQuestionField").value);
  gameOb.rounds[currRound].roundInfo.finalJeopardy.source = escape(document.getElementById("finalSourceField").value);
  gameOb.rounds[currRound].roundInfo.finalJeopardy.comments = escape(document.getElementById("finalCommentsField").value);

  // save the categories:

  //		alert(currRound);
  
  console.log("number of categories: " + gameOb.rounds[currRound].categories.length);

  for (var i = 0; i < gameOb.rounds[currRound].categories.length; i++) {
    console.log("columnTitle : " + gameOb.rounds[currRound].categories[i].title);
    //take each item from the list, use the field inside to create an array to update the column titles array in the gameOb:
    gameOb.rounds[currRound].categories[i].title = document.getElementById("colTitlesList").children[i].children[0].value;
    //			alert(catArray[i]);
  }

  //gameOb.rounds[currRound].roundInfo.columnTitles = catArray;

  createJeopardyTable(gameOb.rounds[currRound].roundInfo.numberOfQuestionRows, gameOb.rounds[currRound].categories.length);

  //		generateGameBoard(gameOb.rounds[currRound]);


  //	refreshAll();

}


function removeCategory(rnd, pos, but_id) {

  // remove the sortable item:

    //			alert(but_id);
    // this object is actually the button, and the round is its parent, so remove the parent:
    $("#" + but_id).parent().remove();

    // remove the category:
    gameOb.rounds[rnd].categories.splice(pos, 1);

    // refresh the sortable list:
    refreshAll();

  }



function button_createNew() {

  // attempting to create a new file.  All data will be lost of not saved. ask:
  if (confirm("You are about to create a new file.  Any existing data that is not saved will be lost. Do you want to proceed?") == true) {

    // proceed to renew everything:
    purgeAll();

    // now create the basic gameOb:

    gameOb = new GameOb();

    populateRoundsFromFile();

  }

}
