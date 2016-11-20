/* global $, Handlebars */
(function() {
  'use strict';
  var current_score = 0;
  const startState = `00000000000000000000
02222022222222022220
02002020000002020020
02022222222222222020
02020020011001002020
02222220311101222220
02020020000003002020
02022241111111222020
02002010000001020020
02222011111111022220
00000000000000000000`;

  const width = 20 + 1; // +1 de la endl
  const height = 11;
  var xPlayer, yPlayer;


  const tileMapping = {
    '0': 'wall',
    '1': 'empty',
    '2': 'food',
    '3': 'ghost',
    '4': 'player'
  };

  let currentState = startState;

String.prototype.replaceAt = function(y, x, character) {
  let index = y * width + x;
  return this.substr(0, index) + character + this.substr(index + character.length);
}
String.prototype.getAt = function(y, x) {
  let index = y * width + x;
  return this[index];
}

  // Do stuff when the DOM is ready
  $(function() {
    // We use Handlebars.js for painless templating -- http://http://handlebarsjs.com/
    const $labyrinthRenderingTemplate = $('#labyrinthRenderingTemplate');
    const labyrinthTemplateFn = Handlebars.compile($labyrinthRenderingTemplate.html());

    // Bind some UI elements
    const $nextStepTrigger = $('#nextStepTrigger');
    const $gameStateContainer = $('#gameStateContainer');

    var turn = 0;
    var finished = 0;
    var ghosts = [];


    initGhostsAndPlayer();

    /**
     * This function renders the game state to the output DIV using a Handlebars template
     */
    function renderGameState(state) {
      const templateData = state.split('\n').map(function(row) {
        return row.split('').map(function(tile) {
          return tileMapping[tile];
        });
      });
      $gameStateContainer.empty().html(labyrinthTemplateFn(templateData));
    }

    /**
     * This function is used to calculate the next step
     */
    function calculateNextStep() {
      // Perform logic for step change
      //alert('Implement this please');

      // currentState = currentState.replaceAt(1, 2, "4");
      // renderGameState(currentState);
      if (finished != 0){
        finished = 0;
        currentState = startState;
        initGhostsAndPlayer();
        renderGameState(currentState);
        return;
      }
      turn += 1;
      print('Turn ' + turn);

      if(movePlayer()){
        for(var i = 0; i<ghosts.length; i++){
          moveGhost(i); 
        }
          renderGameState(currentState);
        }

    }

    // Bind some events from the UI
    $nextStepTrigger.on('click', calculateNextStep);

    // Render the game state once when we start
    renderGameState(currentState);

    function scoreAt(y, x) {
      dist = initMatrix(0);
      distanceMatrix(y, x, 1);
      return 1 * current_score -
        1.5 * distance_to('2') -
        2 / distance_to('3') -
        4 * count('2')
    }

    function getMax(y, x, depth) {
      var max = -999999999;
      if (y <= -1 || x <= -1 || y >= height || x >= width - 1) {
        return max;
      }

      if (currentState.getAt(y, x) == '0' || currentState.getAt(y, x) == '3') {
        return max;
      }

      if (viz[y][x] == 1) {
        return max;
      }

      viz[y][x] = 1;

      if (depth == 1) {
        return scoreAt(y, x);
      }

      const deltas = [{x: -1, y: 0}, {x: 0, y: -1}, {x: 1, y: 0}, {x: 0, y: 1}];

      var maxX;
      var maxY;

      for(var i = 0; i < deltas.length; i ++){
        var currentMax = getMax(y + deltas[i]['y'], x + deltas[i]['x'], depth + 1);
        if (max < currentMax) {
          max = currentMax;
          maxX = x + deltas[i]['x'];
          maxY = y + deltas[i]['y'];
        }
      }

      return {
        max: max,
        maxX: maxX,
        maxY: maxY
      };
    }

    var viz = {};
    var dist = {};

    function initMatrix(fillValue){
      var matrix = [];
      for (var i = 0; i < height; i++) {
        matrix[i] = [];
        for (var j = 0; j < width - 1; j++) {
          matrix[i][j] = fillValue;
        }
      }
      return matrix;      
    }

    function distanceMatrix(y, x, depth) {
      if (y <= -1 || x <= -1 || y >= height || x >= width - 1) {
        return;
      }

      if (currentState.getAt(y, x) == '0' || currentState.getAt(y, x) == '3') {
        dist[y][x] = 5555555555;
        return;
      }

      if (dist[y][x] != 0) {
        if (dist[y][x] > depth) {
            dist[y][x] = depth;
        }
        else{
          return;
        }
      }

      dist[y][x] = depth;


      const deltas = [{x: -1, y: 0}, {x: 0, y: -1}, {x: 1, y: 0}, {x: 0, y: 1}];

      for(var i = 0; i < deltas.length; i ++){
        distanceMatrix(y + deltas[i]['y'], x + deltas[i]['x'], depth + 1);
      }
    }

    function distance_to(tile) {
      var minState = 99999;
      for (var i = 0; i < height; i++) {
        for (var j = 0; j < width - 1; j++) {
          if (currentState.getAt(i, j) == tile && minState > dist[i][j]) {
            minState = dist[i][j];
          }
        }
      }

      return minState;
    }

    function count(tile) {
      var sum = 0;
      for (var i = 0; i < height; i++) {
        for (var j = 0; j < width - 1; j++) {
          if (currentState.getAt(i, j) == tile) {
            sum += 1;
          }
        }
      }

      return sum;
    }

    //Gaseste cele doua fantome din matrice si le salveaza pozitiile
    function initGhostsAndPlayer() {
        ghosts = [];
        turn = 0;
        current_score = 0;
      for (var i = 0; i < height; i++) {
        for (var j = 0; j < width - 1; j++) {
          if (currentState.getAt(i, j) == '3') {
            ghosts.push({lastX: j, lastY: i, x: j, y: i, tile: '1'});
          }
          if (currentState.getAt(i, j) == '4') {
            xPlayer = j;
            yPlayer = i;
          }
        }
      }
    }

    function getGhostNewPosition(y, x, lastYGhost, lastXGhost) {
      var pos = [];

      const deltas = [{x: -1, y: 0}, {x: 0, y: -1}, {x: 1, y: 0}, {x: 0, y: 1}];

      for(var i = 0; i < deltas.length; i++){
        if (x + deltas[i]['x'] >= 0 && x + deltas[i]['x'] < width - 1 && 
          y + deltas[i]['y'] >= 0 && y + deltas[i]['y'] < height) {

          if(lastYGhost == y + deltas[i]['y'] && deltas[i]['y'] != 0){
            continue;
          }


          if(lastXGhost == x + deltas[i]['x'] && deltas[i]['x'] != 0){
            continue;
          }

          if (currentState.getAt(y + deltas[i]['y'], x + deltas[i]['x']) != '0') {
            pos.push({
              x: x + deltas[i]['x'],
              y: y + deltas[i]['y']
            });
          }
        }        
      }

      if (pos.length == 0) {
        return {
          x: lastXGhost,
          y: lastYGhost
        };
      }

      var rand = pos[Math.floor(Math.random() * pos.length)];
      return rand;

    }

    function movePlayer(){
        viz = initMatrix(0);
        var newPos = getMax(yPlayer, xPlayer, 0);

        if( currentState.getAt(newPos['maxY'], newPos['maxX']) == '3'){
            print(" - Player moved on ghost.");
            print(" - Ghosts win - GAME OVER");
            finished = 1;
            return false;
        }

        print(" - Player moved to ["+newPos['maxX']+", "+ newPos['maxY']+"]. Score is: "+current_score);

        //current_score = newPos['max'];
        currentState = currentState.replaceAt(yPlayer, xPlayer, '1');
        if(currentState.getAt(newPos['maxY'], newPos['maxX']) == '2'){
            current_score += 1;
            print(" - Player eats a piece of food. Score is: "+current_score);

        }

        xPlayer = newPos['maxX'];
        yPlayer = newPos['maxY'];
        currentState = currentState.replaceAt(yPlayer, xPlayer, '4');

        if (count('2') == 0){
          finished = 1;
          print(" - Player wins! Score is: "+current_score);
          return false;
        }

        return true;
    }


    function moveGhost(ghostIndex){
        var x = ghosts[ghostIndex]['x'];
        var y = ghosts[ghostIndex]['y'];
        var tile = ghosts[ghostIndex]['tile'];
        var lastY = ghosts[ghostIndex]['lastY'];
        var lastX = ghosts[ghostIndex]['lastX'];

        var newPos = getGhostNewPosition(y, x, lastY, lastX);
        currentState = currentState.replaceAt(y, x, tile);
        tile = currentState.getAt(newPos['y'], newPos['x']);

        if(tile == '4'){
            print(" - Ghost "+ ghostIndex +" eats player character");
            print(" - Ghosts win - GAME OVER");
            finished = 1;
            return;
        }

        print(" - Ghost "+ ghostIndex +" moved to ["+newPos['x']+", "+ newPos['y']+"]");
        
        //Daca pe tile-ul pe care vreau sa ma mut se afla o fantoma, retin ce se afla inainte de fantoma acolo
        if (tile == '3'){
          for(var i = 0; i<ghosts.length; i++){
            if(ghosts[i]['x'] == newPos['x'] && ghosts[i]['y'] == newPos['y']){
              tile = ghosts[i]['tile'];
            }
          }
        }

        ghosts[ghostIndex]['lastX'] = x;
        ghosts[ghostIndex]['lastY'] = y;
        ghosts[ghostIndex]['y'] = newPos['y'];
        ghosts[ghostIndex]['x'] = newPos['x'];
        ghosts[ghostIndex]['tile'] = tile;
        currentState = currentState.replaceAt(ghosts[ghostIndex]['y'], ghosts[ghostIndex]['x'], '3');
    }

    function print(msg){
        var prev = $("#gameLogOutput").val();
        $("#gameLogOutput").val(prev + '\n' + msg);
    }

  });
})();
