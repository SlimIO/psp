const TEST = `bonjour
            comment
            tu
            t'appel
            
            coucou`;

function structMessages(msg) {
    const message = msg.split("\n").map((line, idx) => {
        if (idx > 0 && line !== "") {
            return `|   ${line.trim()}`;
        }

        return line.trim();
    });

    return message.join("\n");
}

structMessages(TEST);
