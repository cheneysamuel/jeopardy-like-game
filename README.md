# jeopardy-like-game

Efforts at improving the AN/GSC-52B MET Terminals course IETM navigation and equipment familiarization has led to the creation of this website/application.  It is firstly a tool that can create game files, used with the jeopardygame file.  The JeopardyGameCreator creates the game files which are saved separate.

Other differences:

1. The jeopardygame file is used to play files created by the jeopardygamecreator.

2. Customization includes multiple rounds, categories, rows, and colors used.

3. A "judges" screen is used (on a dual-monitor setup) in order for participant answers to be deemed correct.

4. Beside the normal question & answer, additional information is given:
       - "Source" information, concerning where the answer was derived
       - Comments information, concerning possible hints that instructors may give, if the class participants are struggling. Also, allows instructors & content creators to add which version of the IETM was used to create this question/answer.  
       - A timer, with adjustable seconds for each question/answer

What this game is NOT:
  1. It is not a score keeper.  Experience has taught us the unfortunate truth: each class is incredibly diverse, to include individual intellectual aptitude.  It is up to the instructor to implement rules based on the class makeup.  Many class members will rely too much on a single "intellectual" to score all the points for their team. Scoring will not be a part of this web app.  
  2. It is not based on the newest browsers.  DoD applications often times move very slow to both update existing web browsers or to approve new web browser applications.  It is bare-bones (plus, I haven't learned react/vue/angular/etc. yet).  


Currently...

[11APR21]: Added comments field and colors options.
[12APR21]: Moved jeopardygamecreator and associated files to this repository.
[12APR21]: changed json object format to be strictly heirarchical.  I'm not sure why I didn't do it in the first place.



To accomplish:

1. Redesign the jeopardygame file (to be used for gameplay).  The old file was not moved over to this repository as it needs to be rebuilt. Too many changes have been made to the game files and it would be foolish not to do this.
    a. Reproduce gameplay of the original
    b. Include the additional information provided with the version of the game file
    c. Implement full-screen mode
    d. Add a way for instructors to "undo" selection of jeopardy squares
    e. Make game data editing section modal
    f. Allow image files to be used
