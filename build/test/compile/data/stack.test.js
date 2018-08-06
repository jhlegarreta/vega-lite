"use strict";
/* tslint:disable:quotemark */
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var stack_1 = require("../../../src/compile/data/stack");
var util_1 = require("../../util");
function parse(model) {
    return stack_1.StackNode.makeFromEncoding(null, model).stack;
}
function assemble(model) {
    return stack_1.StackNode.makeFromEncoding(null, model).assemble();
}
describe('compile/data/stack', function () {
    describe('StackNode.makeFromEncoding', function () {
        it('should produce correct stack component for bar with color', function () {
            var model = util_1.parseUnitModelWithScale({
                mark: 'bar',
                encoding: {
                    x: { aggregate: 'sum', field: 'a', type: 'quantitative' },
                    y: { field: 'b', type: 'nominal' },
                    color: { field: 'c', type: 'ordinal' }
                }
            });
            chai_1.assert.deepEqual(parse(model), {
                dimensionFieldDef: { field: 'b', type: 'nominal' },
                facetby: [],
                stackField: 'sum_a',
                stackby: ['c'],
                sort: {
                    field: ['c'],
                    order: ['descending']
                },
                offset: 'zero',
                impute: false,
                as: ['sum_a_start', 'sum_a_end']
            });
        });
        it('should produce correct stack component with both start and end of the binned field for bar with color and binned y', function () {
            var model = util_1.parseUnitModelWithScale({
                mark: 'bar',
                encoding: {
                    x: { aggregate: 'sum', field: 'a', type: 'quantitative' },
                    y: { bin: true, field: 'b', type: 'quantitative' },
                    color: { field: 'c', type: 'ordinal' }
                }
            });
            chai_1.assert.deepEqual(parse(model), {
                dimensionFieldDef: { bin: { maxbins: 10 }, field: 'b', type: 'quantitative' },
                facetby: [],
                stackField: 'sum_a',
                stackby: ['c'],
                sort: {
                    field: ['c'],
                    order: ['descending']
                },
                offset: 'zero',
                impute: false,
                as: ['sum_a_start', 'sum_a_end']
            });
        });
        it('should produce correct stack component for 1D bar with color', function () {
            var model = util_1.parseUnitModelWithScale({
                mark: 'bar',
                encoding: {
                    x: { aggregate: 'sum', field: 'a', type: 'quantitative' },
                    color: { field: 'c', type: 'ordinal' }
                }
            });
            chai_1.assert.deepEqual(parse(model), {
                dimensionFieldDef: undefined,
                facetby: [],
                stackField: 'sum_a',
                stackby: ['c'],
                sort: {
                    field: ['c'],
                    order: ['descending']
                },
                offset: 'zero',
                impute: false,
                as: ['sum_a_start', 'sum_a_end']
            });
            chai_1.assert.deepEqual(assemble(model), [
                {
                    type: 'stack',
                    groupby: [],
                    field: 'sum_a',
                    sort: {
                        field: ['c'],
                        order: ['descending']
                    },
                    as: ['sum_a_start', 'sum_a_end'],
                    offset: 'zero'
                }
            ]);
        });
        it('should produce correct stack component for area with color and order', function () {
            var model = util_1.parseUnitModelWithScale({
                mark: 'area',
                encoding: {
                    x: { aggregate: 'sum', field: 'a', type: 'quantitative' },
                    y: { field: 'b', type: 'nominal' },
                    color: { field: 'c', type: 'nominal' },
                    order: { aggregate: 'mean', field: 'd', type: 'quantitative' }
                }
            });
            chai_1.assert.deepEqual(parse(model), {
                dimensionFieldDef: { field: 'b', type: 'nominal' },
                facetby: [],
                stackField: 'sum_a',
                stackby: ['c'],
                sort: {
                    field: ['mean_d'],
                    order: ['ascending']
                },
                offset: 'zero',
                impute: true,
                as: ['sum_a_start', 'sum_a_end']
            });
            chai_1.assert.deepEqual(assemble(model), [
                {
                    type: 'impute',
                    field: 'sum_a',
                    groupby: ['c'],
                    key: 'b',
                    method: 'value',
                    value: 0
                },
                {
                    type: 'stack',
                    groupby: ['b'],
                    field: 'sum_a',
                    sort: {
                        field: ['mean_d'],
                        order: ['ascending']
                    },
                    as: ['sum_a_start', 'sum_a_end'],
                    offset: 'zero'
                }
            ]);
        });
        it('should produce correct stack component for area with color and binned dimension', function () {
            var model = util_1.parseUnitModelWithScale({
                mark: 'area',
                encoding: {
                    x: { aggregate: 'sum', field: 'a', type: 'quantitative' },
                    y: { bin: true, field: 'b', type: 'quantitative' },
                    color: { field: 'c', type: 'nominal' }
                }
            });
            chai_1.assert.deepEqual(parse(model), {
                dimensionFieldDef: { bin: { maxbins: 10 }, field: 'b', type: 'quantitative' },
                facetby: [],
                stackField: 'sum_a',
                stackby: ['c'],
                sort: {
                    field: ['c'],
                    order: ['descending']
                },
                offset: 'zero',
                impute: true,
                as: ['sum_a_start', 'sum_a_end']
            });
            chai_1.assert.deepEqual(assemble(model), [
                {
                    type: 'formula',
                    expr: '(datum["bin_maxbins_10_b"]+datum["bin_maxbins_10_b_end"])/2',
                    as: 'bin_maxbins_10_b_mid'
                },
                {
                    type: 'impute',
                    field: 'sum_a',
                    groupby: ['c'],
                    key: 'bin_maxbins_10_b_mid',
                    method: 'value',
                    value: 0
                },
                {
                    type: 'stack',
                    groupby: ['bin_maxbins_10_b_mid'],
                    field: 'sum_a',
                    sort: {
                        field: ['c'],
                        order: ['descending']
                    },
                    as: ['sum_a_start', 'sum_a_end'],
                    offset: 'zero'
                }
            ]);
        });
    });
    describe('StackNode.makeFromTransform', function () {
        it('should fill in offset and sort properly', function () {
            var transform = {
                stack: 'people',
                groupby: ['age'],
                as: ['v1', 'v2']
            };
            var stack = stack_1.StackNode.makeFromTransform(null, transform);
            chai_1.assert.deepEqual(stack.assemble(), [
                {
                    type: 'stack',
                    groupby: ['age'],
                    field: 'people',
                    offset: 'zero',
                    sort: { field: [], order: [] },
                    as: ['v1', 'v2']
                }
            ]);
        });
        it('should fill in partial "as" field properly', function () {
            var transform = {
                stack: 'people',
                groupby: ['age', 'gender'],
                offset: 'normalize',
                as: 'val'
            };
            var stack = stack_1.StackNode.makeFromTransform(null, transform);
            chai_1.assert.deepEqual(stack.assemble(), [
                {
                    type: 'stack',
                    groupby: ['age', 'gender'],
                    field: 'people',
                    offset: 'normalize',
                    sort: { field: [], order: [] },
                    as: ['val', 'val_end']
                }
            ]);
        });
        it('should handle complete "sort"', function () {
            var transform = {
                stack: 'people',
                groupby: ['age', 'gender'],
                offset: 'normalize',
                sort: [{ field: 'height', order: 'ascending' }, { field: 'weight', order: 'descending' }],
                as: 'val'
            };
            var stack = stack_1.StackNode.makeFromTransform(null, transform);
            chai_1.assert.deepEqual(stack.assemble(), [
                {
                    type: 'stack',
                    groupby: ['age', 'gender'],
                    field: 'people',
                    offset: 'normalize',
                    sort: { field: ['height', 'weight'], order: ['ascending', 'descending'] },
                    as: ['val', 'val_end']
                }
            ]);
        });
        it('should handle incomplete "sort" field', function () {
            var transform = {
                stack: 'people',
                groupby: ['age', 'gender'],
                offset: 'normalize',
                sort: [{ field: 'height' }],
                as: 'val'
            };
            var stack = stack_1.StackNode.makeFromTransform(null, transform);
            chai_1.assert.deepEqual(stack.assemble(), [
                {
                    type: 'stack',
                    groupby: ['age', 'gender'],
                    field: 'people',
                    offset: 'normalize',
                    sort: { field: ['height'], order: ['ascending'] },
                    as: ['val', 'val_end']
                }
            ]);
        });
    });
    describe('StackNode.producedFields', function () {
        it('should give producedfields correctly', function () {
            var transform = {
                stack: 'people',
                groupby: ['age'],
                as: 'people'
            };
            var stack = stack_1.StackNode.makeFromTransform(null, transform);
            chai_1.assert.deepEqual(stack.producedFields(), {
                people: true,
                people_end: true
            });
        });
        it('should give producedFields correctly when in encoding channel', function () {
            var model = util_1.parseUnitModelWithScale({
                mark: 'bar',
                encoding: {
                    x: { aggregate: 'sum', field: 'a', type: 'quantitative' },
                    y: { field: 'b', type: 'nominal' },
                    color: { field: 'c', type: 'ordinal' }
                }
            });
            var stack = stack_1.StackNode.makeFromEncoding(null, model);
            chai_1.assert.deepEqual(stack.producedFields(), {
                sum_a_start: true,
                sum_a_end: true
            });
        });
        it('should generate the correct hash', function () {
            var model = util_1.parseUnitModelWithScale({
                mark: 'bar',
                encoding: {
                    x: { aggregate: 'sum', field: 'a', type: 'quantitative' },
                    y: { field: 'b', type: 'nominal' },
                    color: { field: 'c', type: 'ordinal' }
                }
            });
            var stack = stack_1.StackNode.makeFromEncoding(null, model);
            chai_1.assert.deepEqual(stack.hash(), 'Stack -2072318240');
        });
    });
});
//# sourceMappingURL=stack.test.js.map