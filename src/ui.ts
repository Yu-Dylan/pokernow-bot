import { cardValueCodeFromName, isCardValueCodeValid } from "./cards";
import { parseHandRank } from "./rank";
import { getPhaseFromBoardLength } from "./state";

export function isMyTurn() {
    return document.querySelector(".action-signal") !== null;
}

export function parseCard(element: Element): Card {
    if (!element)
        throw new Error("can't parse card from null element");

    const rawValue = element.querySelector(".value")?.textContent;
    const rawSuit = element.querySelector(".suit")?.textContent;

    if (!rawValue || !rawSuit)
        throw new Error("can't find value or suit in card element");

    const valueName = rawValue as CardValueName;
    const valueCode = cardValueCodeFromName(valueName);

    if (!isCardValueCodeValid(valueCode))
        throw new Error("invalid card value code: " + rawValue);

    return {
        value: {
            name: valueName,
            code: valueCode,
        },
        suit: rawSuit as CardSuit,
    };
}

export function getHandCards() {
    const cards = document.querySelectorAll(".you-player .card");

    try {
        const firstCard = parseCard(cards[0]);
        const secondCard = parseCard(cards[1]);
        return [firstCard, secondCard];
    }
    catch (err) {
        throw new Error("error parsing hand cards: " + err);
    }
}

export function getBoardCards() {
    const cards = [...document.querySelectorAll(".table-cards .card")];

    try {
        return cards.map(parseCard);
    }
    catch (err) {
        throw new Error("error parsing board cards: " + err);
    }
}

export function getBigBlindValue() {
    return parseInt(document.querySelectorAll(".blind-value .chips-value")[1].textContent ?? "");
}

export function getToCallValue() {
    const callText = document.querySelector("button.call")?.textContent;

    if (!callText)
        return 0;

    const lowercasedCallText = callText.toLowerCase();

    if (!lowercasedCallText.includes("call"))
        return 0;

    if (!lowercasedCallText.includes(" "))
        return 0;

    return parseInt(lowercasedCallText.split(" ")[1]);
}

export function getHandRank() {
    const rawRank = document.querySelector(".player-hand-message")?.textContent ?? "";
    return parseHandRank(rawRank);
}

export function getPhase() {
    const boardCardsElements = document.querySelectorAll(".table-cards .card");
    return getPhaseFromBoardLength(boardCardsElements.length);
}

export function getStack() {
    const stackText = document.querySelector(".table-player.you-player .table-player-stack")?.textContent;
    return parseInt(stackText ?? "0");
}

export function getTotalPot() {
    const potText = document.querySelector(".table-pot-size .add-on .chips-value")?.textContent;
    return parseInt(potText ?? "0");
}

export function getPrevPhasePot() {
    const prevPotText = document.querySelector(".table-pot-size .main-value .chips-value")?.textContent;
    return parseInt(prevPotText ?? "0");
}

export function getPhasePip() {
    const phasePipText = document.querySelector(".table-player.you-player .table-player-bet-value .chips-value .normal-value")?.textContent;
    return parseInt(phasePipText ?? "0");
}

function getSeatNumberFromElement(el: Element): number | null {
    const classes = el.className.split(/\s+/);
    for (const cls of classes) {
        // Match "table-player-<number>", but not "table-player" itself.
        const match = cls.match(/^table-player-(\d+)$/);
        if (match) {
        return parseInt(match[1], 10);
        }
    }
    return null;
}

export function getMySeatNumber(): number | null {
    const myPlayer = document.querySelector(".table-player.you-player");
    if (!myPlayer) {
        console.warn("Your player element was not found.");
        return null;
    }
    return getSeatNumberFromElement(myPlayer);
}

export function getDealerSeatNumber(): number | null {
    const dealerButton = document.querySelector('.dealer-button-ctn');
    if (!dealerButton) {
        console.warn("Dealer button element not found.");
        return null;
    }
    const classes = dealerButton.className.split(/\s+/);
    const dealerPosClass = classes.find(cls => cls.startsWith("dealer-position-"));
    if (!dealerPosClass) return null;
    const posStr = dealerPosClass.replace("dealer-position-", "");
    const posNum = parseInt(posStr, 10);
    return isNaN(posNum) ? null : posNum;
}

export function getAllPlayers(active: boolean = true): number[] {
    let allPlayerElements: Element[] = Array.from(document.querySelectorAll('.table-player'));
    if (active) {
        allPlayerElements = allPlayerElements.filter(
            el => {return !el.classList.contains("folded") &&
                   window.getComputedStyle(el).display !== "none";}
        );
    } 
    const allPlayerSeats: number[] = allPlayerElements.map(getSeatNumberFromElement).filter((n): n is number => n !== null);
    allPlayerSeats.sort((a, b) => a - b);
    return allPlayerSeats;
}

export function getState(): State {
    const hand = getHandCards();
    const board = getBoardCards();
    const activePlayers = getAllPlayers(true); 

    return {
        phase: getPhase(),
        phasePip: getPhasePip(), 
        handRank: getHandRank(),
        hand,
        board,
        handPlusBoard: [...hand, ...board],
        bigBlind: getBigBlindValue(),
        stack: getStack(),
        pot: getTotalPot(),
        prevPhasePot: getPrevPhasePot(),
        toCall: getToCallValue(),
        activePlayers: activePlayers,
        dealerSeat: getDealerSeatNumber(),
        mySeat: getMySeatNumber(),
    };
}

export function canCheck() {
    return !document.querySelector<HTMLButtonElement>("button.check")?.disabled;
}

export function check() {
    document.querySelector<HTMLButtonElement>("button.check")?.click();
}

export function fold() {
    document.querySelector<HTMLButtonElement>("button.fold")?.click();
}

export function call() {
    document.querySelector<HTMLButtonElement>("button.call")?.click();
}

export function customRaise(amount: number | undefined, callback?: () => void) {
    const currentStack = getStack();
    if (amount === undefined) {
        throw new Error("Custom Raise amount is undefined")
    }
    
    // if (amount >= currentStack) {
    //     // If the desired raise is above or equal to our stack,
    //     // we call allInRaise to handle it appropriately.
    //     allInRaise(callback || (() => {}));
    //     return; 
    // }
    
    withRaiseMenu(() => {
        const raiseInput = document.querySelector<HTMLInputElement>('.raise-bet-value input');
        if (!raiseInput) {
            throw new Error("Custom raise input field not found.");
        }

        raiseInput.value = amount.toString();
        raiseInput.dispatchEvent(new Event('input', { bubbles: true }));
        callback?.();
    });
}

function withRaiseMenu(action: () => void) {
    const raiseButton = document.querySelector<HTMLButtonElement>("button.raise")!;

    if (raiseButton.disabled) {
        call();
        action();
        return;
    }

    raiseButton.click();

    setTimeout(
        () => {
            action();
            document.querySelector<HTMLButtonElement>('.raise-controller-form input[type="submit"]')?.click();
        },
        100,
    );
}

function getBetButtons() {
    const buttons = document.querySelectorAll<HTMLButtonElement>(".default-bet-buttons button");
    console.log("bet buttons", buttons);
    return buttons;
}

export function minRaise(callback: () => void) {
    withRaiseMenu(() => {
        getBetButtons()[0]?.click();
        callback?.();
    });
}

export function halfPotRaise(callback: () => void) {
    withRaiseMenu(() => {
        getBetButtons()[1]?.click();
        callback?.();
    });
}

export function tqPotRaise(callback: () => void) {
    withRaiseMenu(() => {
        getBetButtons()[2]?.click();
        callback?.();
    });
}

export function potRaise(callback: () => void) {
    withRaiseMenu(() => {
        getBetButtons()[3]?.click();
        callback?.();
    });
}

export function allInRaise(callback: () => void) {
    withRaiseMenu(() => {
        getBetButtons()[4]?.click();
        callback?.();
    });
}

export function showHandIfPossible() {
    document.querySelector<HTMLButtonElement>('button.show-your-hand')?.click();
}
