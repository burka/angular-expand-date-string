(function(angular) {
	'use strict';

	angular.module('dateInput').directive('dateInput', dateInput);

	var DATE_REGEXP = /^([0-3][0-9])\.([01][0-9])\.((19|20)[0-9]{2})$/;
	var YEAR_START_REGEXP = /^(19|20)$/;
	var ENDS_WITH_DOT_REGEXP = /\.$/;
	dateInput.$inject = [];

	/* @ngInject */
	function dateInput() {
		var directive = {
			link : link,
			restrict : 'A',
			require : 'ngModel'
		};
		return directive;
		function removeLastDot(input) {
			return input.replace(/\.$/, '');
		}
		function removeDotsAndPrependZeroes(input, expand) {
			var parts = input.split('.');
			if(!expand)
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
				} else {
					year += 2000;
				}
			}
			return year;
		}
		function addDotsAndFullYear(input, expand) {
			if (!angular.isString(input))
				return null;
			input = removeDotsAndPrependZeroes(input, expand);

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

			modelCtrl.$parsers.push(dateParser);
			modelCtrl.$validators.ehDate = function dateValidator(modelValue,
					viewValue) {
				if (modelCtrl.$isEmpty(modelValue)) {
					return true;
				}
				return DATE_REGEXP.test(modelValue);
			};

			function getPosition() {
				return el.selectionStart;
			}
			function calcNewPosition(oldPosition, inputValue, transformedValue) {
				if (inputValue.length === transformedValue.length)
					return oldPosition;

				var origHasDotAtEnd = ENDS_WITH_DOT_REGEXP.test(inputValue);
				var transformedHasDotAtEnd = ENDS_WITH_DOT_REGEXP.test(transformedValue);

				var cursorBeforeLastSingleDot = ((oldPosition + 1) === inputValue.length);
				if (cursorBeforeLastSingleDot && transformedHasDotAtEnd)
					return transformedValue.length - 1;

				var cursorAtEnd = oldPosition === inputValue.length;
				var origHasDotAtEnd = ENDS_WITH_DOT_REGEXP.test(inputValue);
				var transformedHasDotAtEnd = ENDS_WITH_DOT_REGEXP.test(transformedValue);
				if (cursorAtEnd && (!origHasDotAtEnd && transformedHasDotAtEnd ))
					return transformedValue.length - 1;

				if (cursorAtEnd)
					return transformedValue.length;

				return oldPosition;
			}
			function setNewPosition(oldPosition, inputValue, transformedValue) {
				var position = calcNewPosition(oldPosition, inputValue,
						transformedValue);
				el.setSelectionRange(position, position);
			}

			function dateParser(inputValue) {
				if (modelCtrl.$isEmpty(inputValue)) {
					return inputValue;
				}
				inputValue = inputValue.replace(/\.\.$/,'.');
				var originalInput = inputValue;
				var originalCursorPosition = getPosition();

				var cursorBeforeLastSingleDot = ((originalCursorPosition ) < inputValue.length);
				if (cursorBeforeLastSingleDot) {
					inputValue = removeLastDot(inputValue);
				}

				var transformedInput = addDotsAndFullYear(inputValue, !cursorBeforeLastSingleDot);

				if (modelCtrl.$viewValue !== transformedInput) {

					modelCtrl.$setViewValue(transformedInput);
					modelCtrl.$render();

					setNewPosition(originalCursorPosition, originalInput,
							transformedInput);
				}
				return transformedInput;
			}
		}
	}
})(window.angular);
