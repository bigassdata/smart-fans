'use strict';

let assert = require('chai').assert;
let expect = require('chai').expect;

const getPaths = require('./getPaths');

describe('getPaths function', () => {
    it('Returns all simple paths', () => {
        let obj = { a: 1, b: '2', c: true };
        expect(getPaths(obj)).to.deep.equal(
            [
                ['a'],
                ['b'],
                ['c']
            ]
        )
    });

    it('Returns paths with null', () => {
        let obj = { a: 1, b: '2', c: null };
        expect(getPaths(obj)).to.deep.equal(
            [
                ['a'],
                ['b'],
                ['c']
            ]
        )
    });

    it('Ignores paths with empty objects', () => {
        let obj = { a: 1, b: '2', c: null, d: {} };
        expect(getPaths(obj)).to.deep.equal(
            [
                ['a'],
                ['b'],
                ['c']
            ]
        )
    });

    it('Handles nested paths', () => {
        let obj = { a: { b: { c: 1 } }, d: { e: { f: 2 } } };
        expect(getPaths(obj)).to.deep.equal(
            [
                ['a', 'b', 'c'],
                ['d', 'e', 'f'],
            ]
        )
    });



});