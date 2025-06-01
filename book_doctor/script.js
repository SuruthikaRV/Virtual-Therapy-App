angular.module('doctorApp', [])
    .controller('DoctorController', ['$scope', '$http', '$location', function($scope, $http, $location) {
        $scope.doctors = [];
        $scope.userRank = 0; // Initialize userRank

        // Get user rank from URL parameters (if available)
        const urlParams = new URLSearchParams(window.location.search);
        const rankParam = urlParams.get('rank');
        if (rankParam) {
            $scope.userRank = parseInt(rankParam);
        }

        $http.get('http://localhost:3000/doctors') 
            .then(function(response) {
                $scope.doctors = response.data;
            });

        $scope.checkAvailability = function(doctor) {
            if (doctor.Rank === $scope.userRank) {
                doctor.showAvailabilityStatus = true;
                doctor.isAvailable = Math.random() < 0.5; // Simulate availability
                doctor.availabilityStatus = doctor.isAvailable ? 'Available' : 'Unavailable';
                doctor.showBookButton = doctor.isAvailable;
            }
        };

        $scope.bookNow = function(doctor) {
            // Redirect to the booking module with the doctor details as query parameters
            const queryParams = new URLSearchParams({
                name: doctor.Name,
                specialization: doctor.Specialization,
                location: doctor.Location,
                phone: doctor.Phone,
                email: doctor.Email,
                availability1: doctor['Availability-1'],
                availability2: doctor['Availability-2'],
                chargePerHour: doctor['Charge per Hour'],
                rank: doctor.Rank
            });
            window.location.href = `../doctor_consult/index.html?${queryParams.toString()}`;
        };        
    }]);