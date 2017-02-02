'use strict';

describe('expand date string', function () {
    var $rootScope = null;
    var $compile = null;
    var $document = null;
    var element = null;
    var form = null;

    beforeEach(module('expandDateString'));
    beforeEach(inject(function (_$rootScope_, _$compile_, _$document_) {
        $rootScope = _$rootScope_;
        $compile = _$compile_;
        $document = _$document_;
        localStorage.lang = 'de-de';
    }));

    describe('with date model', function () {
        beforeEach(inject(function () {
            form = $compile('<form ng-name="testForm"><input type="date" name="testInput" ng-model="dateModel" expand-date-string novalidate required > </input></form>')($rootScope);
            element = form.find('input');
            // input positioning does not work without
            $document.find('body').append(form);
            $rootScope.$digest();
        }));

        it('should format string despite date model- IGNORED', function () {
            // But it doesn't work on a date input due to custom browser & language specific formatting...
            return;

            // angular.element(element).scope().dateModel = new Date();
            // $rootScope.$digest();
            // expect(element.val()).toEqual('30.12.1999');
            //
            // element.val('301299');
            // element[0].setSelectionRange(6, 6);
            // element.triggerHandler('input');
            // $rootScope.$digest();
            // element.triggerHandler('blur');
            // $rootScope.$digest();
            //
            // var dateModel = angular.element(element).scope().dateModel;
            // console.log('scope:', dateModel);
            //
            // expect(element.val()).toEqual('30.12.1999');
            // expect(form.controller('form').testInput.$error.date).toBeFalsy('Input should be valid');
            // expect(dateModel.getYear()).toEqual(1999);
        });
    });
    describe('with string model', function () {
        beforeEach(inject(function () {
            form = $compile('<form ng-name="testForm"><input type="text" name="testInput" ng-model="textModel" expand-date-string> </input></form>')($rootScope);
            element = form.find('input');
            // input positioning does not work without
            $document.find('body').append(form);
            $rootScope.$digest();
        }));

        describe('should add dots', function () {
            test('', '12', 2, '12.', 3, false);
            test('', '1234', 4, '12.34.', 6, false);
            test('', '12.34', 5, '12.34.', 6, false);
            test('', '12345', 5, '12.34.5', 7, false);
        });
        describe('should work without data', function () {
            test('', '', 0, '', 0, true);
        });
        describe('should fill month and day with zero if dot is added', function () {
            test('', '1.', 2, '01.', 3, false);
            test('', '1.1', 3, '01.1', 4, false);
            test('', '1.1.', 4, '01.01.', 6, false);
        });
        describe('should complete the year', function () {
            test('', '1.1.99', 6, '01.01.1999', 10, true);
            test('', '11.11.99', 8, '11.11.1999', 10, true);
            test('', '11.11.12', 8, '11.11.2012', 10, true);
            test('', '11.11.12', 8, '11.11.2012', 10, true);
            test('', '11.11.19', 5, '11.11.19', 5, false);
        });
        describe('should allow 6-digit-entry', function () {
            test('', '111111', 6, '11.11.2011', 10, true);

        });
        describe('should find the right cursor position during deletion', function () {
            test('', '11', 2, '11.', 3, false);
            test('', '123.', 3, '123.', 3, false);
            test('', '12.3.', 5, '12.03.', 6, false);
            test('', '12.3', 4, '12.3', 4, false);
            test('', '12.34', 5, '12.34.', 6, false);
            test('', '0.', 1, '0.', 1, false);
        });

        describe('should ignore double dots due to cursor placement', function () {
            test('', '12..', 3, '12..', 3, false);
            test('', '12..', 4, '12.', 3, false);
        });
        describe('should allow deletion by backspace', function () {
            test('12.34.', '12.34', 5, '12.34', 5, false);
        });
        describe('should allow edit numbers within', function () {
            test('12.12.2012', '12.2.2012', 3, '12.2.2012', 3, false);
            test('12.12.2012', '2.12.2012', 0, '2.12.2012', 0, false);
            test('12.12.2012', '12.12.212', 7, '12.12.212', 7, false);
        });
        describe('should allow edit separator within', function () {
            test('12.12.2012', '1212.2012', 3, '1212.2012', 3, false);
        });
        describe('should allow delete from beginning', function () {
            test('12.12.2012', '2.12.2012', 0, '2.12.2012', 0, false);
            test('2.12.2012', '.12.2012', 0, '.12.2012', 0, false);
            test('.12.2012', '12.2012', 0, '12.2012', 0, false);
            test('12.2012', '2.2012', 0, '2.2012', 0, false);
            test('2.2012', '.2012', 0, '.2012', 0, false);
            test('.2012', '2012', 0, '2012', 0, false);
            test('2012', '012', 0, '012', 0, false);
            test('012', '12', 0, '12', 0, false);
            test('12', '2', 0, '2', 0, false);
            test('2', '', 0, '', 0, true);
        });
        describe('should eat illegal characters on change', function () {
            test('Invalid Date', 'Invalid Date', 0, 'Invalid Date', 0, false);
            test('01.01.', '01.01.asd', 9, '01.01.', 6, false);
        });

        it('should format on blur', function () {
            element.val('1.01.2000');
            element[0].setSelectionRange(0, 0);
            element.triggerHandler('input');
            $rootScope.$digest();

            expect(element.val()).toEqual('1.01.2000');

            element.triggerHandler('blur');
            $rootScope.$digest();

            expect(element.val()).toEqual('01.01.2000');
        });


    });
    function test(prevVal, input, pos, output, posAfter, expectedToBeValid) {
        var description = 'test(\'' + prevVal + '\', \'' + input + '\', ' + pos + ', \'' + output + '\', ' + posAfter + ', ' + expectedToBeValid + '); -> ';
        it(description, function test() {
            element.val(prevVal);
            element.triggerHandler('input');
            $rootScope.$digest();

            element.val(input);
            element[0].setSelectionRange(pos, pos);
            element.triggerHandler('input');
            $rootScope.$digest();

            expect(element.val()).toEqual(output);
            expect(form.controller('form').$valid).toBe(expectedToBeValid, '$valid has wrong value');
            expect(element[0].selectionStart).toEqual(posAfter, 'Cursor position is wrong');
            expect(element[0].selectionEnd).toEqual(posAfter, 'Cursor position is wrong');
            var textModel = angular.element(element).scope().textModel;
            if (expectedToBeValid)
                expect(textModel).toEqual(output, 'Model value should be set if valid');
            else
                expect(textModel).toBeUndefined();
        });
    }

    function input(chars, element) {
        var e = angular.element.Event('keydown');
        e.which = keyCode;
        element.trigger(e);
        $rootScope.$digest();
    }
})
;