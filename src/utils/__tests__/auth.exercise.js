import cases from 'jest-in-case'

// Testing Pure Functions

// 🐨 import the function that we're testing
import {isPasswordAllowed} from '../auth'

// 🐨 write tests for valid and invalid passwords
// 💰 here are some you can use:
//
// valid:
// - !aBc123
//
// invalid:
// - a2c! // too short
// - 123456! // no alphabet characters
// - ABCdef! // no numbers
// - abc123! // no uppercase letters
// - ABC123! // no lowercase letters
// - ABCdef123 // no non-alphanumeric characters

describe('isPasswordAllowed', () => {
    test('return true for valid password', () => {
        expect(isPasswordAllowed('!aBc123')).toBeTruthy();
    })

    cases('return false for invalid password', (opt) => {
        expect(isPasswordAllowed(opt.password)).toBeFalsy();
    }, {
        'too short': {
            password: '!aBc'
        },
        'no number': {
            password: '!aBcsdf'
        },
        'no alpha numeric letters': {
            password: '1aBcsdf'
        },
        'no uppercase': {
            password: '1abcsdf!'
        },
        'no lowercase': {
            password: '1ABCSDF!'
        }
    })
})