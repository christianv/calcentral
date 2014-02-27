(function(angular) {
  'use strict';

  /**
   * Academics controller
   */
  angular.module('calcentral.controllers').controller('AcademicsController', function(apiService, $http, $routeParams, $scope, $q) {

    apiService.util.setTitle('My Academics');

    var gradeOptions = [
      {
        grade: 'A+',
        weight: 4
      },
      {
        grade: 'A',
        weight: 4
      },
      {
        grade: 'A-',
        weight: 3.7
      },
      {
        grade: 'B+',
        weight: 3.3
      },
      {
        grade: 'B',
        weight: 3
      },
      {
        grade: 'B-',
        weight: 2.7
      },
      {
        grade: 'C+',
        weight: 2.3
      },
      {
        grade: 'C',
        weight: 2
      },
      {
        grade: 'C-',
        weight: 1.7
      },
      {
        grade: 'D+',
        weight: 1.3
      },
      {
        grade: 'D',
        weight: 1
      },
      {
        grade: 'D-',
        weight: 0.7
      },
      {
        grade: 'F',
        weight: 0
      }
    ];

    /**
     * We're putting the exams in buckets per date
     */
    var parseExamSchedule = function(examSchedule) {

      // Check input
      if (!examSchedule) {
        return;
      }

      var response = {};
      angular.forEach(examSchedule, function(element) {
        if (!response[element.date.epoch]) {
          response[element.date.epoch] = [];
        }
        response[element.date.epoch].push(element);
      });
      $scope.examSchedule = response;
      $scope.examScheduleLength = Object.keys(response).length;
    };

    var checkPageExists = function(page) {
      if (!page) {
        apiService.util.redirect('404');
        return false;
      } else {
        return true;
      }
    };

    var updatePrevNextSemester = function(semestersLists, selectedSemester) {
      var nextSemester = {};
      var nextSemesterCompare = false;
      var previousSemester = {};
      var previousSemesterCompare = false;
      var selectedSemesterCompare = selectedSemester.term_yr + selectedSemester.term_cd;
      angular.forEach(semestersLists, function(semesterList) {
        angular.forEach(semesterList, function(semester) {
          var cmp = semester.term_yr + semester.term_cd;
          if ((cmp < selectedSemesterCompare) && (!previousSemesterCompare || (cmp > previousSemesterCompare))) {
            previousSemesterCompare = cmp;
            previousSemester.slug = semester.slug;
          } else if ((cmp > selectedSemesterCompare) && (!nextSemesterCompare || (cmp < nextSemesterCompare))) {
            nextSemesterCompare = cmp;
            nextSemester.slug = semester.slug;
          }
        });
      });
      $scope.nextSemester = nextSemester;
      $scope.previousSemester = previousSemester;
      $scope.previousNextSemesterShow = (nextSemesterCompare || previousSemesterCompare);
    };

    var findSemester = function(semesters, slug, selectedSemester) {
      if (selectedSemester || !semesters) {
        return selectedSemester;
      }

      for (var i = 0; i < semesters.length; i++) {
        if (semesters[i].slug === slug) {
          return semesters[i];
        }
      }
    };

    var getClassesSections = function(courses, findWaitlisted) {
      var classes = [];

      for (var i = 0; i < courses.length; i++) {
        var course = angular.copy(courses[i]);
        var sections = [];
        for (var j = 0; j < course.sections.length; j++) {
          var section = course.sections[j];
          if ((findWaitlisted && section.waitlist_position) || (!findWaitlisted && !section.waitlist_position)) {
            sections.push(section);
          }
        }
        if (sections.length) {
          course.sections = sections;
          classes.push(course);
        }
      }

      return classes;
    };

    var getAllClasses = function(semesters) {
      var classes = [];
      for (var i = 0; i < semesters.length; i++) {
        for (var j = 0; j < semesters[i].classes.length; j++) {
          if (semesters[i].time_bucket !== 'future') {
            classes.push(semesters[i].classes[j]);
          }
        }
      }

      return classes;
    };

    var getPreviousClasses = function(semesters) {
      var classes = [];
      for (var i = 0; i < semesters.length; i++) {
        for (var j = 0; j < semesters[i].classes.length; j++) {
          if (semesters[i].time_bucket !== 'future' && semesters[i].time_bucket !== 'current') {
            classes.push(semesters[i].classes[j]);
          }
        }
      }

      return classes;
    };

    var findTeachingSemester = function(semesters, semester) {
      for (var i = 0; i < semesters.length; i++) {
        if (semester.slug === semesters[i].slug) {
          return true;
        }
      }
      return false;
    };

    var parseTeaching = function(teachingSemesters) {

      if (!teachingSemesters) {
        return {};
      }

      var teaching = {};
      for (var i = 0; i < teachingSemesters.length; i++) {
        var semester = teachingSemesters[i];
        for (var j = 0; j < semester.classes.length; j++) {
          var course = semester.classes[j];
          if (!teaching[course.slug]) {
            teaching[course.slug] = {
              course_number: course.course_number,
              title: course.title,
              slug: course.slug,
              semesters: []
            };
          }
          var semesterObject = {
            name: semester.name,
            slug: semester.slug
          };
          if (!findTeachingSemester(teaching[course.slug].semesters, semesterObject)) {
            teaching[course.slug].semesters.push(semesterObject);
          }
        }
      }
      return teaching;

    };

    var countSectionItem = function(selected_course, section_item) {
      var count = 0;
      for (var i = 0; i < selected_course.sections.length; i++) {
        if (selected_course.sections[i][section_item] && selected_course.sections[i][section_item].length) {
          count += selected_course.sections[i][section_item].length;
        }
      }
      return count;
    };

    var parseAcademics = function(data) {
      angular.extend($scope, data);

      $scope.semesters = data.semesters;

      $scope.all_courses = getAllClasses(data.semesters);
      $scope.previous_courses = getPreviousClasses(data.semesters);

      $scope.is_undergratuate = ($scope.college_and_level && $scope.college_and_level.standing === 'Undergraduate');

      $scope.teaching = parseTeaching(data.teaching_semesters);
      $scope.teaching_length = Object.keys($scope.teaching).length;

      // Get selected semester from URL params and extract data from semesters array
      var semester_slug = ($routeParams.semester_slug || $routeParams.teaching_semester_slug);
      if (semester_slug) {
        var is_instructor_gsi = !!$routeParams.teaching_semester_slug;
        var selected_student_semester = findSemester(data.semesters, semester_slug, selected_student_semester);
        var selected_teaching_semester = findSemester(data.teaching_semesters, semester_slug, selected_teaching_semester);
        var selectedSemester = (selected_student_semester || selected_teaching_semester);
        if (!checkPageExists(selectedSemester)) {
          return;
        }
        updatePrevNextSemester([data.semesters, data.teaching_semesters], selectedSemester);

        $scope.selectedSemester = selectedSemester;
        if (selected_student_semester) {
          $scope.selected_courses = selected_student_semester.classes;
          if (!is_instructor_gsi) {
            $scope.enrolled_courses = getClassesSections(selected_student_semester.classes, false);
            $scope.waitlisted_courses = getClassesSections(selected_student_semester.classes, true);
          }
        }
        $scope.selected_student_semester = selected_student_semester;
        $scope.is_instructor_gsi = is_instructor_gsi;
        $scope.selected_teaching_semester = selected_teaching_semester;

        // Get selected course from URL params and extract data from selected semester schedule
        if ($routeParams.class_slug) {
          var class_semester = selected_student_semester;
          if (is_instructor_gsi) {
            class_semester = selected_teaching_semester;
          }
          for (var i = 0; i< class_semester.classes.length; i++) {
            var course = class_semester.classes[i];
            if (course.slug === $routeParams.class_slug) {
              $scope.selected_course = course;
              break;
            }
          }
          if (!checkPageExists($scope.selected_course)) {
            return;
          }
          $scope.selected_course_count_instructors = countSectionItem($scope.selected_course, 'instructors');
          $scope.selected_course_count_schedules = countSectionItem($scope.selected_course, 'schedules');
        }
      }

      parseExamSchedule(data.exam_schedule);

      $scope.gpaInit(); // Initialize GPA calculator with selected courses

      $scope.telebears = data.telebears;

    };

    $scope.addTelebearsAppointment = function(phasesArray) {
      var phases = [];
      $scope.telebears_appointment_loading = 'Process';
      for (var i = 0; i < phasesArray.length; i++) {
        var payload = {
          'summary': phasesArray[i].period,
          'start': {
            'epoch': phasesArray[i].startTime.epoch
          },
          'end': {
            'epoch': phasesArray[i].endTime.epoch
          }
        };
        apiService.analytics.trackEvent(['Telebears', 'Add Appointment', 'Phase: ' + payload.summary]);
        phases.push($http.post('/api/my/event', payload));
      }
      $q.all(phases).then(function() {
        $scope.telebears_appointment_loading = 'Success';
      }, function() {
        $scope.telebears_appointment_loading = 'Error';
      });
    };

    $scope.hideDisclaimer = true;

    $scope.toggleBlockHistory = function() {
      $scope.show_block_history = !$scope.show_block_history;
      apiService.analytics.trackEvent(['Block history', 'Show history panel - ' + $scope.show_block_history ? 'Show' : 'Hide']);
    };

    $scope.gradeOptions = gradeOptions;

    var findWeight = function(grade) {
      var weight = gradeOptions.filter(function(element) {
        return element.grade === grade;
      });
      return weight[0];
    };

    var gpaCalculate = function() {
      // Recalculate GPA on every dropdown change.
      var total_units = 0;
      var total_score = 0;

      angular.forEach($scope.selected_courses, function(course) {
        // Don't calculate for pass/no-pass courses!
        if (course.grade_option === 'Letter' && course.units) {
          var grade;
          if (course.grade && findWeight(course.grade)) {
            grade = findWeight(course.grade).weight;
          } else {
            grade = course.estimated_grade;
          }
          course.score = parseFloat(grade, 10) * course.units;
          total_units += parseFloat(course.units, 10);
          total_score += course.score;
        }
      });
      $scope.estimated_gpa = total_score / total_units;
    };

    $scope.gpaUpdateCourse = function(course, estimated_grade) {
      // Update course object on scope and recalculate overall GPA
      course.estimated_grade = estimated_grade;
      gpaCalculate();
      cumulativeGpaCalculate($scope.all_courses, 'estimated');
    };

    $scope.gpaInit = function() {
      // On page load, set default values and calculate starter GPA
      angular.forEach($scope.selected_courses, function(course) {
        course.estimated_grade = 4;
      });
      gpaCalculate();
      cumulativeGpaCalculate($scope.previous_courses, 'current');
      cumulativeGpaCalculate($scope.all_courses, 'estimated');
    };

    var cumulativeGpaCalculate = function(courses, gpa_type) {
      // Recalculate GPA on every dropdown change.
      var total_units = 0;
      var total_score = 0;
      angular.forEach(courses, function(course) {
        // Don't calculate for pass/no-pass courses!
        if (course.grade_option === 'Letter' && course.units) {
          var grade;
          if (course.grade && findWeight(course.grade)) {
            grade = findWeight(course.grade).weight;
          } else {
            if (gpa_type === 'estimated') {
              grade = course.estimated_grade;
            }
          }
          if (grade || grade === 0) {
            course.score = parseFloat(grade, 10) * course.units;
            total_units += parseFloat(course.units, 10);
            total_score += course.score;
          }
        }
      });
      if (gpa_type === 'estimated') {
        $scope.estimated_cumulative_gpa = total_score / total_units;
      }
      else {
        $scope.current_cumulative_gpa = total_score / total_units;
      }
    };

    // Wait until user profile is fully loaded before hitting academics data
    $scope.$on('calcentral.api.user.isAuthenticated', function(event, isAuthenticated) {
      if (isAuthenticated) {
        $scope.can_view_academics = $scope.api.user.profile.student_info.has_academics_tab;
        $http.get('/api/my/academics').success(parseAcademics);
        //$http.get('/dummy/json/academics.json').success(parseAcademics);
      }
    });

  });
})(window.angular);
