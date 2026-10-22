import { app } from "../../scripts/app.js";

const OPEN_STUDIO = "Drama3AudioStudio.Open";

app.registerExtension({
    name: "Drama3AudioStudio.Launcher",
    commands: [
        {
            id: OPEN_STUDIO,
            label: "Open Audio Studio",
            function: () => {
                const url = new URL("/drama3-audio-studio", window.location.href);
                window.open(url.href, "_blank", "noopener,noreferrer");
            },
        },
    ],
    menuCommands: [
        {
            path: ["Extensions"],
            commands: [OPEN_STUDIO],
        },
    ],
});
