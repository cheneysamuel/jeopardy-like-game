$(document).ready(function() {
  //	alert("Created by ET1 Cheney.  Direct any questions towards him.");

  // the game object to store all the game and rounds information:


  $("#game_information").accordion({
    active: false,
    collapsible: true,
    heightStyle: "content"
  });
  $("#round_information").accordion({
    active: false,
    collapsible: true,
    heightStyle: "content"
  });
  $("#category_data").accordion({
    active: false,
    collapsible: true,
    heightStyle: "content"
  });



  // listen for the load file button:
  document.getElementById('file').addEventListener('change', showFile, false);

  // listen for buttons:
  document.getElementById('newbutton').addEventListener('click', button_createNew, false);
  document.getElementById('createRound').addEventListener('click', button_createRound, false);

  // listen for field changes:
  document.getElementById('numOfRowsField').addEventListener('change', changeNumOfRows, false);
  document.getElementById('roundNameField').addEventListener('change', updateRoundName, false);

  document.getElementById('qaValue').addEventListener('change', validateNum, false);
  
  
  qaAnswerField = document.getElementById('qaAnswer');
  qaQuestionField = document.getElementById('qaQuestion');
  qaSourceField = document.getElementById('qaSource');
  
  /*
  qaAnswerField.oninput = function(){saveAllFields()};
  qaQuestionField.oninput = function(){saveAllFields()};
  qaSourceField.oninput = function(){saveAllFields()};
  */
  
  qaAnswerField.onfocus = function(){selectIfDefault(this)};
  qaQuestionField.onfocus = function(){selectIfDefault(this)};
  qaSourceField.onfocus = function(){selectIfDefault(this)};


  enableEditRound(false);


});


var roundCounter = 1000;

var currRound = -1;

let currQA = {};



function GameOb() {
  this.gameInfo = new GameInfoOb();
  this.rounds = [];

  this.addRound = function() {
    this.rounds.push(new roundOb(roundCounter++, new roundInfoOb("aaa", 2, ["firstCat", "secondCat"]), []));
  }
}


function GameInfoOb() {
  this.creator = "creator";
  this.dateCreated = "date created";
  this.comments = "comments.";
}


function roundOb(id, info, data) {
  this.roundID = id;
  this.roundInfo = info;
  this.roundData = data;

  this.addRoundData = function() {
    this.roundData.push(new QAob(true, 0, 0, 100, "answer", "question", "source", false));
  }
}


function roundInfoOb(_roundName, _numOfQuestionRows, _columnTitles) {
  this.roundName = _roundName;
  this.numberOfQuestionRows = _numOfQuestionRows;
  this.columnTitles = _columnTitles;
  this.finalJeopardyIncluded = false;
  this.finalJeopardy = new finalJ("Xanswer", "Xquestion", "Xsource");
}


function QAob(_selectable, _category, _pos, _value, _answer, _question, _source, _isDailyDouble) {
  this.selectable = _selectable;
  this.category = _category;
  this.pos = _pos;
  this.value = _value;
  this.answer = _answer;
  this.question = _question;
  this.source = _source;
  this.isDailyDouble = _isDailyDouble;
}


function finalJ(_answer, _question, _source) {
  this.answer = _answer;
  this.question = _question;
  this.source = _source;
}



let gameOb = new GameOb("ET1", "now", "none.");



// not used right now until you care enough to turn the table into an actual flex div grid:
function generateGameBoard(roundOb) {

  // take the gameObject given and generate the game board:

  //	alert("generating on round: " + roundOb.roundID);

  let gridString = "";

  // for each category, add a column:
  for (var i = 0; i < roundOb.roundInfo.columnTitles.length; i++) {
    gridString = gridString.concat("<div class='grid-column' id='cat" + i + "' >");

    // in each of the columns, fill with individual divs, having the 
    for (var j = 0; j < roundOb.roundInfo.numberOfQuestionRows + 1; j++) {

      gridString = gridString.concat("<div class='grid-cell' ");

      if (j == 0) {
        // we have a column title. add the column title:
        gridString = gridString.concat("id='title" + j + "'>" + roundOb.roundInfo.columnTitles[j] + "</div>");
      } else {
        // we have a regular cell.  Add the value to the cell:




        gridString = gridString.concat("id='aq" + (j - 1) + "'>" + roundOb.roundData[((roundOb.roundInfo.columnTitles.length - 1) * j) + i].value + "</div>");
      }
    }

    gridString = gridString.concat("</div>");

    //		alert(gridString);

  }

  $("#finalGrid").empty();

  document.getElementById("finalGrid").innerHTML = gridString;

  //	prompt("finalGrid:", gridString);



  // now place the category (column title) into the top cell:

  //	foreach()

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



function populateFromLoadedGameOb() {


  //		alert("populating from the loaded gameOb");

  // load the gameInfo information:
  document.getElementById("creatorField").value = unescape(gameOb.gameInfo.creator);
  document.getElementById("dateCreatedField").value = unescape(gameOb.gameInfo.dateCreated);
  document.getElementById("commentsField").value = unescape(gameOb.gameInfo.comments);

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
/*
function indicateChange(ob) {
  // get the parent id:
  //	alert(element.value);
	console.log("changed: " + ob.id);
  //	if(element.)

  //document.getElementById("saveDataButton").disabled = false;
}
*/


function button_createRound(theRoundID) {

  var thisRoundID = 0;

  var nameOfRound = "x";

  // create a new round on the list of rounds:

  if (theRoundID == "[object MouseEvent]") {

    // the user clicked on the "new round" button:

    roundCounter++;

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

    roundCounter++;

    // search for the roundName's:
    for (var i = 0; i < gameOb.rounds.length; i++) {
      if (theRoundID == gameOb.rounds[i].roundID) {
        nameOfRound = unescape(gameOb.rounds[i].roundInfo.roundName);

      }
    }
  }

  var roundNumString = "<li id='" + thisRoundID + "'><span>" + nameOfRound + "</span><button id='reb" + roundCounter + "' onclick='button_editRoundItem(this.id)' type='button'>Edit</button><button type='button' id='rdb" + roundCounter + "' onclick='button_deleteRoundItem(this.id)' type='button'>Delete</button></li>";

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
  } else {
    document.getElementById("roundNameField").disabled = true;
    document.getElementById("numOfRowsField").disabled = true;
    document.getElementById("createCategory").disabled = true;
    document.getElementById("finalJeopardyIncludedCheckbox").disabled = true;
    document.getElementById("finalAnswerField").disabled = true;
    document.getElementById("finalQuestionField").disabled = true;
    document.getElementById("finalSourceField").disabled = true;
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
  document.getElementById("finalAnswerField").value = unescape(roundInfoOb.finalJeopardy.answer);
  document.getElementById("finalQuestionField").value = unescape(roundInfoOb.finalJeopardy.question);
  document.getElementById("finalSourceField").value = unescape(roundInfoOb.finalJeopardy.source);

  createJeopardyTable(roundInfoOb.numberOfQuestionRows, roundInfoOb.columnTitles.length);

  //	generateGameBoard(gameOb.rounds[currRound]);


  $("#colTitlesList").empty();
  
  console.log("creating column titles..." + roundInfoOb.columnTitles.length + " titles");

  // load the colTitlesList from the array:
  for (var i = 0; i < roundInfoOb.columnTitles.length; i++) {
    
    let titleDiv = document.createElement('div');
    titleDiv.id = "round" + obIndex + "cat" + i;

    let titleField = document.createElement('input');
    titleField.type = "field";
    titleField.value = unescape(roundInfoOb.columnTitles[i]);
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

    //titleField.appendTo(titleDiv);
    //titleButton.appendTo(titleDiv);
    //titleDiv.appendTo("#colTitlesList");


    //var titleStr = "<div id='round" + obIndex + "cat" + i + "'><input type='field' value='" + unescape(roundInfoOb.columnTitles[i]) + "'/><button id='cdb" + obIndex + "_" + i + "' type='button' onclick='removeCategory(" + obIndex + ", " + i + ", this.id)'>Delete</button></div>";

    //		alert(unescape(roundInfoOb.columnTitles[i]));

    //$(titleStr).appendTo("#colTitlesList");

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


function editCellData() {
  //	alert(this.innerHTML);
}



function createJeopardyTable(rows, cols) {

  //	alert("currQA.category: " + typeof currQA.category + ", currQA.pos: " + typeof currQA.pos);
  // use the rows and columns to fill a div with a grid/table thing:
  rowsNum = parseInt(rows);
  // clear the grid:
  $("#gameGrid").empty();

  $("#gen_tab").empty();

  // prebuild the grid:

  let tableEl = document.getElementById("gen_tab");

  let tblBody = document.createElement('tbody');
  tblBody.id = "1,2";
  tableEl.appendChild(tblBody);

  for (var t = 0; t < rowsNum + 1; t++) {
    // add a <tr> for each row, to include the title row:
    let tblRow = document.createElement('tr');

    //for each row, add the appropriate amount of cells (equal to the number of columns):
    for (var c = 0; c < cols; c++) {
      if (t == 0) {
        // it's a title row. Make <th>'s:
        let th = document.createElement('th');
        th.innerHTML = unescape(gameOb.rounds[currRound].roundInfo.columnTitles[c]);
        tblRow.appendChild(th);
      } else {
        // regular cell, make <td>'s:
        let td = document.createElement('td');
        td.id = t + "," + c;
        td.innerHTML = "x";
        td.classList.add("qa_item");
        let cellCall = td.id.split(",");
        td.addEventListener("click", function() {
          editQA(cellCall[0], cellCall[1], this);
          document.getElementById("qaValue").scrollIntoView();
        }, false);
        tblRow.appendChild(td);
      }
    }

    tblBody.appendChild(tblRow);

    //	document.getElementById("#gameGrid").appendChild(tblBody);

  }

  document.getElementById("finalGrid").appendChild(tableEl);

  // now iterate through the roundData elements and place them into their proper places:

  for (var e = 0; e < gameOb.rounds[currRound].roundData.length; e++) {
    // look at the category and position of each
    let thisQA = gameOb.rounds[currRound].roundData[e];

    // the row is the .pos+1, the column is the category:
    let cell = tblBody.children[thisQA.pos].children[thisQA.category];

    // add the cell value:
    cell.innerHTML = thisQA.value;


  }


}


function exportText() {

  //	alert("rounds: " + gameOb.rounds.length);

  //	prompt("roundData:", JSON.stringify(gameOb));
  
  // save any fields that were not saved:
  
  saveAllFields();

  if (confirm("You are about to export a usable game file.  Continue?") == true) {

    // in order for the generated file to work with the current iteration of the game, all QAdata must be sorted by category then position:

    // for each round:

    for (var i = 0; i < gameOb.rounds.length; i++) {

      // look into the roundData array and sort by category then by position

      // sort the array by pos:
      gameOb.rounds[i].roundData.sort(function(a, b) {
        return a.pos - b.pos
      });

    }

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

  var catPos = gameOb.rounds[currRound].roundInfo.columnTitles.length;
  
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
  gameOb.rounds[currRound].roundInfo.columnTitles.push("Example Category");

  // add the category item into the list:
  //$(titleStr).appendTo("#colTitlesList");
  
  document.getElementById("colTitlesList").appendChild(newCat);
  
  newInputField.select();
  
  

  refreshAll();

  // rebuild the game grid:
  createJeopardyTable(gameOb.rounds[currRound].roundInfo.numberOfQuestionRows, gameOb.rounds[currRound].roundInfo.columnTitles.length);

  //	generateGameBoard(gameOb.rounds[currRound]);

}


function editQA(_pos, _col, element) {
  //	alert("_pos: " + _pos + ", _col: " + _col);

  //	alert(element.id);

  $("#category_data").accordion("option", "active", 0);


  let theRound = gameOb.rounds[currRound];

  // load the appropriate data:

  let thisQA = theRound.roundData.find(function(qa) {
    return qa.pos == _pos && qa.category == _col;
  });


  if (!thisQA) {
    //	alert("no data exists");
    // the QAob is not created.  Create one and load it, using the row and col:
    theRound.roundData.push(new QAob(true, _col, _pos, (100 * _pos), "answer", "question", "source", false));

    thisQA = theRound.roundData[theRound.roundData.length - 1];


  }

  // set the current working qa to thisQA:

  currQA = thisQA;

  //	alert(thisQA.question);
  //	alert(thisQA.answer);

  // we either loaded a QAob or created one.  Now load the variables into the fields:

  document.getElementById("qaValue").value = thisQA.value;
  document.getElementById("qaAnswer").value = unescape(thisQA.answer);
  document.getElementById("qaQuestion").value = unescape(thisQA.question);
  document.getElementById("qaSource").value = unescape(thisQA.source);
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


  let valField = document.getElementById("qaValue");
  // look at the value of the "qaValue" field, and change the color of the field if it is NaN:
  if (isNaN(valField.value)) {
    // color the field red:
    valField.classList.add("invalidField");
  } else {
    // color the field white:
    valField.classList.remove("invalidField");
  }
}




function saveQAdata() {

  if (currQA != null) {

    if ($("#qaValue").hasClass("invalidField") == false) {

      currQA.value = parseInt(document.getElementById("qaValue").value);
      currQA.answer = escape(document.getElementById("qaAnswer").value);
      currQA.question = escape(document.getElementById("qaQuestion").value);
      currQA.source = escape(document.getElementById("qaSource").value);
      currQA.isDailyDouble = document.getElementById("qaDailyDouble").checked;

      // change the currQA to be the value of the QA.  The first item should be the only item:

      $(".selected")[0].innerHTML = currQA.value;

    } else {
      alert("error: invalid value");
    }

  }

}


function purgeQAdata() {

  //	alert("purging QA data...");

  currQA = null;

  document.getElementById("qaValue").value = null;
  document.getElementById("qaAnswer").value = null;
  document.getElementById("qaQuestion").value = null;
  document.getElementById("qaSource").value = null;
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

  // information for the current round being edited:

  gameOb.rounds[currRound].roundInfo.roundName = escape(document.getElementById("roundNameField").value);
  gameOb.rounds[currRound].roundInfo.numberOfQuestionRows = parseInt(document.getElementById("numOfRowsField").value);
  gameOb.rounds[currRound].roundInfo.finalJeopardyIncluded = document.getElementById("finalJeopardyIncludedCheckbox").checked;
  gameOb.rounds[currRound].roundInfo.finalJeopardy.answer = escape(document.getElementById("finalAnswerField").value);
  gameOb.rounds[currRound].roundInfo.finalJeopardy.question = escape(document.getElementById("finalQuestionField").value);
  gameOb.rounds[currRound].roundInfo.finalJeopardy.source = escape(document.getElementById("finalSourceField").value);

  // save the categories:

  //		alert(currRound);

  var catArray = [];
  
  console.log("columnTitles.length: " + gameOb.rounds[currRound].roundInfo.columnTitles.length);

  for (var i = 0; i < gameOb.rounds[currRound].roundInfo.columnTitles.length; i++) {
    console.log("columnTitle : " + gameOb.rounds[currRound].roundInfo.columnTitles[i]);
    //take each item from the list, use the field inside to create an array to update the column titles array in the gameOb:
    catArray.push(escape(document.getElementById("colTitlesList").children[i].children[0].value));
    //			alert(catArray[i]);
  }

  gameOb.rounds[currRound].roundInfo.columnTitles = catArray;

  createJeopardyTable(gameOb.rounds[currRound].roundInfo.numberOfQuestionRows, gameOb.rounds[currRound].roundInfo.columnTitles.length);

  //		generateGameBoard(gameOb.rounds[currRound]);


  //	refreshAll();

}


function removeCategory(rnd, pos, but_id) {

  // remove the sortable item:
  if (confirm("are you sure you want to delete this category and all associated data?")) {

    //			alert(but_id);
    // this object is actually the button, and the round is its parent, so remove the parent:
    $("#" + but_id).parent().remove();

    // remove the title:
    gameOb.rounds[rnd].roundInfo.columnTitles.splice(pos, 1);

    // remove the associated question-answers:


    // refresh the sortable list:
    refreshAll();

  }

  // remove the corresponding array item:


}


function selectIfDefault(ob){

	console.log("selectDefault: " + ob.id);

	switch(ob.id){
  
  	case "qaAnswer":
    	if(qaAnswerField.value == "answer"){
      	qaAnswerField.select();
      }
    break;
    
    case "qaQuestion":
    	if(qaQuestionField.value == "question"){
      	qaQuestionField.select();
      }
    
    break;
    
    case "qaSource":
    	if(qaSourceField.value == "source"){
      	qaSourceField.select();
      }
    
    break;
    
    default:
    	console.log("unidentified input while selecting round QAS");
    break;
  
  }

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


  //	alert("attempting to create a new file...");

  // use a template to create a templated gameOb:


}

