(function(angular) {
	'use strict';
	angular.module('dateString', []);

	angular.module('dateString').directive('dateString', dateStringDirective);

	var DATE_REGEXP = /^([0-3][0-9])\.([01][0-9])\.((19|20)[0-9]{2})$/;
	var YEAR_START_REGEXP = /^(19|20)$/;
	var ENDS_WITH_DOT_REGEXP = /\.$/;
	var ENDS_WITH_TWO_DOTS_REGEXP = /\.\.$/;
	dateStringDirective.$inject = [];

	/* @ngInject */
	function dateStringDirective() {
		var directive = {
			link: link,
			restrict: 'A',
			require: 'ngModel'
		};
		return directive;

		function removeLastDot(input) {
			return input.replace(/\.$/, '');
		}

		function removeDotsAndPrependZeroes(input, cursorWithin) {
			var parts = input.split('.');
			if (!cursorWithin)
				return parts.join('');

			if (parts.length > 1) {
				if (parts[0].length === 1)
					parts[0] = '0' + parts[0];
			}
			if (parts.length > 2) {
				if (parts[1].length === 1)
					parts[1] = '0' + parts[1];
			}
			return parts.join('');
		}

		function expandYear(yearString) {
			var year = parseInt(yearString);
			if (yearString.length === 2 && year !== 20 && year !== 19) {
				if (year > 49) {
					year += 1900;
				}
				else {
					year += 2000;
				}
			}
			return year;
		}

		function addDotsAndFullYear(input, cursorWithin) {
			input = removeDotsAndPrependZeroes(input, cursorWithin);

			var length = input.length;
			var result = input.substring(0, 2);
			if (length >= 2)
				result += '.' + input.substring(2, 4);
			if (length >= 4)
				result += '.';
			if (length > 4) {
				var yearString = input.substring(4);
				var year = expandYear(yearString);
				result += year;
			}

			return result;
		}

		function link(scope, element, attrs, modelCtrl) {
			var el = element[0];
			var lastValue = '';

			modelCtrl.$parsers.push(dateParser);
			modelCtrl.$validators.dateString =
				function dateStringValidator(modelValue, viewValue) {
					if (modelCtrl.$isEmpty(modelValue)) {
						return true;
					}
					return DATE_REGEXP.test(modelValue);
				};

			function getPosition() {
				return el.selectionStart;
			}

			function calcNewPosition(oldPosition, inputValue, oldViewValue, transformedValue) {
				var origHasTwoDotsAtEnd = ENDS_WITH_TWO_DOTS_REGEXP.test(inputValue);
				var transformedHasSingleDotAtEnd = ENDS_WITH_DOT_REGEXP.test(transformedValue) && !origHasTwoDotsAtEnd;
				var cursorAtEnd = oldPosition >= inputValue.length;
				var cursorBeforeLastSingleDot = transformedHasSingleDotAtEnd && ((oldPosition + 1) === inputValue.length);
				var wasDeletionAtEnd = oldViewValue.substring(0, oldViewValue.length - 1) === inputValue;

				if (wasDeletionAtEnd && cursorAtEnd && transformedHasSingleDotAtEnd) {
					return transformedValue.length - 1;
				}

				if (cursorAtEnd || cursorBeforeLastSingleDot) {
					return transformedValue.length;
				}

				return oldPosition;
			}


			function dateParser(inputValue) {

				if (modelCtrl.$isEmpty(inputValue)) {
					lastValue = '';
					return inputValue;
				}

				inputValue = inputValue.replace(/\.\.$/, '.');
				var originalCursorPosition = getPosition();
				
				var cursorNotAtEnd = ((originalCursorPosition) < inputValue.length);
				if (cursorNotAtEnd) {
					inputValue = removeLastDot(inputValue);
				}
				var transformedInput = inputValue;
					transformedInput = addDotsAndFullYear(inputValue, !cursorNotAtEnd);
				
				if (modelCtrl.$viewValue !== transformedInput) {
					var position = calcNewPosition(originalCursorPosition, inputValue, lastValue,
						transformedInput);

					modelCtrl.$setViewValue(transformedInput);
					modelCtrl.$render();
					el.setSelectionRange(position, position);

				}
				lastValue = transformedInput;
				return transformedInput;
			}
		}
	}
})(window.angular);
