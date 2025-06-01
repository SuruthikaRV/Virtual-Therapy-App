angular.module('consultApp', [])
    .controller('ConsultController', ['$scope', '$location', function($scope, $location) {
        $scope.doctor = {};

        // Get doctor details from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        $scope.doctor.name = urlParams.get('name');
        $scope.doctor.specialization = urlParams.get('specialization');
        $scope.doctor.location = urlParams.get('location');
        $scope.doctor.phone = urlParams.get('phone');
        $scope.doctor.email = urlParams.get('email');
        $scope.doctor.availability1 = urlParams.get('availability1');
        $scope.doctor.availability2 = urlParams.get('availability2');
        $scope.doctor.chargePerHour = urlParams.get('chargePerHour');

        // Function to submit form
        $scope.submitForm = function() {
            alert("Your information was saved on the site. Check your contact details for more information. Also carry the form when visiting the doctor.");
            generatePDF(); // Call the function to generate PDF
        };

        // Function to generate PDF with colors, fonts, and enhanced design
        function generatePDF() {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Virtuwell branding with color
            doc.setFont("Helvetica", "bold");
            doc.setFontSize(20);
            doc.setTextColor(30, 144, 255); // Blue color for the title
            doc.text("Virtuwell", 105, 20, { align: 'center' });

            doc.setFontSize(12);
            doc.setTextColor(50, 50, 50); // Grey for the subtitle
            doc.text("Better mental health, even online", 105, 28, { align: 'center' });

            // Add a light border for authenticity
            doc.setDrawColor(0, 0, 0); // Black color for borders
            doc.setLineWidth(0.5);
            doc.rect(15, 10, 180, 277); // Border around the whole page

            doc.setFontSize(16);
            doc.setFont("Helvetica", "bold");
            doc.setTextColor(0, 0, 0); // Black text
            doc.text("Doctor Details", 20, 48);

            doc.setFontSize(12);
            doc.setFont("Helvetica", "normal");
            doc.text(`Name: ${$scope.doctor.name}`, 20, 60);
            doc.text(`Specialization: ${$scope.doctor.specialization}`, 20, 70);
            doc.text(`Location: ${$scope.doctor.location}`, 20, 80);
            doc.text(`Phone: ${$scope.doctor.phone}`, 20, 90);
            doc.text(`Email: ${$scope.doctor.email}`, 20, 100);
            doc.text(`Availability: ${$scope.doctor.availability1} and ${$scope.doctor.availability2}`, 20, 110);
            doc.text(`Charge Per Hour: ${$scope.doctor.chargePerHour}`, 20, 120);

            // Section for User Details
            doc.setFontSize(16);
            doc.setFont("Helvetica", "bold");
            doc.text("User Details", 20, 138);

            doc.setFontSize(12);
            doc.setFont("Helvetica", "normal");
            doc.text(`Name: ${$scope.user.name}`, 20, 150);
            doc.text(`Email: ${$scope.user.email}`, 20, 160);
            doc.text(`Phone: ${$scope.user.phone}`, 20, 170);
            doc.text(`Preferred Visitation Date: ${$scope.user.date}`, 20, 180);
            doc.text(`Preferred Time: ${$scope.user.time}`, 20, 190);

            doc.setFontSize(10);
            doc.setFont("Helvetica", "italic");
            doc.text("Signed by Suruthika", 155, 260); // Placeholder for signature
            doc.setLineWidth(0.5);
            doc.line(150, 262, 190, 262); // Line for signature
            doc.text("Verified for Virtuwell", 155, 268);

            // Trigger PDF download
            doc.save('Appointment_Form.pdf');
        }
    }]);
