/* global $, Handlebars */
(function () {
  'use strict';

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

  const tileMapping = {
    '0': 'wall',
    '1': 'empty',
    '2': 'food',
    '3': 'ghost',
    '4': 'player'
  };

  let currentState = startState;

  // Do stuff when the DOM is ready
  $(function () {
    // We use Handlebars.js for painless templating -- http://http://handlebarsjs.com/
    const $labyrinthRenderingTemplate = $('#labyrinthRenderingTemplate');
    const labyrinthTemplateFn = Handlebars.compile($labyrinthRenderingTemplate.html());

    // Bind some UI elements
    const $nextStepTrigger = $('#nextStepTrigger');
    const $gameStateContainer = $('#gameStateContainer');

    /**
     * This function renders the game state to the output DIV using a Handlebars template
     */
    function renderGameState() {
      const templateData = currentState.split('\n').map(function (row) {
        return row.split('').map(function (tile) {
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
      alert('Implement this please');
    }

    // Bind some events from the UI
    $nextStepTrigger.on('click', calculateNextStep);

    // Render the game state once when we start
    renderGameState();
  });
})();
