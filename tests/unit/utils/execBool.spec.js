import { execBool } from '@/utils/contextExec'

/* Executes an expression and returns boolean */
describe('execBool', () => {
    it('returns true when expression is truthy', () => {
        const expression = '1 === 1'
        const res = execBool(expression)
        expect(res).toEqual(true)
    })

    it('returns false when expression is falsy', () => {
        const expression = '1 === 2'
        const res = execBool(expression)
        expect(res).toEqual(false)
    })

    it('returns true when expression with context is truthy', () => {
        const context = { value: 1 }
        const expression = 'value === 1'
        const res = execBool(expression, context)
        expect(res).toEqual(true)
    })

    it('returns false when expression with context is falsy', () => {
        const context = { value: 2 }
        const expression = 'value === 1'
        const res = execBool(expression, context)
        expect(res).toEqual(false)
    })

    it('fails with an error', () => {
        const consoleSpy = jest.spyOn(console, 'error')
        const context = 'test'
        const expression = 'value === 1'
        execBool(expression, context)
        expect(consoleSpy).toHaveBeenCalledTimes(3)
        const message1 = consoleSpy.mock.calls[0][0]
        const message2 = consoleSpy.mock.calls[1][0]
        const message3 = consoleSpy.mock.calls[2][0]
        expect(global.removeLineBreaksAndSpaces(message1)).toEqual('with(this){return Boolean(value === 1)}')
        expect(message2 instanceof Error).toEqual(true)
        expect(message3).toEqual(context)
    })

    it('returns the expression when there is an error and the printOnError flag is set', () => {
        const context = 'test'
        const expression = 'value === 1'
        const res = execBool(expression, context, true)
        expect(res).toEqual(expression)
    })
})
