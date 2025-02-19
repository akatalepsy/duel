import * as readline from 'node:readline/promises';
import "./extensions.ts";
import { binomial } from './extensions.ts';

const input = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let running: boolean = true;
let debug_state: boolean = false;

const command_prompt = "\n> ";
const default_instruction = "Type `help` to see command list. Type `quit` to exit.";
const termination_message = "\nGoodbye!\n";
const user_cancel = "User cancelled command.";

class UserSkill {
    name: string;
    level: number;
    constructor(name: string, level: number) {
        this.name = name;
        this.level = level;
    }
}

const skills = {
    "dueling": new UserSkill("dueling", 1),
    "luck": new UserSkill("luck", 1)
}

class Command {
    name: string;
    run: any;
    info: string;
    constructor(name: string, run: any, info: string) {
        this.name = name;
        this.run = run;
        this.info = info;
    }
}

const commands = {
    "help": new Command("help", help, "Displays this message."),
    "list": new Command("list", listAimPoints, "Return s a list of aim points."),
    "duel": new Command("duel", duel, "Starts a duel."),
    "level": new Command("level", updateLevel, "Manually set dueling level."),
    "debug": new Command("debug", debug, "Turns debug mode on or off."),
    "quit": new Command("quit", quit, "Terminates the program.")
}

class AimPoint {
    name: string
    accuracy_multiplier: number
    constructor(name: string, accuracy_multiplier: number) {
        this.name = name;
        this.accuracy_multiplier = accuracy_multiplier;
    }
}

const aim_points = {
    "head": new AimPoint("head", .55),
    "heart": new AimPoint("heart", .40),
    "chest": new AimPoint("chest", .95),
    "gut": new AimPoint("gut", .75),
    "hand": new AimPoint("hand", .25),
    "barrel": new AimPoint("barrel", .000001),
    "sky": new AimPoint("sky", 9999)
}
class MissPoint {
    name: string
    accuracy_levels: any
    luck_multiplier: number
    constructor(name: string, accuracy_levels, luck_multiplier: number) {
        this.name = name;
        this.accuracy_levels = accuracy_levels;
        this.luck_multiplier = luck_multiplier;
    }
}

const miss_points: MissPoint[] = [
    new MissPoint("head", {"head": -1, "heart": 11, "chest": 11, "gut": 10, "hand": 12, "barrel": 12}, .11),
    new MissPoint("heart", {"head": 11, "heart": -1, "chest": 12, "gut": 12, "hand": 11, "barrel": 11}, .08),
    new MissPoint("chest", {"head": 11, "heart": 12, "chest": -1, "gut": 12, "hand": 11, "barrel": 11}, .19),
    new MissPoint("gut", {"head": 10, "heart": 12, "chest": 12, "gut": -1, "hand": 10, "barrel": 10}, .15),
    new MissPoint("hand", {"head": 12, "heart": 11, "chest": 11, "gut": 10, "hand": -1, "barrel": 12}, .05),
    new MissPoint("barrel", {"head": 12, "heart": 11, "chest": 11, "gut": 10, "hand": 12, "barrel": -1}, .0000002),

    new MissPoint("left ear", {"head": 12, "heart": 11, "chest": 11, "gut": 10, "hand": 12, "barrel": 12}, .25),
    new MissPoint("left arm", {"head": 11, "heart": 12, "chest": 11, "gut": 11, "hand": 11, "barrel": 11}, .20),
    new MissPoint("left flank", {"head": 8, "heart": 11, "chest": 11, "gut": 12, "hand": 9, "barrel": 9}, .20),
    new MissPoint("left thigh", {"head": 7, "heart": 9, "chest": 9, "gut": 10, "hand": 7, "barrel": 7}, .20),
    new MissPoint("left knee", {"head": 4, "heart": 5, "chest": 6, "gut": 7, "hand": 4, "barrel": 4}, .25),
    new MissPoint("left foot", {"head": 0, "heart": 2, "chest": 2, "gut": 3, "hand": 0, "barrel": 0}, .55),

    new MissPoint("right ear", {"head": 12, "heart": 10, "chest": 11, "gut": 10, "hand": 12, "barrel": 12}, .25),
    new MissPoint("right arm", {"head": 12, "heart": 11, "chest": 11, "gut": 10, "hand": 12, "barrel": 12}, .20),
    new MissPoint("right flank", {"head": 8, "heart": 10, "chest": 11, "gut": 12, "hand": 10, "barrel": 10}, .20),
    new MissPoint("right thigh", {"head": 7, "heart": 8, "chest": 9, "gut": 10, "hand": 7, "barrel": 7}, .20),
    new MissPoint("right knee", {"head": 4, "heart": 5, "chest": 6, "gut": 7, "hand": 4, "barrel": 4}, .25),
    new MissPoint("right foot", {"head": 0, "heart": 2, "chest": 2, "gut": 3, "hand": 0, "barrel": 0}, .55),

    new MissPoint("wide left (high)", {"head": 12, "heart": 11, "chest": 11, "gut": 10, "hand": 12, "barrel": 12}, .80),
    new MissPoint("wide left (mid)", {"head": 8, "heart": 11, "chest": 11, "gut": 12, "hand": 9, "barrel": 9}, .80),
    new MissPoint("wide left (low)", {"head": 7, "heart": 9, "chest": 9, "gut": 10, "hand": 7, "barrel": 7}, .80),

    new MissPoint("wide right (high)", {"head": 12, "heart": 10, "chest": 11, "gut": 10, "hand": 12, "barrel": 12}, .80),
    new MissPoint("wide right (mid)", {"head": 8, "heart": 10, "chest": 11, "gut": 12, "hand": 10, "barrel": 10}, .80),
    new MissPoint("wide right (low)", {"head": 7, "heart": 8, "chest": 9, "gut": 10, "hand": 7, "barrel": 7}, .80),

    new MissPoint("high", {"head": 12, "heart": 11, "chest": 11, "gut": 10, "hand": 12, "barrel": 12}, .80),
    new MissPoint("between legs (high)", {"head": 4, "heart": 5, "chest": 6, "gut": 7, "hand": 4, "barrel": 4}, .95),
    new MissPoint("between legs (low)", {"head": 0, "heart": 2, "chest": 2, "gut": 3, "hand": 0, "barrel": 0}, .95)
]


function reply(message) {
    message = "\n" + message;
    console.log(message);
}

function printLevels() {
    let output = "";
    for (let key in skills) {
        output += `${skills[key].name.capitalize()} Level: ${skills[key].level}\n`;
    }
    reply(output.trim());
}

function calcLevelCurve(skill: UserSkill, curve_mod_1: number, curve_mod_2: number) {
    const accuracy = 1 - Math.E**(-curve_mod_1 * (skill.level - 1)) * curve_mod_2;
    return (accuracy);
}

function getIsHit(multiplier) {
    const accuracy = calcLevelCurve(skills["dueling"], 0.05, 0.7);
    const hit_chance = multiplier * accuracy;
    const roll = Math.random();
    const is_hit = roll < hit_chance;
    return (is_hit);
}

function getMissPoints(user_aim) {
    const p = calcLevelCurve(skills["dueling"], 0.015, 0.9);
    let possible_miss_points: any[] = [];
    while (!possible_miss_points.length) {
        const roll_accuracy_level = binomial(12, p);
        for (let key of miss_points) {
            const point_accuracy_level = key.accuracy_levels[user_aim.name];
            if (point_accuracy_level == roll_accuracy_level) {
                possible_miss_points.push(key);
            }
        }
    }
    return (possible_miss_points);
}

function rollMiss(possible_miss_points) {
    possible_miss_points.sort((a, b) => (a.luck_multiplier > b.luck_multiplier ? -1 : 1));
    const n = possible_miss_points.length - 1;
    const p = calcLevelCurve(skills["luck"], 0.015, 0.9);
    const roll = binomial(n, p);
    const miss = possible_miss_points[roll];
    return (miss);
}

function help() {
    let output = "Commands:\n\n\tName:\t\tDescription:\n";
    for (let key in commands) {
        output += `\n\t${commands[key].name}\t\t${commands[key].info}`;
    }
    reply(output);
}

function listAimPoints() {
    let output = "Aim Points:\n\n\tName:\t\tAccuracy Multiplier:\n";
    for (let key in aim_points) {
        output += `\n\t${aim_points[key].name.capitalize()}\t\t${aim_points[key].accuracy_multiplier}`;
    }
    reply(output);
}

function debug() {
    debug_state = !debug_state;
    if (debug_state) {
        reply("Debug Mode: [ON]");
    }
    else {
        reply("Debug Mode: [OFF]");
    }
}

function quit() {
    running = false;
}

async function getLevelToUpdate() {
    while (running) {
        reply("Please choose level to set (`dueling` or `luck`) or type `cancel` to cancel.");
        printLevels();
        const user_input = (await input.question(command_prompt)).toLowerCase().trim();
        if (user_input == "quit") {
            quit();
        }
        else if (user_input == "cancel") {
            reply(user_cancel);
            return (false);
        }
        else {
            if (user_input in skills) {
                return (skills[user_input]);
            }
            else {
                reply("Invalid selection. Please try again.");
            }
        }
    }
}

async function updateLevel() {
    const skill_to_update = await getLevelToUpdate();
    while (running && skill_to_update) {
        reply(`Please enter new ${skill_to_update.name} level or type \`cancel\` to cancel.\n(Level must be an integer greater than zero)`);
        const user_input: any = (await input.question(command_prompt)).toLowerCase().trim();
        if(user_input == "quit") {
            quit();
        }
        else if (user_input == "cancel") {
            reply(user_cancel);
            return (false);
        }
        else if (user_input.isNumeric() && Number(user_input) >= 1) {
            const new_level = Number(user_input);
            skill_to_update.level = new_level;
            reply(`Successfully set ${skill_to_update.name} level to ${new_level}.`);
            return;
        }
        else {
            reply("Invalid level. Please try again.");
        }
    }
}

async function duel() {
    while (running) {
        reply("Please enter an aim point or type `cancel` to cancel.");
        printLevels();
        const user_aim_raw = (await input.question(command_prompt)).toLowerCase().trim();
        if (user_aim_raw == "quit") {
            quit();
        }
        else if (user_aim_raw == "cancel") {
            reply(user_cancel);
            return;
        }
        else if (user_aim_raw in aim_points) {
            const user_aim = aim_points[user_aim_raw];
            const is_hit = getIsHit(user_aim.accuracy_multiplier);
            if (is_hit) {
                reply(`hit ${user_aim.name}`);
                return;
            }
            else {
                const possible_miss_points = getMissPoints(user_aim);
                const miss = rollMiss(possible_miss_points);
                reply(`miss ${user_aim.name}, hit ${miss.name}`);
                return;
            }
        }
        else {
            reply("Invalid aim point. Please try again.");
        }
    }
}

async function run() {
    while (running) {
        reply(default_instruction);
        printLevels();
        const user_input = (await input.question(command_prompt)).toLowerCase().trim();
        if (user_input in commands) {
            await commands[user_input].run();
        }
        else {
            reply("Invalid command. Please try again.");
        }
    }
    console.log(termination_message);
    process.exit();
}

run();