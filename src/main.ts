import { getAction } from "./ai";
import { getBigBlindValue, isMyTurn } from "./ui";
import { performAction, sanitizeAction } from "./action";


let botLoopInterval: NodeJS.Timer | undefined;

console.log("hello this is main.ts speaking");

function startBotLoop() {

    console.log("starting bot");
    console.log("big blind: " + getBigBlindValue());

    botLoopInterval = setInterval(
        function botLoop() {
            if (isMyTurn()) {
                console.log("bot turn");
                
                let action = getAction();
                console.log("bot action:", action);

                let sanitizedAction = sanitizeAction(action);
                console.log("sanitized bot action:", sanitizedAction);

                performAction(sanitizedAction);
            }
        },
        500,
    );
}

function stopBotLoop() {
    clearInterval(botLoopInterval);
    botLoopInterval = undefined;
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
            let status: BotStatus = botLoopInterval === undefined
                ? "off"
                : "playing"
            ;
            callback(status);
            break;
    }
});
