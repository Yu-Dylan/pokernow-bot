export type range = number[][]; 

export const rangeChart: range = [
    [5, 5, 4, 4, 3, 3, 2, 2, 2, 4, 4, 0, 0],
    [5, 5, 4, 3, 2, 0, 0, 0, 4, 0, 0, 0, 0],
    [4, 3, 4, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 2, 2, 4, 3, 2, 0, 0, 0, 0, 0, 0, 0],
    [2, 0, 0, 0, 4, 3, 2, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 3, 2, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

export function getBetThreshold(range: range, hand: Card[]): number {
    const [card1, card2] = hand;
    const index1 = Math.min(card1.value.code, card2.value.code);
    const index2 = Math.max(card1.value.code, card2.value.code);

    if (card1.suit !== card2.suit){
        return range[14-index1][14-index2];
    }
    return range[14-index2][14-index1];
}