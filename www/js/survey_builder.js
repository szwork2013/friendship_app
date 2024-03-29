angular.module('starter.survey_builder', [])

.service('SurveyBuilder', function (GuidMaker){
  return {
    build: function(source, sourceLanguage) {
      var content = [];

      console.log(source);
      // Loop through each object
      _.each(source, function (object){
        //build new survey object

        if(object.type === "numeric") {
            object.type = "number";
        };

        var question = {
            id: object.guid,
            questionGroup: object.group,
            questionDataLabel: (object.group + '_' + object.orderer),
            responseGroupId: object.group,
            type: object.type,
            order: object.orderer,
            content: object.content,
            language: object.language,
            required: object.required
        };

        var valuelessResponses = [];
        var responses = [];
        // construct responses
        _.each(object, function (value, key, list){

            // Check if key begins with 'response'
            if(key.startsWith("response")) {

                //parse out order_identifier
                var orderer = key.match(/\d+/)[0];

                //Check if it is a response label and exists
                if(!key.endsWith("value") && value !== null) {

                    //construct response object
                    var responseObject = {
                        Objectid: question.id,
                        label: value,
                        order: orderer,
                        responseGroupId: question.questionGroup,
                        responseGroupLabel: question.questionGroup
                    }

                    // insert into responses array
                    valuelessResponses.push(responseObject);
                };

                if (key.endsWith("value") && value !== null) {

                    // parse out orderer
                    var orderer = key.match(/\d+/)[0];

                    // find associated response object
                    var responseObject = _.find(valuelessResponses, {order: orderer});

                    // set the value
                    responseObject.value = value;

                    // push completed response object into finished array
                    responses.push(responseObject);

                }
            }
        });

        // attach responses array to question
        question.responses = responses;

        // push question object into content array
        content.push(question);

      });

        var groupedContent = _.toArray(_.groupBy(content, 'order'));
        console.log(groupedContent);
        return groupedContent;

    }
  }
})
