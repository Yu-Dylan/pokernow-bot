export function getTotalActivePlayers(state: State): number {
    return state.allPlayersIn.length;
}

export function getCallingOdds(state: State): number {
    const toCall = state.toCall;
    const pot = state.pot;

    return toCall/(pot + toCall); 
}     

export function getRelativePosition(state: State): number {
    const mySeat = state.mySeat;
    const dealerSeat = state.dealerSeat;
    const sortedPlayersIn = state.allPlayersIn.sort((a, b) => (a as number) - (b as number));

    const dealerIndex = sortedPlayersIn.indexOf(state.dealerSeat);
    const myIndex = sortedPlayersIn.indexOf(state.mySeat);

    if (dealerIndex === -1 || myIndex === -1) {
        return -1;
    }

    const nthToGo = 1 + (myIndex - dealerIndex - 1)%sortedPlayersIn.length; 
    return nthToGo/sortedPlayersIn.length; 
}

export function getNumberCallers(state: State): number {
    const activePips = state.activePlayerPhasePips;
    if (activePips.size === 0) {
        return 0;
    }
    const maxPip = Math.max(...activePips.values());
    let count = 0;
    for (const [seat, pip] of activePips.entries()) {
        if (pip === maxPip) {
            count += 1;
        }
    }
    return Math.max(0, count-1); 
}