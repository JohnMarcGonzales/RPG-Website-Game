// --- Game State ---
const gameState = {
    player: {
        health: 15,
        attack: 2,
        inventory: [],
        equipped: {},
        currentLocation: 'cell',
        questStage: 0,
        metNPCs: {},
    },
    world: {
        cell: {
            description: 'You awaken in a cold, damp prison cell. The stone walls are covered in moss. A faint torchlight flickers beyond the bars. There is a straw bed and a rusty bucket. The cell door is to the north.',
            items: ['old note', 'leather cap', 'wooden stick'],
            exits: { north: 'guardRoom' },
            enemy: null,
            npc: null
        },
        guardRoom: {
            description: 'A small room with a wooden table and a sleeping guard. There is a door to the east and a staircase leading up to the west. The cell you came from is to the south.',
            items: ['iron key'],
            exits: { south: 'cell', east: 'storage', west: 'stairsDown' },
            enemy: {
                name: 'Sleeping Guard',
                health: 6,
                attack: 2,
                alive: true
            },
            npc: null
        },
        storage: {
            description: 'A cramped storage room filled with crates and barrels. There is a faint smell of ale. You see a locked chest in the corner.',
            items: ['potion', 'dagger'],
            exits: { west: 'guardRoom' },
            enemy: null,
            npc: null
        },
        stairsDown: {
            description: 'A spiral staircase descends into darkness. The air grows colder as you go down. You hear faint chanting below.',
            items: [],
            exits: { east: 'guardRoom', down: 'cultChamber' },
            enemy: null,
            npc: null
        },
        cultChamber: {
            description: 'A large underground chamber lit by eerie blue flames. Hooded cultists stand in a circle, chanting around a stone altar. There is a passage to the north and stairs up to the south.',
            items: ['mysterious amulet'],
            exits: { south: 'stairsDown', north: 'tunnel' },
            enemy: {
                name: 'Cultist Acolyte',
                health: 8,
                attack: 3,
                alive: true
            },
            npc: null
        },
        tunnel: {
            description: 'A narrow tunnel carved through the earth. The walls are damp and roots hang from the ceiling. You see light ahead to the north.',
            items: [],
            exits: { south: 'cultChamber', north: 'forestEdge' },
            enemy: null,
            npc: null
        },
        forestEdge: {
            description: 'You emerge at the edge of a vast, ancient forest. The trees tower above you. A dirt path leads east to a small village. The tunnel is to the south.',
            items: [],
            exits: { south: 'tunnel', east: 'village' },
            enemy: null,
            npc: null
        },
        village: {
            description: 'A peaceful village with thatched cottages and a bustling market. Villagers eye you warily. There is an inn to the north and a path west back to the forest.',
            items: [],
            exits: { west: 'forestEdge', north: 'inn' },
            enemy: null,
            npc: 'Elder Rowan'
        },
        inn: {
            description: 'The village inn is warm and lively. A bard plays a lute by the fire. The innkeeper greets you. There are rooms upstairs and the village square to the south.',
            items: ['bread', 'potion'],
            exits: { south: 'village', up: 'innRoom' },
            enemy: null,
            npc: 'Bard Lira'
        },
        innRoom: {
            description: 'A small, cozy room with a bed and a window overlooking the village. You can rest here. The stairs lead down.',
            items: [],
            exits: { down: 'inn' },
            enemy: null,
            npc: null
        },
        mountainPass: {
            description: 'A rocky mountain pass winds north from the village. The air is thin and cold. You see a cave entrance ahead.',
            items: [],
            exits: { south: 'village', north: 'caveEntrance' },
            enemy: null,
            npc: null
        },
        caveEntrance: {
            description: 'The mouth of a dark cave yawns before you. Strange markings are carved into the stone. The mountain pass is to the south.',
            items: [],
            exits: { south: 'mountainPass', in: 'deepCave' },
            enemy: {
                name: 'Wolf',
                health: 10,
                attack: 3,
                alive: true
            },
            npc: null
        },
        deepCave: {
            description: 'The cave is dark and echoing. You hear the drip of water. Something glitters in the darkness.',
            items: ['ancient sword'],
            exits: { out: 'caveEntrance' },
            enemy: {
                name: 'Cave Troll',
                health: 18,
                attack: 5,
                alive: true
            },
            npc: null
        },
    },
    npcs: {
        'Elder Rowan': {
            description: 'The wise village elder, with a long white beard and kind eyes.',
            dialogue: [
                'Welcome, traveler. Dark times are upon us. The cult beneath the mountain seeks to awaken an ancient evil.',
                'If you are brave, seek the ancient sword in the cave to the north. Only it can defeat the cult leader.',
                'Return to me when you have the sword.'
            ],
            questGiven: false,
            questComplete: false
        },
        'Bard Lira': {
            description: 'A cheerful bard with a quick smile and a quicker wit.',
            dialogue: [
                'Care for a song, adventurer? Or perhaps a rumor? They say the cave holds more than just monsters...'
            ]
        }
    },
    history: [] // For history log
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
    updateHistory();
}

// --- Command Handler ---
function handleCommand(input) {
    if (!input.trim()) return;
    const [command, ...args] = input.trim().toLowerCase().split(' ');
    const arg = args.join(' ');
    addToHistory('> ' + input);
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
            showInventory(arg);
            break;
        case 'equip':
            equipItem(arg);
            break;
        case 'escape':
            escape();
            break;
        case 'talk':
            talkToNPC(arg);
            break;
        case 'rest':
            rest();
            break;
        case 'history':
            showHistory(arg);
            break;
        default:
            displayMessage("I don't understand that command.");
    }
}
// --- NPC and Story Functions ---
function talkToNPC(arg) {
    const loc = gameState.world[gameState.player.currentLocation];
    let npcName = loc.npc;
    if (!npcName) {
        displayMessage('There is no one to talk to here.');
        return;
    }
    const npc = gameState.npcs[npcName];
    if (!npc) {
        displayMessage('There is no one to talk to here.');
        return;
    }
    if (npcName === 'Elder Rowan') {
        if (!npc.questGiven) {
            displayMessage(npc.dialogue[0]);
            npc.questGiven = true;
        } else if (!npc.questComplete && gameState.player.inventory.includes('ancient sword')) {
            displayMessage('You show Elder Rowan the ancient sword.');
            displayMessage('Elder Rowan: "You have done well! Now, descend into the cult chamber and face their leader. Only you can stop the ritual!"');
            npc.questComplete = true;
            gameState.player.questStage = 2;
        } else if (npc.questComplete) {
            displayMessage('Elder Rowan: "The fate of the realm is in your hands!"');
        } else {
            displayMessage(npc.dialogue[1]);
        }
    } else if (npcName === 'Bard Lira') {
        displayMessage(npc.dialogue[0]);
    } else {
        displayMessage('You talk to ' + npcName + '.');
    }
}

function rest() {
    const loc = gameState.world[gameState.player.currentLocation];
    if (loc === gameState.world['innRoom']) {
        gameState.player.health = 15;
        displayMessage('You rest and recover your health.');
        render();
    } else {
        displayMessage('You can only rest in a safe place, like an inn room.');
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
        // Special story triggers
        if (gameState.player.currentLocation === 'village' && !gameState.player.metNPCs['Elder Rowan']) {
            displayMessage('A wise old man approaches you as you enter the village.');
            gameState.player.metNPCs['Elder Rowan'] = true;
        }
        if (gameState.player.currentLocation === 'inn' && !gameState.player.metNPCs['Bard Lira']) {
            displayMessage('A bard greets you with a song as you enter the inn.');
            gameState.player.metNPCs['Bard Lira'] = true;
        }
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

function showInventory(arg) {
    let msg = '';
    if (!gameState.player.inventory.length) {
        msg = 'Inventory: empty';
    } else {
        msg = 'Inventory:';
        gameState.player.inventory.forEach((item, i) => {
            const equip = EQUIP_ITEMS.find(e => e.name === item);
            msg += `\n${i + 1}. ${item}`;
            if (equip) msg += ` (${equip.slot})`;
        });
        msg += '\nType: equip [item name or number] to equip.';
    }
    // Show equipped items
    if (Object.keys(gameState.player.equipped).length) {
        msg += '\nEquipped:';
        for (const slot in gameState.player.equipped) {
            msg += `\n- ${slot}: ${gameState.player.equipped[slot]}`;
        }
    }
    displayMessage(msg);
}

function equipItem(arg) {
    if (!arg) {
        displayMessage('Equip what? Type equip [item name or number].');
        return;
    }
    let idx = parseInt(arg) - 1;
    let item = null;
    if (!isNaN(idx) && idx >= 0 && idx < gameState.player.inventory.length) {
        item = gameState.player.inventory[idx];
    } else {
        item = gameState.player.inventory.find(i => i.toLowerCase() === arg.toLowerCase());
    }
    if (!item) {
        displayMessage("You don't have that item.");
        return;
    }
    const equip = EQUIP_ITEMS.find(e => e.name === item);
    if (!equip) {
        displayMessage('You cannot equip that.');
        return;
    }
    // Equip item
    gameState.player.equipped[equip.slot] = equip.name;
    displayMessage(`You equip the ${equip.name} (${equip.slot}).`);
    updateStats();
}

function updateStats() {
    // Base stats
    let baseAttack = 2;
    let baseDefense = 0;
    for (const slot in gameState.player.equipped) {
        const equip = EQUIP_ITEMS.find(e => e.name === gameState.player.equipped[slot]);
        if (equip) {
            baseAttack += equip.attack;
            baseDefense += equip.defense;
        }
    }
    gameState.player.attack = baseAttack;
    gameState.player.defense = baseDefense;
    render();
}

// --- Equipment and Items ---
const EQUIP_ITEMS = [
    // Early game
    { name: 'leather cap', slot: 'head', attack: 0, defense: 1, desc: 'A simple leather cap.' },
    { name: 'wooden stick', slot: 'weapon', attack: 1, defense: 0, desc: 'A crude stick, better than nothing.' },
    { name: 'rusty dagger', slot: 'weapon', attack: 2, defense: 0, desc: 'A dull, rusty dagger.' },
    { name: 'padded tunic', slot: 'body', attack: 0, defense: 2, desc: 'Offers minimal protection.' },
    { name: 'iron sword', slot: 'weapon', attack: 4, defense: 0, desc: 'A sturdy iron sword.' },
    { name: 'iron helm', slot: 'head', attack: 0, defense: 3, desc: 'Protects your head.' },
    { name: 'iron mail', slot: 'body', attack: 0, defense: 5, desc: 'Heavy but strong.' },
    { name: 'steel sword', slot: 'weapon', attack: 6, defense: 0, desc: 'A sharp steel blade.' },
    { name: 'steel helm', slot: 'head', attack: 0, defense: 5, desc: 'A gleaming steel helmet.' },
    { name: 'steel mail', slot: 'body', attack: 0, defense: 8, desc: 'Excellent protection.' },
    // Mid game
    { name: 'elven cloak', slot: 'body', attack: 0, defense: 10, desc: 'Light and magical.' },
    { name: 'elven blade', slot: 'weapon', attack: 9, defense: 0, desc: 'Swift and deadly.' },
    { name: 'dragon scale', slot: 'body', attack: 0, defense: 15, desc: 'Scales of a dragon.' },
    { name: 'warhammer', slot: 'weapon', attack: 12, defense: 0, desc: 'Crushes armor.' },
    { name: 'great helm', slot: 'head', attack: 0, defense: 10, desc: 'Massive and heavy.' },
    { name: 'shadow hood', slot: 'head', attack: 0, defense: 7, desc: 'Blends with darkness.' },
    { name: 'orcish axe', slot: 'weapon', attack: 10, defense: 0, desc: 'A brutal axe.' },
    { name: 'orcish mail', slot: 'body', attack: 0, defense: 12, desc: 'Rough but strong.' },
    { name: 'silver rapier', slot: 'weapon', attack: 8, defense: 0, desc: 'Light and quick.' },
    // Late game
    { name: 'ancient sword', slot: 'weapon', attack: 15, defense: 0, desc: 'A sword of legend.' },
    { name: 'phoenix feather', slot: 'head', attack: 0, defense: 12, desc: 'Magical protection.' },
    { name: 'celestial plate', slot: 'body', attack: 0, defense: 20, desc: 'Armor of the gods.' },
    { name: 'demon blade', slot: 'weapon', attack: 20, defense: 0, desc: 'Cursed but powerful.' },
    { name: 'crown of wisdom', slot: 'head', attack: 0, defense: 15, desc: 'For the wise.' },
    { name: 'cloak of stars', slot: 'body', attack: 0, defense: 18, desc: 'Shimmers with light.' },
    { name: 'frost axe', slot: 'weapon', attack: 13, defense: 0, desc: 'Chills to the bone.' },
    { name: 'helm of the bear', slot: 'head', attack: 0, defense: 13, desc: 'Fierce and strong.' },
    { name: 'titan mail', slot: 'body', attack: 0, defense: 22, desc: 'Worn by giants.' },
    { name: 'shadow blade', slot: 'weapon', attack: 17, defense: 0, desc: 'Strikes from the dark.' },
    { name: 'mask of the fox', slot: 'head', attack: 0, defense: 9, desc: 'Cunning and sly.' },
    { name: 'vampire cloak', slot: 'body', attack: 0, defense: 16, desc: 'Drains the night.' },
    { name: 'crystal staff', slot: 'weapon', attack: 14, defense: 0, desc: 'Focuses magic.' },
    { name: 'helm of light', slot: 'head', attack: 0, defense: 14, desc: 'Blinds evil.' },
    { name: 'serpent scale', slot: 'body', attack: 0, defense: 19, desc: 'Slippery and tough.' },
    { name: 'storm hammer', slot: 'weapon', attack: 16, defense: 0, desc: 'Thunderous blows.' },
    { name: 'crown of thorns', slot: 'head', attack: 0, defense: 11, desc: 'Painful to wear.' },
    { name: 'mantle of winds', slot: 'body', attack: 0, defense: 17, desc: 'Light as air.' },
    { name: 'obsidian blade', slot: 'weapon', attack: 18, defense: 0, desc: 'Cuts through anything.' },
    { name: 'helm of the wolf', slot: 'head', attack: 0, defense: 12, desc: 'Keen senses.' },
    { name: 'dragon helm', slot: 'head', attack: 0, defense: 16, desc: 'Worn by dragon riders.' },
    { name: 'dwarven mail', slot: 'body', attack: 0, defense: 21, desc: 'Forged by dwarves.' },
    { name: 'elven circlet', slot: 'head', attack: 0, defense: 8, desc: 'Graceful and light.' },
    { name: 'moon blade', slot: 'weapon', attack: 19, defense: 0, desc: 'Glows at night.' },
    { name: 'sun mail', slot: 'body', attack: 0, defense: 23, desc: 'Radiates warmth.' },
    { name: 'spirit staff', slot: 'weapon', attack: 15, defense: 0, desc: 'Guides the lost.' },
    { name: 'helm of the eagle', slot: 'head', attack: 0, defense: 10, desc: 'Sharp vision.' },
    { name: 'cloak of shadows', slot: 'body', attack: 0, defense: 14, desc: 'Hides the wearer.' },
    { name: 'giant club', slot: 'weapon', attack: 12, defense: 0, desc: 'Heavy and strong.' },
    { name: 'helm of the lion', slot: 'head', attack: 0, defense: 15, desc: 'Brave and bold.' },
    { name: 'fae mail', slot: 'body', attack: 0, defense: 13, desc: 'Enchanted by fae.' },
    { name: 'demon helm', slot: 'head', attack: 0, defense: 17, desc: 'Sinister and dark.' },
    { name: 'angelic robe', slot: 'body', attack: 0, defense: 24, desc: 'Blessed by angels.' },
    { name: 'wyrm blade', slot: 'weapon', attack: 21, defense: 0, desc: 'Forged from wyrm fang.' },
    { name: 'crown of the king', slot: 'head', attack: 0, defense: 18, desc: 'Royal and proud.' },
    { name: 'cloak of the archmage', slot: 'body', attack: 0, defense: 25, desc: 'Worn by archmages.' },
];

function displayMessage(msg) {
    document.getElementById('main-display').textContent += '\n' + msg;
    addToHistory(msg, true);
}

function addToHistory(msg, logToHistory = false) {
    // Always keep full history for backtracking
    gameState.history.push(msg);
    updateHistory();
    // Optionally, only log certain messages to the visible log
    if (logToHistory) {
        if (!gameState.visibleHistory) gameState.visibleHistory = [];
        gameState.visibleHistory.push(msg);
        if (gameState.visibleHistory.length > 100) gameState.visibleHistory.shift();
        updateHistory(true);
    }
}

function updateHistory(visibleOnly = false) {
    const historyDiv = document.getElementById('history-content');
    if (!historyDiv) return;
    let historyArr = visibleOnly && gameState.visibleHistory ? gameState.visibleHistory : gameState.history;
    historyDiv.textContent = historyArr.join('\n');
    historyDiv.scrollTop = historyDiv.scrollHeight;
}

function showHistory(arg) {
    // arg can be a number to backtrack
    let n = parseInt(arg);
    if (!isNaN(n) && n > 0 && n <= gameState.history.length) {
        const historyDiv = document.getElementById('history-content');
        let start = Math.max(0, gameState.history.length - n);
        let arr = gameState.history.slice(start);
        historyDiv.textContent = arr.join('\n');
        historyDiv.scrollTop = 0;
        displayMessage(`Showing last ${n} entries. Type 'history' to return to live log.`);
    } else {
        updateHistory(true);
        displayMessage('Showing live history log. Type history [number] to backtrack.');
    }
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
displayMessage('Welcome to the Realm of Eldoria! Type look to begin your adventure.');
