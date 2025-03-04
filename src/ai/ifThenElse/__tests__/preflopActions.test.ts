import { preflopAction } from '../preflopActions';
import { rangeChart } from '../../ranges';
import { PreflopPhase } from '../../../state';
import { HighCardRank } from '../../../rank';
import { getBetThreshold } from '../../ranges';

describe('preflopAction', () => {
    // Helper function to create a basic state object
    const createMockState = (hand: Card[], toCall: number = 0, xBet: number = 1): State => ({
        phase: PreflopPhase,
        phasePip: 0,
        handRank: HighCardRank,
        hand,
        board: [],
        handPlusBoard: hand,
        bigBlind: 2,
        stack: 100,
        pot: 0,
        prevPhasePot: 0,
        toCall,
        activePlayerPhasePips: new Map(),
        phaseXBet: [
            {xBet, aggressor: null},
            {xBet: 0, aggressor: null},
            {xBet: 0, aggressor: null},
            {xBet: 0, aggressor: null}
        ],
        allPlayersIn: [],
        dealerSeat: 1,
        mySeat: 2,
        whoseTurn: 2,
        isHandOver: false
    });

    // Test case 1: Premium hand (AA) should raise
    test('should raise with premium hands', () => {
        const hand: Card[] = [
            { suit: 'h', value: { name: 'A', code: 14 } },
            { suit: 'd', value: { name: 'A', code: 14 } }
        ];
        const state = createMockState(hand);
        const action = preflopAction(state);
        expect(action.type).toBe('raise');
        expect(action.raiseAmount).toBeDefined();
    });

    // Test case 2: Weak hand (72o) should check/fold
    test('should check/fold with weak hands', () => {
        const hand: Card[] = [
            { suit: 'h', value: { name: '7', code: 7 } },
            { suit: 'd', value: { name: '2', code: 2 } }
        ];
        const state = createMockState(hand);
        const action = preflopAction(state);
        expect(action.type).toBe('check_or_fold');
    });

    // Test case 3: Medium strength hand (AKo) facing a raise
    test('should call with strong hands when facing a raise', () => {
        const hand: Card[] = [
            { suit: 'h', value: { name: 'A', code: 14 } },
            { suit: 'd', value: { name: 'K', code: 13 } }
        ];
        console.log('AK threshold:', getBetThreshold(rangeChart, hand));
        const state = createMockState(hand, 10, 1); // Facing a bet of 10
        const action = preflopAction(state);
        expect(action.type).toBe('call');
    });

    // Test case 4: Medium strength hand (TT) with no action should raise
    test('should raise with medium pairs when no previous action', () => {
        const hand: Card[] = [
            { suit: 'h', value: { name: '10', code: 10 } },
            { suit: 'd', value: { name: '10', code: 10 } }
        ];
        const state = createMockState(hand);
        const action = preflopAction(state);
        expect(action.type).toBe('raise');
        expect(action.raiseAmount).toBeDefined();
    });

    // Test case 5: Weak hand facing a raise should fold
    test('should fold weak hands when facing a raise', () => {
        const hand: Card[] = [
            { suit: 'h', value: { name: '8', code: 8 } },
            { suit: 'd', value: { name: '4', code: 4 } }
        ];
        const state = createMockState(hand, 10, 1);
        const action = preflopAction(state);
        expect(action.type).toBe('check_or_fold');
    });
}); 