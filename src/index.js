'use strict';
var Alexa = require('alexa-sdk');
var APP_ID = undefined; // can be replaced with your app ID if publishing
var facts = require('./facts');
var GET_FACT_MSG_EN = [
  "Here's your fact: ",
  'Random fact: ',
  'Some AI fact to think about: ',
  'Facts are FUN: ',
  'Did you know? ',
];

// Test hooks - do not remove!
exports.GetFactMsg = GET_FACT_MSG_EN;
var APP_ID_TEST = 'mochatest'; // used for mocha tests to prevent warning
// end Test hooks
/*
    TODO (Part 2) add messages needed for the additional intent
    TODO (Part 3) add reprompt messages as needed
*/

var YEAR_DRAWS_A_BLANK_EN = [
  ' draws a blank for me. ',
  ' is not a year I know much about. ',
];
var DIFFERENT_YEAR_MSG_EN = [
  "Here's a fact from a different year: ",
  "So you don't go away empty handed: ",
];
var AGAIN_OR_STOP_EN = [
  ' <break time="500ms" /> Say <p>Stop</p> to end conversation, or <p>A fact</p> to get another fact',
  ' <break time="500ms" /> Say <p>Stop</p> to end conversation, or <p>random fact</p> to get another fact',
  ' <break time="500ms" /> Say <p>Stop</p> to end conversation, or <p>another fact</p> to get another fact',
];
var REPROMPT_EN = [
  " try saying 'a fact', or saying 'a fact from' a specific year'",
  " try saying 'give me trivia', or saying 'a fun fact from' a specific year'",
];
var languageStrings = {
  en: {
    translation: {
      FACTS: facts.FACTS_EN,
      SKILL_NAME: 'My History Facts', // OPTIONAL change this to a more descriptive name
      GET_FACT_MESSAGE: GET_FACT_MSG_EN,
      YEAR_DRAWS_A_BLANK: YEAR_DRAWS_A_BLANK_EN,
      DIFFERENT_YEAR_MSG: DIFFERENT_YEAR_MSG_EN,
      AGAIN_OR_STOP: AGAIN_OR_STOP_EN,
      REPROMPT: REPROMPT_EN,
      HELP_MESSAGE:
        'You can say tell me a fact, or, you can say exit... What can I help you with?',
      HELP_REPROMPT: 'What can I help you with?',
      STOP_MESSAGE: 'Goodbye!',
    },
  },
};

exports.handler = function(event, context, callback) {
  var alexa = Alexa.handler(event, context);
  alexa.APP_ID = APP_ID;
  // set a test appId if running the mocha local tests
  if (event.session.application.applicationId == 'mochatest') {
    alexa.appId = APP_ID_TEST;
  }
  // To enable string internationalization (i18n) features, set a resources object.
  alexa.resources = languageStrings;
  alexa.registerHandlers(handlers);
  alexa.execute();
};

/*
    TODO (Part 2) add an intent for specifying a fact by year named 'GetNewYearFactIntent'
    TODO (Part 2) provide a function for the new intent named 'GetYearFact' 
        that emits a randomized fact that includes the year requested by the user
        - if such a fact is not available, tell the user this and provide an alternative fact.
    TODO (Part 3) Keep the session open by providing the fact with :askWithCard instead of :tellWithCard
        - make sure the user knows that they need to respond
        - provide a reprompt that lets the user know how they can respond
    TODO (Part 3) Provide a randomized response for the GET_FACT_MESSAGE
        - add message to the array GET_FACT_MSG_EN
        - randomize this starting portion of the response for conversational variety
*/

var handlers = {
  LaunchRequest: function() {
    this.emit('GetFact');
  },
  GetNewFactIntent: function() {
    this.emit('GetFact');
  },
  GetFact: function() {
    // Get a random fact from the facts list
    // Use this.t() to get corresponding language data
    var factArr = this.t('FACTS');
    var randomFact = randomPhrase(factArr);

    // Create speech output
    var randomGetFactMessage = randomPhrase(this.t('GET_FACT_MESSAGE'));
    var speechOutput = randomGetFactMessage + randomFact;
    var randomAgainOrStop = randomPhrase(this.t('AGAIN_OR_STOP'));
    var randomReprompt = randomPhrase(this.t('REPROMPT'));
    this.emit(
      ':askWithCard',
      speechOutput + randomAgainOrStop,
      randomReprompt,
      this.t('SKILL_NAME'),
      randomFact
    );
  },
  GetNewYearFactIntent: function() {
    //TODO your code here
    var factArr = this.t('FACTS');
    var year = this.event.request.intent.slots.FACT_YEAR.value;
    const yearPhrase = randomYearPhrase(factArr, year);
    var randomAgainOrStop = randomPhrase(this.t('AGAIN_OR_STOP'));
    var randomReprompt = randomPhrase(this.t('REPROMPT'));
    let speechOutput;

    if (yearPhrase !== '') {
      var randomGetFactMessage = randomPhrase(this.t('GET_FACT_MESSAGE'));
      speechOutput = randomGetFactMessage + yearPhrase;
    } else {
      var randomYearDrawsABlank = randomPhrase(this.t('YEAR_DRAWS_A_BLANK'));
      var randomDifferentYearMsg = randomPhrase(this.t('DIFFERENT_YEAR_MSG'));
      speechOutput =
        year +
        randomYearDrawsABlank +
        randomDifferentYearMsg +
        randomPhrase(factArr);
    }
    this.emit(
      ':askWithCard',
      speechOutput + randomAgainOrStop,
      randomReprompt,
      this.t('SKILL_NAME'),
      yearPhrase
    );
  },
  'AMAZON.HelpIntent': function() {
    var speechOutput = this.t('HELP_MESSAGE');
    var reprompt = this.t('HELP_MESSAGE');
    this.emit(':ask', speechOutput, reprompt);
  },
  'AMAZON.CancelIntent': function() {
    this.emit(':tell', this.t('STOP_MESSAGE'));
  },
  'AMAZON.StopIntent': function() {
    this.emit(':tell', this.t('STOP_MESSAGE'));
  },
};

function randomPhrase(phraseArr) {
  // returns a random phrase
  // where phraseArr is an array of string phrases
  var i = 0;
  i = Math.floor(Math.random() * phraseArr.length);
  return phraseArr[i];
}

function randomYearPhrase(phraseArr, year) {
  let retValue = '';
  const yearPhaseArr = phraseArr.filter(phrase =>
    phrase.match(new RegExp(year))
  );
  if (yearPhaseArr.length > 0) {
    retValue = randomPhrase(yearPhaseArr);
  }
  return retValue;
}
