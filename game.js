// --- Game State ---
const gameState = {
    player: {
        health: 10,
        attack: 2,
        inventory: [],
        currentLocation: 'startRoom',
    },
    world: {
        startRoom: {
            description: 'You are in a dimly lit room. There is a door to the north.',
            items: ['rusty key'],
            exits: { north: 'hallway' },
        },
        hallway: {
            description: 'A long hallway stretches before you. The room you came from is to the south.',
            items: [],
            exits: { south: 'startRoom' },
        },
    },
};

// --- Render Function ---
function render() {
    const loc = gameState.world[gameState.player.currentLocation];
    document.getElementById('main-display').textContent = loc.description + '\n' +
        (loc.items.length ? 'You see: ' + loc.items.join(', ') : '');
    document.getElementById('player-stats').textContent = `Health: ${gameState.player.health} | Attack: ${gameState.player.attack}`;
    document.getElementById('inventory').textContent = 'Inventory: ' + (gameState.player.inventory.length ? gameState.player.inventory.join(', ') : 'empty');
}

// --- Command Handler ---
function handleCommand(input) {
    const [command, ...args] = input.trim().toLowerCase().split(' ');
    const arg = args.join(' ');
    switch (command) {
        case 'go':
            move(arg);
            break;
        case 'look':
            render();
            break;
        case 'take':
            takeItem(arg);
            break;
        default:
            displayMessage("I don't understand that command.");
    }
}

function move(direction) {
    const loc = gameState.world[gameState.player.currentLocation];
    if (loc.exits[direction]) {
        gameState.player.currentLocation = loc.exits[direction];
        render();
    } else {
        displayMessage("You can't go that way.");
    }
}

function takeItem(item) {
    const loc = gameState.world[gameState.player.currentLocation];
    const idx = loc.items.indexOf(item);
    if (idx !== -1) {
        loc.items.splice(idx, 1);
        gameState.player.inventory.push(item);
        displayMessage(`You take the ${item}.`);
        render();
    } else {
        displayMessage("There's no such item here.");
    }
}

function displayMessage(msg) {
    document.getElementById('main-display').textContent += '\n' + msg;
}

// --- Game Loop Setup ---
document.getElementById('command-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        handleCommand(this.value);
        this.value = '';
    }
});

// --- Initial Render ---
render();
