// Define the AngularJS module
var app = angular.module('quizApp', []);

// Create a controller for the quiz
app.controller('QuizController', ['$scope', '$http', '$timeout', function($scope, $http, $timeout) {
    // Initialize form data and variables
    $scope.formData = {
        symptoms: [{ value: '' }] // Default symptom field
    };
    $scope.quizScore = 0; // Initial quiz score
    $scope.quizCompleted = false; // Track if the quiz is completed
    $scope.submitButtonText = "Submit"; // Initial submit button text

    // Function to submit the form and send data to the /rank endpoint
    $scope.submitForm = function() {
        // If the quiz is already completed, redirect to the "Find Doctors" page
        if ($scope.quizCompleted) {
            window.location.href = "../book_doctor/index.html";
            return;
        }

        // Prepare user content from form data
        var userContent = `
            Feeling: ${$scope.formData.feeling},
            Goals: ${$scope.formData.goals},
            Symptoms: ${$scope.formData.symptoms.map(s => s.value).join(', ')},
            Previous Experience: ${$scope.formData.previousExperience},
            Relationships: ${$scope.formData.relationships}
        `;

        // Send the quiz data to the /rank endpoint for ranking
        $http.post('http://localhost:3000/rank', { content: userContent })
            .then(function(response) {
                // Update quiz score based on the response
                $scope.quizScore = response.data.rank;

                // After getting the score, make quiz non-modifiable
                $scope.quizCompleted = true;

                // Change the button text to "Find Doctors"
                $scope.submitButtonText = "Find Doctors";

                // Disable further changes to the quiz form
                $scope.disableQuizFields();

                window.location.href = `../book_doctor/index.html?rank=${$scope.quizScore}`;
            })
            .catch(function(error) {
                console.error("Error submitting quiz:", error);
            });
    };

    // Function to disable all quiz fields after submission
    $scope.disableQuizFields = function() {
        // Disable input fields and select elements after quiz completion
        angular.element(document.querySelectorAll('input, select')).attr('disabled', 'disabled');
    };

}]);

// Controller for managing symptoms input
app.controller('SymptomController', ['$scope', function($scope) {
    // Function to add a new symptom input field
    $scope.addSymptom = function() {
        if ($scope.formData.symptoms.length < 5) {
            $scope.formData.symptoms.push({ value: '' });
        }
    };

    // Function to remove a symptom input field
    $scope.removeSymptom = function(index) {
        $scope.formData.symptoms.splice(index, 1);
    };
}]);
