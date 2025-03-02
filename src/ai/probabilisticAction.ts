import { minRaise } from "../ui";

const ProbabilisticActionArgs = {
    checkFoldProbability: 0,
    callProbability: 0,
    minRaiseProbability: 0,
    halfPotRaiseProbability: 0,
    potRaiseProbability: 0,
    allInProbability: 0,
};

export type ProbabilisticActionArgs = typeof ProbabilisticActionArgs;

export const ProbabilisticActionArgsKeys = Object.keys(ProbabilisticActionArgs)
    .map(key => key as keyof typeof ProbabilisticActionArgs);

// Here we change the mapping so that each key corresponds to a function that,
// given the current state, returns an Action with a numeric raiseAmount.
export type ProbabilityToAction = Record<
    keyof typeof ProbabilisticActionArgs, 
    (state: State) => Action
>;

const probabilityToAction: ProbabilityToAction = {
    checkFoldProbability: (_state: State) => ({ type: "check_or_fold", raiseAmount: undefined}),
    callProbability: (_state: State) => ({ type: "call", raiseAmount: undefined}),
    // Example: half-pot raise adds half the current pot to the call amount.
    minRaiseProbability: (state: State) => ({ type: "raise", raiseAmount: Math.min(1, (state.pot-state.prevPhasePot + 3*state.toCall)/2) }),
    halfPotRaiseProbability: (state: State) => ({ type: "raise", raiseAmount: state.pot / 2 }),
    // Example: pot raise adds the full pot to the call amount.
    potRaiseProbability: (state: State) => ({ type: "raise", raiseAmount: state.pot}),
    // Example: all-in raise simply raises your full stack.
    allInProbability: (state: State) => ({ type: "raise", raiseAmount: state.stack }),
};

export type CheckCallBasedProbabilisticActionArgs = {
    checkFoldProbability: number,
    callProbability: number,
    remainingMinRaiseShare: number, 
    remainingHalfPotRaiseShare: number,
    remainingPotRaiseShare: number,
    remainingAllInShare: number,
};

// --- PROBABILISTIC ACTION LOGIC ---

/**
 * Returns an action chosen randomly according to the probabilities passed in `args`.
 * 
 * Note: if state.toCall is zero, then the call probability is forced to zero.
 * The probabilities are normalized such that they sum to 1.
 * `args` is modified in-place here.
 */
export function probabilisticAction(name: string, state: State, args: ProbabilisticActionArgs): Action {
    const copy = { ...args };
    
    if (state.toCall === 0) {
        copy.callProbability = 0;
    }
    
    const normalized = normalize(copy);
    let random = Math.random();

    for (const key of ProbabilisticActionArgsKeys) {
        const probability = normalized[key];
        if (random < probability) {
            const chosenAction = probabilityToAction[key](state);
            console.log(`probabilistic action (${name})`, {
                input: args,
                normalized,
                random,
                chosen: chosenAction
            });
            return chosenAction; 
        }
        random -= probability;
    }
    return { type: "check_or_fold" };
}

/**
 * Normalizes `args` so that the probabilities sum to 1.
 */
function normalize(args: ProbabilisticActionArgs): ProbabilisticActionArgs {
    let sum = 0;
    for (const key of ProbabilisticActionArgsKeys)
        sum += args[key];

    for (const key of ProbabilisticActionArgsKeys)
        args[key] /= sum;

    return args;
}

type ToCallDependent = {
    zero: Omit<ProbabilisticActionArgs, "callProbability">,
    nonZero: ProbabilisticActionArgs,
};

export function toCallDependent(state: State, args: ToCallDependent): ProbabilisticActionArgs {
    if (state.toCall > 0)
        return args.nonZero;
    
    return {
        ...args.zero,
        callProbability: 0,
    };
}

/**
 * Appends "-call" if state.toCall > 0, "-zero" otherwise.
 */
export function postfixNameToCall(name: string, state: State): string {
    return state.toCall > 0 ? name + "-call" : name + "-zero";
}

/**
 * Allows you to specify check/fold and call probabilities directly,
 * while the raise probabilities are allocated proportionally to the remaining probability.
 */
export function checkCallBased(args: CheckCallBasedProbabilisticActionArgs): ProbabilisticActionArgs {
    const sum = args.callProbability + args.checkFoldProbability;
    const remaining = Math.max(1 - sum, 0);

    return {
        checkFoldProbability: args.checkFoldProbability,
        callProbability: args.callProbability,
        minRaiseProbability: remaining * args.remainingMinRaiseShare,
        halfPotRaiseProbability: remaining * args.remainingHalfPotRaiseShare,
        potRaiseProbability: remaining * args.remainingPotRaiseShare,
        allInProbability: remaining * args.remainingAllInShare,
    };
}

/**
 * Returns a copy of `args` where undefined probabilities are set to 0.
 */
export function zeroFill(args: Partial<ProbabilisticActionArgs>): ProbabilisticActionArgs {
    for (const key of ProbabilisticActionArgsKeys)
        if (args[key] === undefined)
            args[key] = 0;
    return args as ProbabilisticActionArgs;
}

/**
 * Returns a copy of `args` where undefined probabilities get an equal share of the remaining probability.
 */
export function uniformFill(args: Partial<ProbabilisticActionArgs>): ProbabilisticActionArgs {
    const undefinedCount = countUndefinedActions(args);
    const definedSum = sumDefinedActions(args);
    const remainingValue = 1 - definedSum;
    const fillValue = remainingValue > 0 ? remainingValue / undefinedCount : 0;
    for (const key of ProbabilisticActionArgsKeys)
        if (args[key] === undefined)
            args[key] = fillValue;
    return args as ProbabilisticActionArgs;
}

function countUndefinedActions(args: Partial<ProbabilisticActionArgs>): number {
    let undefinedCount = 0;
    for (const key of ProbabilisticActionArgsKeys)
        if (args[key] === undefined)
            undefinedCount++;
    return undefinedCount;
}

function sumDefinedActions(args: Partial<ProbabilisticActionArgs>): number {
    let sum = 0;
    for (const key of ProbabilisticActionArgsKeys) {
        const val = args[key];
        if (val !== undefined)
            sum += val;
    }
    return sum;
}
