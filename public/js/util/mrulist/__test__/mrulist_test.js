import expect from 'expect';

import MRUList, { create, add } from '../';

describe('MRU List', function () {
  describe('primitives', function() {
    it('create() should return empty list', function () {
        expect(create()).toEqual([]);
    });
    it('add() should add a term', function () {
        const list = create();
        expect(add(15, list, 'a')).toEqual(['a']);
    });
    it('add() should add term to front of list', function () {
            const list = ['a'];
            expect(add(15, list, 'b')).toEqual(['b', 'a']);
    });
    it('add() should not add duplicate term', function () {
            const list = ['a', 'b', 'c'];
            expect(add(15, list, 'b')).toEqual(['b', 'a', 'c']);
    });
    it('add() should clip list on max length', function () {
            const list = ['a', 'b', 'c', 'd'];
            expect(add(4, list, 'e')).toEqual(['e', 'a', 'b', 'c']);
    });
  });


  describe('class MRUList', function() {
    it('should give an empty list', function() {
        const list = new MRUList();
        expect(list.get()).toEqual([]);
    });
    it('should add a term', function() {
        const list = new MRUList().add('a');
        expect(list.get()).toEqual(['a']);
    });
    it('should add a second term', function() {
        const list = new MRUList(['b']).add('a');
        expect(list.get()).toEqual(['a', 'b']);
    });
    it('should not add a duplicate term', function() {
        const list = new MRUList(['b']).add('a').add('b');
        expect(list.get()).toEqual(['b', 'a']);
    });

    it('should have a max length', function() {
        const list = new MRUList([], 3).add('d').add('c').add('b').add('a');
        expect(list.get()).toEqual(['a', 'b', 'c']);
    });

  });

});

