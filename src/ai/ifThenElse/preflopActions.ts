import { AceCode, JackCode, KingCode, QueenCode } from "../../cards";
import { getHighestCard, getLowestCard } from "../aiUtils";
import { lerp } from "../lerp";
import { checkCallBased, postfixNameToCall, probabilisticAction, toCallDependent, uniformFill } from "../probabilisticAction";
import { bestHandAction } from "./handActions";
import { customRaise } from "../../ui"; 
import { rangeChart, getBetThreshold } from "../ranges";
import { getTotalActivePlayers, getNumberCallers, getRelativePosition } from "./actionUtils";

function facingLimp(state: State): Action {
    const threshold = getBetThreshold(rangeChart, state.hand);
    const limpers = getNumberCallers(state);
    const position = getRelativePosition(state);

    const raiseAction: Action = {type: "raise", raiseAmount: (2+limpers)*state.bigBlind};
    const limpAction: Action = (state.toCall > 0) ? {type: "call"} : {type: "check_or_fold"};

    if (threshold >= 2) {
        return raiseAction; 
    }
    else {
        return limpAction; 
    }
}

function facing2Bet(state: State): Action {
    const threshold = getBetThreshold(rangeChart, state.hand);
    const position = getRelativePosition(state);

    const raiseAction: Action = {type: "raise", raiseAmount: Math.round((1-position/3)*(state.pot + state.toCall) + state.phasePip + state.toCall)};
    const callAction: Action = (state.toCall > 0) ? {type: "call"} : {type: "check_or_fold"};
    const foldAction: Action = {type: "check_or_fold"};
    const raiseMultiplierFaced = (state.toCall + state.phasePip)/state.bigBlind; 

    if (threshold > 2) {
        if (raiseMultiplierFaced <= 5) {
            return raiseAction;
        }
        else{
            const effXBet = Math.log(raiseMultiplierFaced)/Math.log(3) + 1;
            const effXBetInt = Math.round(effXBet); 
            if (threshold === 6){
                return raiseAction;
            }
            else{
                if (threshold < effXBetInt) {
                    return foldAction; 
                }
                else if (threshold === effXBetInt) {
                    return callAction;
                }
                else {
                    return raiseAction;
                }
            }  
        }
    }
    else if (threshold === 2) {
        const probabilityOfCall = 625/(raiseMultiplierFaced**4)
        return Math.random() < probabilityOfCall ? callAction : foldAction;
    }
    else {
        return foldAction;
    }
}

export function facing3Bet(state: State): Action {
    const threshold = getBetThreshold(rangeChart, state.hand);
    const position = getRelativePosition(state);

    const raiseAction: Action = {type: "raise", raiseAmount: Math.round((1-position/3)*(state.pot + state.toCall) + state.phasePip + state.toCall)};
    const callAction: Action = (state.toCall > 0) ? {type: "call"} : {type: "check_or_fold"};
    const foldAction: Action = {type: "check_or_fold"};
    const raiseMultiplierFaced = (state.toCall + state.phasePip)/state.bigBlind; 

    const effXBet = Math.log(raiseMultiplierFaced)/Math.log(3) + 1;
    const effXBetInt = Math.round(effXBet); 

    if (threshold > 3) {
        if (threshold === 6){
            return raiseAction;
        }
        else{
            if (threshold < effXBetInt) {
                return foldAction; 
            }
            else if (threshold === effXBetInt) {
                return callAction;
            }
            else {
                return raiseAction;
            }
        }  
    }
    else if (threshold === 3) {
        const probabilityOfCall = (20/raiseMultiplierFaced)**5 * ((state.toCall + state.phasePip)/state.toCall)**1.5;
        return Math.random() < probabilityOfCall ? callAction : foldAction;
    }
    else if (threshold === 2){
        if (effXBetInt <= threshold) {
            return callAction; 
        }
        const probabilityOfCall = Math.min((7/raiseMultiplierFaced), 1) * (state.phasePip/(state.toCall + state.phasePip));
        return Math.random() < probabilityOfCall ? callAction : foldAction;
    }
    else {
        return foldAction;
    }
}

export function facing4Bet(state: State): Action {
    const threshold = getBetThreshold(rangeChart, state.hand);
    const position = getRelativePosition(state);

    const raiseAction: Action = {type: "raise", raiseAmount: Math.round((1-position/3)*(state.pot + state.toCall) + state.phasePip + state.toCall)};
    const callAction: Action = (state.toCall > 0) ? {type: "call"} : {type: "check_or_fold"};
    const foldAction: Action = {type: "check_or_fold"};

    const raiseMultiplierFaced = (state.toCall + state.phasePip)/state.bigBlind; 
    const effXBet = Math.log(raiseMultiplierFaced)/Math.log(3) + 1;
    const effXBetInt = Math.round(effXBet); 

    if (threshold > 4) {
        if (threshold === 6){
            return raiseAction;
        }
        else{
            if (threshold < effXBetInt) {
                return foldAction; 
            }
            else if (threshold === effXBetInt) {
                return callAction;
            }
            else {
                return raiseAction;
            }
        }  
    }
    else if (threshold === 4) {
        const probabilityOfCall = (35/raiseMultiplierFaced)**4 * ((state.toCall + state.phasePip)/state.toCall)**1.5;
        return Math.random() < probabilityOfCall ? callAction : foldAction;
    }
    else if (threshold === 3) {
        if (effXBetInt <= threshold) {
            return callAction; 
        }
        const probabilityOfCall = Math.min((21/raiseMultiplierFaced), 1) * (state.phasePip/(state.toCall + state.phasePip));
        return Math.random() < probabilityOfCall ? callAction : foldAction;
    }
    else {
        return foldAction
    }
}

export function facing5Bet(state: State): Action {
    const threshold = getBetThreshold(rangeChart, state.hand);
    const position = getRelativePosition(state);

    const raiseAction: Action = {type: "raise", raiseAmount: Math.round((1-position/3)*(state.pot + state.toCall) + state.phasePip + state.toCall)};
    const callAction: Action = (state.toCall > 0) ? {type: "call"} : {type: "check_or_fold"};
    const foldAction: Action = {type: "check_or_fold"};

    const raiseMultiplierFaced = (state.toCall + state.phasePip)/state.bigBlind; 
    const effXBet = Math.log(raiseMultiplierFaced)/Math.log(3) + 1;
    const effXBetInt = Math.round(effXBet); 

    if (threshold > 5) {
        return raiseAction;
    }
    else if (threshold === 5) {
        const probabilityOfCall = (120/raiseMultiplierFaced)**3.5 * ((state.toCall + state.phasePip)/state.toCall);
        return Math.random() < probabilityOfCall ? callAction : foldAction;
    }
    else if (threshold === 4) {
        if (effXBetInt <= threshold) {
            return callAction; 
        }
        const probabilityOfCall = Math.min((60/raiseMultiplierFaced), 1) * (state.phasePip/(state.toCall + state.phasePip));
        return Math.random() < probabilityOfCall ? callAction : foldAction;
    }
    else {
        return foldAction;
    }
}

export function preflopAction(state: State): Action {
    const currXBet = state.phaseXBet[0].xBet
    if (currXBet === 1) {
        return facingLimp(state);
    }
    if (currXBet === 2) {
        return facing2Bet(state);
    }
    if (currXBet === 3) {
        return facing3Bet(state);
    }
    if (currXBet === 4) {
        return facing4Bet(state);
    }
    if (currXBet === 5) {
        return facing5Bet(state);
    }
    return {type: "call"};
}

// function pairPreflopAction(state: State): Action {
//     const valueCode = state.hand[0].value.code;

//     if (valueCode == AceCode)
//         return bestHandAction(state);
    
//     if (valueCode >= 10)
//         return highPairAction(state);

//     const ninesCheckOrFoldProbability = 0.05;
//     const twosCheckOrFoldProbability = 0.8;

//     return probabilisticAction("pre-lowpair", state, uniformFill({
//         checkFoldProbability: lerp(twosCheckOrFoldProbability, ninesCheckOrFoldProbability, (valueCode - 2) / 9),
//         halfPotRaiseProbability: 0,
//         allInProbability: 0,
//     }));
// }

// function nonPairPreflopAction(state: State): Action {
//     const highestCard = getHighestCard(state.hand)!;
//     const lowestCard = getLowestCard(state.hand)!;

//     if (lowestCard.value.code >= QueenCode)
//         return premiumNonPairAction(state);

//     if (lowestCard.value.code >= 10)
//         return semiHighNonPairAction(state);
    
//     const delta = highestCard.value.code - lowestCard.value.code;

//     if (delta >= 5) {
//         if (highestCard.value.code >= KingCode)
//             return highTrashAction(state);
//         else
//             return pureTrashAction(state);
//     }

//     if (highestCard.value.code >= JackCode)
//         return faceAction(state);

//     return pureTrashAction(state);
// }

// function highPairAction(state: State): Action {
//     return probabilisticAction(postfixNameToCall("pre-highpair", state), state, toCallDependent(state, {
//         zero: {
//             checkFoldProbability: 0,
//             minRaiseProbability: 0.5,
//             halfPotRaiseProbability: 0,
//             potRaiseProbability : 0.5,
//             allInProbability: 0,
//         },
//         nonZero: checkCallBased({
//             checkFoldProbability: 0,
//             callProbability: (state.pot >= 3 * state.bigBlind) ? 0.5 : 0,
//             remainingMinRaiseShare: 0.5,
//             remainingHalfPotRaiseShare: 0,
//             remainingPotRaiseShare: 0.5,
//             remainingAllInShare: 0,
//         }),
//     }));
// }

// function premiumNonPairAction(state: State): Action {
//     return probabilisticAction(postfixNameToCall("pre-high-nonpair", state), state, toCallDependent(state, {
//         zero: {
//             checkFoldProbability: 0,
//             minRaiseProbability: 0.6,
//             halfPotRaiseProbability: 0,
//             potRaiseProbability : 0.4,
//             allInProbability: 0,
//         },
//         nonZero: checkCallBased({
//             checkFoldProbability: 0,
//             callProbability: (state.pot >= 3 * state.bigBlind) ? 0.5 : 0,
//             remainingMinRaiseShare: 0.7,
//             remainingHalfPotRaiseShare: 0,
//             remainingPotRaiseShare: 0.3,
//             remainingAllInShare: 0,
//         }),
//     }));
// }

// function semiHighNonPairAction(state: State): Action {
//     return probabilisticAction(postfixNameToCall("pre-semihigh-nonpair", state), state, toCallDependent(state, {
//         zero: {
//             checkFoldProbability: 0,
//             minRaiseProbability: 0.8,
//             halfPotRaiseProbability: 0,
//             potRaiseProbability : 0.2,
//             allInProbability: 0,
//         },
//         nonZero: checkCallBased({
//             checkFoldProbability: 0,
//             callProbability: (state.pot >= 3 * state.bigBlind) ? 0.7 : 0,
//             remainingMinRaiseShare: 0.8,
//             remainingHalfPotRaiseShare: 0,
//             remainingPotRaiseShare: 0.2,
//             remainingAllInShare: 0,
//         }),
//     }));
// }

// function highTrashAction(state: State): Action {
//     const lowestCard = getLowestCard(state.hand)!;
//     const twoMultiplier = 0.3;
//     const nineMultiplier = 1;
//     const multiplier = lerp(twoMultiplier, nineMultiplier, (lowestCard.value.code - 2) / 7);

//     return probabilisticAction(postfixNameToCall("pre-hightrash", state), state, toCallDependent(state, {
//         zero: {
//             checkFoldProbability: 0.7,
//             minRaiseProbability: 0.2,
//             halfPotRaiseProbability: 0.1,
//             potRaiseProbability : 0,
//             allInProbability: 0,
//         },
//         nonZero: checkCallBased({
//             checkFoldProbability: 0.6,
//             callProbability: multiplier * ((state.pot > state.bigBlind && state.pot <= 4 * state.bigBlind) ? 0.2 : 0.05),
//             remainingMinRaiseShare: multiplier * (state.pot <= 4 * state.bigBlind ? 0.2 : 0.05),
//             remainingHalfPotRaiseShare: 0,
//             remainingPotRaiseShare: 0,
//             remainingAllInShare: 0,
//         }),
//     }));
// }

// function pureTrashAction(state: State): Action {
//     return probabilisticAction(postfixNameToCall("pre-puretrash", state), state, toCallDependent(state, {
//         zero: {
//             checkFoldProbability: 0.98,
//             minRaiseProbability: 0,
//             halfPotRaiseProbability: 0,
//             potRaiseProbability : 0,
//             allInProbability: 0.02,
//         },
//         nonZero: checkCallBased({
//             checkFoldProbability: 0.85,
//             callProbability: (state.pot <= 3 * state.bigBlind) ? 0.07 : 0,
//             remainingMinRaiseShare: (state.pot < 3 * state.bigBlind) ? 0.06 : 0,
//             remainingHalfPotRaiseShare: 0,
//             remainingPotRaiseShare: (state.pot >= 3 * state.bigBlind) ? 0.13 : 0,
//             remainingAllInShare: 0.02,
//         }),
//     }));
// }

// function faceAction(state: State): Action {
//     return probabilisticAction(postfixNameToCall("pre-face", state), state, toCallDependent(state, {
//         zero: {
//             checkFoldProbability: 0.7,
//             minRaiseProbability: 0.2,
//             halfPotRaiseProbability: 0.1,
//             potRaiseProbability : 0,
//             allInProbability: 0,
//         },
//         nonZero: checkCallBased({
//             checkFoldProbability: 0.6,
//             callProbability: (state.pot > state.bigBlind && state.pot <= 4 * state.bigBlind) ? 0.2 : 0.05,
//             remainingMinRaiseShare: (state.pot <= 4 * state.bigBlind) ? 0.2 : 0.05,
//             remainingHalfPotRaiseShare: 0,
//             remainingPotRaiseShare: 0,
//             remainingAllInShare: 0,
//         }),
//     }));
// }
