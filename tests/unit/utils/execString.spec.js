import { execString } from '@/utils/contextExec'

/* Executes an expression and returns boolean */
describe('execString', () => {
    it('returns the evaluated expression as string', () => {
        const expression = 'typeof 1'
        const res = execString(expression)
        expect(res).toEqual('number')
    })

    it('returns the evaluated expression as string with context applied', () => {
        const expression = 'typeof value'
        const context = { value: 1 }
        const res = execString(expression, context)
        expect(res).toEqual('number')
    })

    it('fails with an error', () => {
        const consoleSpy = jest.spyOn(console, 'error')
        const context = 'test'
        const expression = 'method(value)'
        execString(expression, context)
        expect(consoleSpy).toHaveBeenCalledTimes(3)
        const message1 = consoleSpy.mock.calls[0][0]
        const message2 = consoleSpy.mock.calls[1][0]
        const message3 = consoleSpy.mock.calls[2][0]
        expect(global.removeLineBreaksAndSpaces(message1)).toEqual('with(this){return String(method(value))}')
        expect(message2 instanceof Error).toEqual(true)
        expect(message3).toEqual(context)
    })

    it('returns the expression when there is an error and the printOnError flag is set', () => {
        const context = 'test'
        const expression = 'method(value)'
        const res = execString(expression, context, true)
        expect(res).toEqual(expression)
    })
})
