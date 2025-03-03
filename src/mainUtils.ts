export function isRaised(state: State, newState: State): Seat | undefined {
    if (state.phase !== newState.phase) {
        return undefined;
    }

    const activePips: Map<Seat, number> = state.activePlayerPhasePips; 
    const newActivePips: Map<Seat, number> = newState.activePlayerPhasePips; 
    const raiseMin: number = state.bigBlind; 

    if (activePips.size === 0 || newActivePips.size === 0) {
        return undefined;
    }

    const oldMax = Math.max(...activePips.values());
    const newMax = Math.max(...newActivePips.values());

    if (newMax > oldMax) {
        for (const [seat, pip] of newActivePips.entries()) {
            if (pip === newMax) {
                return seat;
            }
        }
    }

    return undefined;
}

export function isNewPhase(state: State, newState: State): boolean {
    return ((newState.phase.code - state.phase.code) === 1);
}

/**
 * Generates a descriptor for the current phase of the game based on the given state and new state.
 *
 * @param state - The current state of the game.
 * @param newState - The new state of the game.
 * @returns An object containing the number of phase raises and the phase aggressor.
 */
export function getPhaseDescriptor(state: State, newState: State): PhaseDescriptor {
    const aggressor: Seat | undefined = isRaised(state, newState); 
    let newXBet: number = state.phaseXBet[state.phase.code].xBet;
    let newAggressor: Seat | null = state.phaseXBet[state.phase.code].aggressor;
    if (aggressor !== undefined) {
        newXBet += 1;
        newAggressor = aggressor;
    }
    
    return {xBet: newXBet, aggressor: newAggressor};
}

/**
 * Updates the state with the new state provided. If either the current state or the new state
 * indicates that the hand is over, the new state is returned as is. Otherwise, it updates the
 * phase descriptor of the new state.
 *
 * @param state - The current state.
 * @param newState - The new state to be merged with the current state.
 * @returns The updated state.
 */
export function getNewState(state: State, newState: State): State {
    if (state.isHandOver || newState.isHandOver) {
        return newState;
    }
    const newPhaseDescriptor: PhaseDescriptor = getPhaseDescriptor(state, newState);
    newState.phaseXBet = state.phaseXBet;
    if (!isNewPhase(state, newState)) { 
        newState.phaseXBet[(newState.phase.code as number)] = newPhaseDescriptor; 
    }
    else {
        newState.phaseXBet[(state.phase.code as number)] = newPhaseDescriptor;
        newState.phaseXBet[(newState.phase.code as number)] = {xBet: 0, aggressor: null};
    }
    return newState;
}