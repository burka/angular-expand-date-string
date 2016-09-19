'use strict';

describe('dateString', function() {
  var $rootScope = null;
  var $compile = null;
  var element = null;
  var form = null;
  var $document = null;

  beforeEach(module('dateString'));

  beforeEach(inject(function(_$rootScope_, _$compile_, _$document_) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $document = _$document_;
    form = $compile('<form ng-name="testForm"><input name="testInput" ng-model="inputValue" date-string></input></form>')($rootScope);
    element = form.find('input');
    var body = $document.find('body');
    body.append(element);
    $rootScope.$digest();
  }));

  describe('should add dots', function() {
    test('', '12', 2, '12.', 3, false);
    test('', '1234', 4, '12.34.', 6, false);
    test('', '12.34', 5, '12.34.', 6, false);
    test('', '12345', 5, '12.34.5', 7, false);
  });
  describe('should work without data', function() {
    test('', '', 0, '', 0, true);
  });
  describe('should save position if in between', function() {
    test('', '12.12.00', 3, '12.12.2000', 3, true);
  });
  describe('should fill month and day with zero if dot is added', function() {
    test('', '1.', 2, '01.', 3, false);
    test('', '1.1', 3, '01.1', 4, false);
    test('', '1.1.', 4, '01.01.', 6, false);
  });
  describe('should complete the year', function() {
    test('', '1.1.99', 6, '01.01.1999', 10, true);
    test('', '11.11.99', 8, '11.11.1999', 10, true);
    test('', '11.11.12', 5, '11.11.2012', 5, true);
    test('', '11.11.19', 5, '11.11.19', 5, false);
  });
  describe('should allow 6-digit-entry', function() {
    test('', '111111', 6, '11.11.2011', 10, true);

  });
  describe('should find the right cursor position during deletion', function() {
    test('', '11', 2, '11.', 3, false);
    test('', '123.', 3, '12.3', 4, false);
    test('', '12.3.', 5, '12.03.', 6, false);
    test('', '12.3', 4, '12.3', 4, false);
    test('', '12.34', 5, '12.34.', 6, false);
    test('', '0.', 1, '0', 1, false);
  });

  describe('should ignore double dots due to cursor placement', function() {
    test('', '12..', 3, '12.', 3, false);
    test('', '12..', 4, '12.', 3, false);
  });
  describe('should allow deletion by backspace', function() {
    test('12.34.', '12.34', 5, '12.34.', 5, false);
  });
  describe('Failing tests if edited within', function() {
    test('12.12.2012', '12.2.2012', 3, '12.2.2012', 3, false);
    test('12.12.2012', '2.12.2012', 3, '2.12.2012', 3, false);
    test('12.12.2012', '12.12.212', 3, '12.12.212', 3, false);
  });


  function test(prevVal, input, pos, output, posAfter, expectedToBeValid) {
    var description = 'test(\'' + prevVal + '\', \'' + input + '\', ' + pos + ', \'' + output + '\', ' + posAfter + '); ->';
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
    });
  }

  function input(chars, element) {
    var e = angular.element.Event('keydown');
    e.which = keyCode;
    element.trigger(e);
    $rootScope.$digest();
  }
});