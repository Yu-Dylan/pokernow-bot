import { getAction } from "./ai/ai";
import { getBigBlindValue, getState, isMyTurn, showHandIfPossible } from "./ui";
import { performAction, sanitizeAction } from "./action";
import { getNewState } from "./mainUtils";


const timeoutMs = 10;
let botLoopTimeout: NodeJS.Timer | undefined;
let state: State;

console.log(`"pokerbot v${chrome.runtime.getManifest().version}"`);

function startBotLoop() {
    stopBotLoop();

    console.log("starting bot");
    console.log("big blind: " + getBigBlindValue());

    state = getState(); 

    function botLoop() {
        // const newState = getState();
        // state = getNewState(state, newState);
        const newState = getState();
        state = getNewState(state, newState);
        if (isMyTurn()) {
            console.log("bot turn");
            
            //state = getNewState(state, getState());
            console.log("state: ", state);

            let action: Action | undefined;

            try {
                action = getAction(state);
                console.log("bot action:", action);
            }
            catch (err) {
                action = undefined;
                console.error("bot error:", err);
            }

            const sanitizedAction = sanitizeAction(action, state);
            console.log("sanitized bot action:", sanitizedAction);

            performAction(sanitizedAction, () => setTimeout(botLoop, timeoutMs));
        }
        else {
            botLoopTimeout = setTimeout(botLoop, timeoutMs);
        }

        showHandIfPossible();
    }

    botLoop();
}

function stopBotLoop() {
    clearTimeout(botLoopTimeout);
    botLoopTimeout = undefined;
}

chrome.runtime.onMessage.addListener((message: ChromeMessage, sender, callback) => {
    switch (message) {
        case "start_bot":
            startBotLoop();
            break;
        case "kill_bot":
            stopBotLoop();
            break;
        case "get_bot_status":
            let status: BotStatus = botLoopTimeout === undefined
                ? "off"
                : "playing"
            ;
            callback(status);
            break;
    }
});
