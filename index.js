var firstClick = true;
var numFlags;

var Board = {
  difficulty: 1,
  
  //  Stores mine locations
  //  0: No mine
  //  1: Mined
  
  board: [],
  
  //  Stores board state of uncovered/flagged positions
  //  0: Covered
  //  1: Uncovered
  //  2: Flagged
  //  3: Explodey (BOOM)

  traversed: [],
  
  updateBoardState: function(r,c, $clickedElement){
    
    //  May be useless now
    //  Edit: Confirm useless
    
    //this.dispBoard[r][c] = 1;
    
    // Check for mines
    
    if (this.hasMine(r,c) && ($clickedElement.hasClass("tile"))){
      this.gameOver(r,c, $clickedElement);
    }
    
    //  Generate temporary traversed map to keep track of tiles we have already checked
    
    this.traversed = $.extend(true, [], this.board);
    
    //  Recursively check the board array if an empty tile is clicked
    //  Will not trigger if flagged tile is clicked
    
    if ($clickedElement.hasClass('tile')){
      this.mineCheckRecurse(r,c);
    }
    
  },
  
  mineCheckRecurse: function(r,c){
    
    //  Get new tile
    var $tile = $('#wrapper').find("#r"+r).children("#c"+c);
    
    //  If current tile is empty, we set it to 2 for 'traversed', and uncover it
    
    if (!(this.hasMine(r,c))){
      this.traversed[r][c] = 2;
      this.updateClass("tile", "uncovered", $tile);
      
    } 
    
    var areaClear = true;
    var mineCount = 0;
    for (var i = -1; i <= 1; i++){
      for (var j = -1; j <= 1; j++){
        
        if ((this.indexValid(r+i,c+j)) && (this.board[r+i][c+j] === 1)){
          areaClear = false;
          mineCount += 1;
        }
      }
    }
    
    //  If surrounding area is clear, proceed to recurse
    
    if (areaClear){
      for (var i = -1; i <= 1; i++){
        for (var j = -1; j <= 1; j++){
          if (this.indexValid(r+i,c+j) && (this.traversed[r+i][c+j] === 0)){
            this.mineCheckRecurse(r+i,c+j);
          }
        }
      }
    }
    
    //  Set number to display on uncovered tile

    if (!(areaClear)){

      $tile.text(mineCount);
    }
    

    
  },
  
  indexValid: function(r,c){
    if (this.board[r] === undefined){
      return false;
    }
    else if (this.board[r][c] === undefined){
      return false;
    }
    return true;
  },
  
  //  Takes in rc coordinates, returns True for mine, False for no mine in that position
  hasMine: function(r,c){
    if (this.board[r][c]===1){
      return true;
    }
    return false;  
  },
  
  //  If div element has the oldclass, update to a new one. Returns true
  //  Returns false if element does not have old class and does not make any changes
  
  updateClass: function(oldClass, newClass, $clickedElement){
    if ($clickedElement.hasClass(oldClass)){
      $clickedElement.removeClass(oldClass);
      setTimeout(function(){
        $clickedElement.addClass(newClass);
      }, 50);
      
      return true;
    }
    return false;
  },
  
  //  Ends the game when user clicks on mine
  //  TODO: Prevent anymore user interactions
  
  gameOver: function(r,c, $clickedElement){
    this.updateClass('tile', 'mine', $clickedElement);
    alert("YOU LOSE");
     $('.column').off('click');
  },
  
  //  If tile is covered, flag it.
  //  If tile is flagged, unflag it
  //  Ignore uncovered tiles
  
  toggleFlag: function( $clickedElement){
    if ($clickedElement.hasClass("tile")){
      Board.updateClass('tile', 'flagged', $clickedElement);
      numFlags -= 1;
      $("#insert").text(numFlags);
    }
    else if ($clickedElement.hasClass("flagged")){
      Board.updateClass('flagged', 'tile', $clickedElement);
      numFlags += 1;
      $("#insert").text(numFlags);
    }
    
  },
  
  genBoard: function(r,c){
    var numRows = this.board.length;
    var numCols = this.board[0].length;
    var numMines;
    
    
    numMines = (numRows - 5) * (numCols - 5);
    numFlags = numMines;
    $("#insert").text(numFlags);
    
    //  Randomly place mines;
    //  Prevent mine from spawning on first click location so that player does not instantly lose
    
    
    var numMinesPlaced = 0;
    while (numMinesPlaced < numMines){
      var randRow = Math.floor(Math.random() * numRows);
      var randCol = Math.floor(Math.random() * numCols);
      if ((randRow <= r+1) && (randRow >= r-1) && (randCol <= c+1) && (randCol >= c-1)){
        var z = "do nothing";
      }
      else{
        if (this.board[randRow][randCol] === 0){
          this.board[randRow][randCol] = 1;
          numMinesPlaced += 1;
        }
      }
    }
    
  },
  
  displayBoard: function(){
    var $container = $("#wrapper");
    
    // Set numbers according to difficulty level
    
    switch (this.difficulty){
      case 1:
        rows = 10;
        cols = 10;
        break;
      case 2:
        rows = 12;
        cols = 12;
        break;
      case 3:
        rows = 24;
        cols = 30;
        break;
      default:
        rows = 10;
        cols = 10;
        break;
    }
    
    //  Initialise board
    
    for (var i = 0; i < rows; i++){
      var row = [];
      for (var j = 0; j< cols; j++){
        row.push(0);
        
      }
      this.board.push(row);
    }
    
    
    //  Set board size
    var wrapperWidth = cols * 40;
    
    $container.css({
      'width': wrapperWidth + 'px',
    });
    
    
    //  Loop through each row
    for (var i = 0; i < rows; i++){
      
      //  create skeleton for the row
      var rowId = "r"+i.toString();
      var $row = $("<div>", {
        "class": "row",
        "id": rowId
      });
      
      //  Loop through each column
      for (var j=0; j<cols; j++){
        
        //  create skeleton for the column
        var colId = "c"+j.toString();
        var $column = $("<div>", {
          "class": "column tile",
          "id": colId,
          "oncontextmenu": "return false;"
        });
        
        var maxWidth = $container.width();
        var colWidth = (maxWidth/cols).toPrecision(2);
  
        $column.css({
          "width": colWidth, 
          "height": "19px"
        });
        
        //Append to row div
        $row.append($column);
      }
      $container.append($row);
    }
  }
  
};

$(document).ready(function () {
  difficulty = prompt("Please select difficulty level");
  Board["difficulty"] = parseInt(difficulty);
  Board.displayBoard();
  $('.column').on( "click", function() {
    
    //  Get rc coordinates
    
    var r = parseInt($(this).parent().attr('id').substr(1));
    var c = parseInt($(this).attr('id').substr(1));
    
    
    // Spawn mines on first click
    
    if (firstClick){
      Board.genBoard(r,c); 
    }
    
    console.log("clicking on: " + r + " " + c);
    Board.updateBoardState(r,c, $(this));
    
    if (firstClick){
      firstClick = false;
    }
    
  });
  
  $(".button").on("click", function(){
    location.reload();
  });
  
  $(document).on("contextmenu", ".column", function(){Board.toggleFlag($(this)) });
});


