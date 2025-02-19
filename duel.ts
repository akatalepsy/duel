import * as readline from 'readline';
import "./extensions.ts";
import { binomial } from './extensions.ts';


const input = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let debug_state = false;

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

const skills: UserSkill[] = [
    new UserSkill("dueling", 1),
    new UserSkill("luck", 1)
]

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

const commands: Command[] = [
    new Command("help", help, "Displays this message."),
    new Command("list", listAimPoints, "Return s a list of aim points."),
    new Command("duel", duel, "Starts a duel."),
    new Command("level", getLevelToUpdate, "Manually set dueling level."),
    new Command("debug", debug, "Turns debug mode on or off."),
    new Command("quit", process.exit, "Terminates the program.")
]

class AimPoint {
    name: string
    accuracy_multiplier: number
    constructor(name: string, accuracy_multiplier: number) {
        this.name = name;
        this.accuracy_multiplier = accuracy_multiplier;
    }
}

const aim_points: AimPoint[] = [
    new AimPoint("head", .55),
    new AimPoint("heart", .40),
    new AimPoint("chest", .95),
    new AimPoint("gut", .75),
    new AimPoint("hand", .25),
    new AimPoint("barrel", .000001),
    new AimPoint("sky", 9999)
]

class MissPoint {
    name: string
    accuracy_levels: any
    luck_multiplier: number
    constructor(name: string, accuracy_levels, luck_multiplier: number) {
        this.name = name;
        this.accuracy_levels = accuracy_levels;
        this.luck_multiplier = luck_multiplier
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


function getLevelToUpdate() {
    reply("Please choose level to set (`dueling` or `luck`) or type `cancel` to cancel.");
    printLevels();
    input.question(command_prompt, (user_input) => {
        user_input.toLowerCase().trim();
        if (user_input == "quit") {
            process.exit(termination_message);
        }
        else if (user_input == "cancel") {
            reply(user_cancel);
            run();
        }
        else {
            for (let key of skills) {
                if (user_input == key.name) {
                    const skill_to_update = key;
                    const new_level = updateLevel(skill_to_update);
                    if (new_level) {
                        skill_to_update.level = new_level;
                        reply(`Successfully set ${skill_to_update.name} level to ${new_level}.`);
                        return;
                    }
                }
                else {
                    reply("Invalid selection. Please try again.");
                    getLevelToUpdate();
                }
            }
        }
    });
}

function updateLevel(skill_to_update) {
    let output:any = false
    reply(`Please enter new ${skill_to_update.name} level or type \`cancel\` to cancel.\n(Level must be an integer greater than zero)`)
    input.question(command_prompt, (user_input) => {
        user_input.toLowerCase().trim();
        if(user_input == "quit") {
            process.exit(termination_message);
        }
        else if (user_input == "cancel") {
            reply(user_cancel);
            return;
        }
        else if (user_input.isNumeric() && Number(user_input) >= 1) {
            output = Number(user_input);
            return;
        }
        else {
            reply("Invalid level. Please try again.");
            updateLevel(skill_to_update);
        }
    });
    return (output)
}

function calcLevelCurve(skill: UserSkill, curve_mod_1: number, curve_mod_2: number) {
    const accuracy = 1 - Math.E**(-curve_mod_1 * (skill.level - 1)) * curve_mod_2;
    return (accuracy);
}

function getIsHit(multiplier) {
    const accuracy = calcLevelCurve(skills[0], 0.05, 0.7);
    const hit_chance = multiplier * accuracy;
    const roll = Math.random();
    const is_hit = roll < hit_chance;
    return (is_hit);
}

function getMissPoints(user_aim) {
    const p = calcLevelCurve(skills[0], 0.015, 0.9);
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
    const p = calcLevelCurve(skills[1], 0.015, 0.9);
    const roll = binomial(n, p);
    const miss = possible_miss_points[roll];
    return (miss);
}

function duel() {
    reply("Please enter an aim point or type `cancel` to cancel.");
    printLevels();
    input.question(command_prompt, (user_aim_raw) => {
        user_aim_raw.toLowerCase().trim();
        if (user_aim_raw == "quit") {
            process.exit(termination_message);
        }
        else if (user_aim_raw == "cancel") {
            reply(user_cancel);
            return;
        }
        else {
            let user_aim: AimPoint | null = null;
            for (let key of aim_points) {
                if (user_aim_raw == key.name) {
                    user_aim = key;
                }
            }
            if (user_aim) {
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
                duel();
            }
        }
    });
}

function help() {
    let output = "Commands:\n\n\tName:\t\tDescription:\n";
    for (let key of commands) {
        output += `\n\t${key.name}\t\t${key.info}`;
    }
    reply(output);
}

function listAimPoints() {
    let output = "Aim Points:\n\n\tName:\t\tAccuracy Multiplier:\n";
    for (let key of aim_points) {
        output += `\n\t${key.name.capitalize()}\t\t${key.accuracy_multiplier}`;
    }
    reply(output);
}

function debug() {
    debug_state != debug_state;
    if (debug_state = true) {
        reply("Debug Mode: [ON]");
    }
    else {
        reply("Debug Mode: [OFF]");
    }
}

function printLevels() {
    let output = "";
    for (let key of skills) {
        output += `${key.name.capitalize()} Level: ${key.level}\n`;
    }
    reply(output.trim());
}

function reply(message) {
    message = "\n" + message;
    console.log(message);
}

function run() {
    reply(default_instruction);
    printLevels();
    input.question(command_prompt, (user_input) => {
    let command: Command | null = null;
    for (let key of commands) {
        if (user_input == key.name) {
            command = key;
        }
    }
    if (command) {
        command.run();
        run();
    }
    else {
        reply("Invalid command. Please try again.");
        run();
    }
    });
}

run()