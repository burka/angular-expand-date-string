(function () {
    'use strict';
    angular.module('expandDateString', []);

    angular.module('expandDateString').directive('expandDateString', expandDateStringDirective);

    var DATE_REGEXP = /^([0-3][0-9])\.([01][0-9])\.((19|20)[0-9]{2})$/;
    var YEAR_START_REGEXP = /^(19|20)$/;
    var ENDS_WITH_DOT_REGEXP = /\.$/;
    var ENDS_WITH_TWO_DOTS_REGEXP = /\.\.$/;
    expandDateStringDirective.$inject = ['$timeout'];

    /* @ngInject */
    function expandDateStringDirective($timeout) {
        var directive = {
            link: link,
            restrict: 'A',
            require: 'ngModel'
        };
        return directive;

        function expandYear(yearString) {
            if (!yearString)
                return yearString;
            var year = parseInt(yearString);
            if (yearString.length === 2 && year !== 20 && year !== 19) {
                if (year > 49) {
                    year += 1900;
                }
                else {
                    year += 2000;
                }
            }
            return year.toString().substring(0, 4);
        }

        function addDotsAndFullYear(input) {
            var dots = (input.match(/\./g) || []).length;
            input = input.replace(/\.+$/, '.');
            var parts = input.split('.');

            if (parts.length == 1) {
                parts = [];
                var days = input.substring(0, 2);
                parts.push(days);

                var months = input.substring(2, 4);
                if (months) {
                    parts.push(months);
                }

                var yearString = input.substring(4);
                if (yearString) {
                    parts.push(yearString);
                }
            }
            if (parts.length > 1 && dots >= 1) {
                if (parts[0].length === 1)
                    parts[0] = '0' + parts[0];
            }
            if (parts.length > 2 && dots >= 2) {
                if (parts[1].length === 1)
                    parts[1] = '0' + parts[1];
            }
            if (parts.length >= 3) {
                parts[2] = expandYear(parts[2]);
            }

            var output = parts.join('.');

            if ((output.length == 2 || output.length == 5))
                output += '.';

            return output;
        }

        function link(scope, element, attrs, modelCtrl) {
            var el = element[0];
            var lastValue = '';

            modelCtrl.$parsers.unshift(dateParser);
            modelCtrl.$validators.expandDateString = dateStringValidator;
            element.on('blur', transformElementValue);

            function dateStringValidator(modelValue, viewValue) {
                if (modelCtrl.$isEmpty(viewValue))
                    return true;
                if (!DATE_REGEXP.test(viewValue))
                    return false;

                var parts = viewValue.split('.');
                var day = parseInt(parts[0]);
                var month = (parseInt(parts[1]) - 1);
                var year = parseInt(parts[2]);
                var date = new Date(year, month, day);
                return date.getDate() === day
                    && date.getMonth() === month
                    && date.getFullYear() === year;
            };

            function isCursorBeforeEnd(inputValue) {
                return el.selectionStart < inputValue.length;
            }

            function dateParser(inputValue) {
                if (modelCtrl.$isEmpty(inputValue)) {
                    lastValue = '';
                    return inputValue;
                }

                var wasDeletionAtEnd = lastValue.substring(0, lastValue.length - 1) === inputValue;
                if (isCursorBeforeEnd(inputValue) || wasDeletionAtEnd) {
                    lastValue = inputValue;
                    return inputValue;
                }

                return transformInput(inputValue);
            }

            function eatAllNonRelevantCharacters(input) {
                return input.replace(/[^0-9,\.]/g, '');
            }

            function transformInput(inputValue) {
                inputValue = eatAllNonRelevantCharacters(inputValue);
                var transformedInput = addDotsAndFullYear(inputValue);
                if (modelCtrl.$viewValue !== transformedInput) {
                    var position = transformedInput.length;

                    modelCtrl.$setViewValue(transformedInput);
                    modelCtrl.$render();
                    $timeout(function setSelectionRange() {
                        el.setSelectionRange(position, position);
                    });
                }
                lastValue = transformedInput;
                return transformedInput;
            }

            function transformElementValue(event) {
                transformInput(element.val());
            }
        }
    }
})();
