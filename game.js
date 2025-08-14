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
            items: ['rusty key', 'potion'],
            exits: { north: 'hallway' },
            enemy: {
                name: 'Rat',
                health: 4,
                attack: 1,
                alive: true
            }
        },
        hallway: {
            description: 'A long hallway stretches before you. The room you came from is to the south.',
            items: [],
            exits: { south: 'startRoom' },
            enemy: null
        },
    },
};

// --- Render Function ---
function render() {
    const loc = gameState.world[gameState.player.currentLocation];
    let display = loc.description + '\n';
    if (loc.enemy && loc.enemy.alive) {
        display += `An enemy is here: ${loc.enemy.name} (HP: ${loc.enemy.health})\n`;
    }
    display += (loc.items.length ? 'You see: ' + loc.items.join(', ') : '');
    document.getElementById('main-display').textContent = display;
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
        case 'grab':
        case 'take':
            takeItem(arg);
            break;
        case 'attack':
            attack();
            break;
        case 'heal':
            heal();
            break;
        case 'item':
            showInventory();
            break;
        case 'escape':
            escape();
            break;
        default:
            displayMessage("I don't understand that command.");
    }
}

function move(direction) {
    const loc = gameState.world[gameState.player.currentLocation];
    if (loc.enemy && loc.enemy.alive) {
        displayMessage("You can't leave while an enemy blocks your way!");
        return;
    }
    if (loc.exits[direction]) {
        gameState.player.currentLocation = loc.exits[direction];
        render();
    } else {
        displayMessage("You can't go that way.");
    }
}


function takeItem(arg) {
    const loc = gameState.world[gameState.player.currentLocation];
    if (!arg) {
        if (loc.items.length === 0) {
            displayMessage('There are no items to take.');
            return;
        }
        let msg = 'Items you can take:';
        loc.items.forEach((item, i) => {
            msg += `\n${i + 1}. ${item}`;
        });
        msg += '\nType take [number] to pick up an item.';
        displayMessage(msg);
        return;
    }
    // If arg is a number, take the corresponding item
    const idx = parseInt(arg) - 1;
    if (!isNaN(idx) && idx >= 0 && idx < loc.items.length) {
        const item = loc.items[idx];
        loc.items.splice(idx, 1);
        gameState.player.inventory.push(item);
        displayMessage(`You take the ${item}.`);
        render();
        return;
    }
    // Otherwise, try to take by name
    const nameIdx = loc.items.indexOf(arg);
    if (nameIdx !== -1) {
        const item = loc.items[nameIdx];
        loc.items.splice(nameIdx, 1);
        gameState.player.inventory.push(item);
        displayMessage(`You take the ${item}.`);
        render();
    } else {
        displayMessage("There's no such item here.");
    }
}

function attack() {
    const loc = gameState.world[gameState.player.currentLocation];
    if (loc.enemy && loc.enemy.alive) {
        loc.enemy.health -= gameState.player.attack;
        displayMessage(`You attack the ${loc.enemy.name} for ${gameState.player.attack} damage!`);
        if (loc.enemy.health <= 0) {
            loc.enemy.alive = false;
            displayMessage(`You have defeated the ${loc.enemy.name}!`);
        } else {
            // Enemy counterattacks
            gameState.player.health -= loc.enemy.attack;
            displayMessage(`The ${loc.enemy.name} attacks you for ${loc.enemy.attack} damage!`);
            if (gameState.player.health <= 0) {
                displayMessage('You have been defeated! Game over.');
                document.getElementById('command-input').disabled = true;
            }
        }
        render();
    } else {
        displayMessage('There is nothing to attack here.');
    }
}

function heal() {
    const idx = gameState.player.inventory.indexOf('potion');
    if (idx !== -1) {
        gameState.player.inventory.splice(idx, 1);
        gameState.player.health += 5;
        displayMessage('You use a potion and heal 5 HP!');
        render();
    } else {
        displayMessage('You have no potion to heal with.');
    }
}

function showInventory() {
    displayMessage('Inventory: ' + (gameState.player.inventory.length ? gameState.player.inventory.join(', ') : 'empty'));
}

function escape() {
    const loc = gameState.world[gameState.player.currentLocation];
    if (loc.enemy && loc.enemy.alive) {
        if (Math.random() < 0.5) {
            displayMessage('You successfully escape!');
            loc.enemy.alive = false;
            render();
        } else {
            displayMessage('Escape failed! The enemy attacks you as you try to flee.');
            gameState.player.health -= loc.enemy.attack;
            if (gameState.player.health <= 0) {
                displayMessage('You have been defeated! Game over.');
                document.getElementById('command-input').disabled = true;
            }
            render();
        }
    } else {
        displayMessage('There is nothing to escape from.');
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
