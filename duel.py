from math import e
from numpy import random
import time # not used yet

debug_state = False 

prompt = "\n> "
default_instruction = "Type `help` to see command list. Type `quit` to exit."
termination_message = "\nGoodbye!\n"
user_cancel = "User cancelled command."

skills = {} 
commands = {}
aim_points = {}
miss_points = []

class UserSkill:
    def __init__(self, name, level):
        self.name = name
        self.level = level
        skills[self.name] = self # adds each UserSkill object to `skills` dictionary, with the key being the object's name attribute

dueling = UserSkill(name= "dueling", level= 1)
luck = UserSkill(name= "luck", level= 1)

class Command:
    def __init__(self, name, run, info):
        self.name = name
        self.run = run
        self.info = info
        commands[self.name] = self # adds each Command object to `commands` dictionary, with the key being the object's name attribute

assist = Command(name= "help", run= "help()", info= "Displays this message.")
aim_list = Command(name= "list", run= "list_aim_points()", info= "Returns a list of aim points.")
start_duel = Command(name= "duel", run= "duel()", info= "Starts a duel.")
edit_level = Command(name= "level", run= "get_level_to_update()", info= "Manually set dueling level.")
toggle_debug = Command(name= "debug", run= "debug()", info= "Turns debug mode on or off.")
terminate = Command(name= "quit", run= "quit(termination_message)", info= "Terminates the program.")

class AimPoint:
    def __init__(self, name, accuracy_multiplier):
        self.name = name
        self.accuracy_multiplier = accuracy_multiplier
        aim_points[self.name] = self # adds each AimPoint object to `aim_points` dictionary, with the key being the object's name attribute

head = AimPoint(name= "head", accuracy_multiplier= .55)
heart = AimPoint(name= "heart", accuracy_multiplier= .40)
chest = AimPoint(name= "chest", accuracy_multiplier= .95)
gut = AimPoint(name= "gut", accuracy_multiplier= .75)
hand = AimPoint(name= "hand", accuracy_multiplier= .25)
barrel = AimPoint(name= "barrel", accuracy_multiplier= .000001) # aiming at the barrel has ~1 in 1,000,000 odds of succeeding in a best case scenario, as the odds of someone actually shooting a bullet into the barrel of their opponent's gun are astronomically low
sky = AimPoint(name= "sky", accuracy_multiplier= 9999) # aiming at the sky has a 100% chance of success

class MissPoint:
    def __init__(self, name, accuracy_levels, luck_multiplier):
        self.name = name
        self.accuracy_levels = accuracy_levels
        self.luck_multiplier = luck_multiplier
        miss_points.append(self) # adds each MissPoint object to `miss_points` list (didn't have to use a dictionary for this one because miss points are never printed to the terminal in a list (at least I think that's why))

# miss points which are also aim points (odds of hitting another aim point when missing your initial target are 1/5 of the odds that you would have hit that part by aiming for it) (those values do not update automatically when their corresponding aim point's accuracy multiplier is changed)
head_miss = MissPoint(name= "head", accuracy_levels= {"head": -1, "heart": 11, "chest": 11, "gut": 10, "hand": 12, "barrel": 12}, luck_multiplier= .11)
heart_miss = MissPoint(name= "heart", accuracy_levels= {"head": 11, "heart": -1, "chest": 12, "gut": 12, "hand": 11, "barrel": 11}, luck_multiplier= .08)
chest_miss = MissPoint(name= "chest", accuracy_levels= {"head": 11, "heart": 12, "chest": -1, "gut": 12, "hand": 11, "barrel": 11}, luck_multiplier= .19)
gut_miss = MissPoint(name= "gut", accuracy_levels= {"head": 10, "heart": 12, "chest": 12, "gut": -1, "hand": 10, "barrel": 10}, luck_multiplier= .15)
hand_miss = MissPoint(name= "hand", accuracy_levels= {"head": 12, "heart": 11, "chest": 11, "gut": 10, "hand": -1, "barrel": 12}, luck_multiplier= .05)
barrel_miss = MissPoint(name= "barrel", accuracy_levels= {"head": 12, "heart": 11, "chest": 11, "gut": 10, "hand": 12, "barrel": -1}, luck_multiplier= .0000002)
# left side misses
ear_left = MissPoint(name= "left ear", accuracy_levels= {"head": 12, "heart": 11, "chest": 11, "gut": 10, "hand": 12, "barrel": 12}, luck_multiplier= .25)
arm_left = MissPoint(name= "left arm", accuracy_levels= {"head": 11, "heart": 12, "chest": 11, "gut": 11, "hand": 11, "barrel": 11}, luck_multiplier= .20)
flank_left = MissPoint(name= "left flank", accuracy_levels= {"head": 8, "heart": 11, "chest": 11, "gut": 12, "hand": 9, "barrel": 9}, luck_multiplier= .20)
thigh_left = MissPoint(name= "left thigh", accuracy_levels= {"head": 7, "heart": 9, "chest": 9, "gut": 10, "hand": 7, "barrel": 7}, luck_multiplier= .20)
knee_left = MissPoint(name= "left knee", accuracy_levels= {"head": 4, "heart": 5, "chest": 6, "gut": 7, "hand": 4, "barrel": 4}, luck_multiplier= .25)
foot_left = MissPoint(name= "left foot", accuracy_levels= {"head": 0, "heart": 2, "chest": 2, "gut": 3, "hand": 0, "barrel": 0}, luck_multiplier= .55)
# right side misses
ear_right = MissPoint(name= "right ear", accuracy_levels= {"head": 12, "heart": 10, "chest": 11, "gut": 10, "hand": 12, "barrel": 12}, luck_multiplier= .25)
arm_right = MissPoint(name= "right arm", accuracy_levels= {"head": 12, "heart": 11, "chest": 11, "gut": 10, "hand": 12, "barrel": 12}, luck_multiplier= .20)
flank_right = MissPoint(name= "right flank", accuracy_levels= {"head": 8, "heart": 10, "chest": 11, "gut": 12, "hand": 10, "barrel": 10}, luck_multiplier= .20)
thigh_right = MissPoint(name= "right thigh", accuracy_levels= {"head": 7, "heart": 8, "chest": 9, "gut": 10, "hand": 7, "barrel": 7}, luck_multiplier= .20)
knee_right = MissPoint(name= "right knee", accuracy_levels= {"head": 4, "heart": 5, "chest": 6, "gut": 7, "hand": 4, "barrel": 4}, luck_multiplier= .25)
foot_right = MissPoint(name= "right foot", accuracy_levels= {"head": 0, "heart": 2, "chest": 2, "gut": 3, "hand": 0, "barrel": 0}, luck_multiplier= .55)
# left side complete misses
wide_left_high = MissPoint(name= "wide left (high)", accuracy_levels= {"head": 12, "heart": 11, "chest": 11, "gut": 10, "hand": 12, "barrel": 12}, luck_multiplier= .80)
wide_left_mid = MissPoint(name= "wide left (mid)", accuracy_levels= {"head": 8, "heart": 11, "chest": 11, "gut": 12, "hand": 9, "barrel": 9}, luck_multiplier= .80)
wide_left_low = MissPoint(name= "wide left (low)", accuracy_levels= {"head": 7, "heart": 9, "chest": 9, "gut": 10, "hand": 7, "barrel": 7}, luck_multiplier= .80)
# right side complete misses
wide_right_high = MissPoint(name= "wide right (high)", accuracy_levels= {"head": 12, "heart": 10, "chest": 11, "gut": 10, "hand": 12, "barrel": 12}, luck_multiplier= .80)
wide_right_mid = MissPoint(name= "wide right (mid)", accuracy_levels= {"head": 8, "heart": 10, "chest": 11, "gut": 12, "hand": 10, "barrel": 10}, luck_multiplier= .80)
wide_right_low = MissPoint(name= "wide right (low)", accuracy_levels= {"head": 7, "heart": 8, "chest": 9, "gut": 10, "hand": 7, "barrel": 7}, luck_multiplier= .80)
# center complete misses
high = MissPoint(name= "high", accuracy_levels= {"head": 12, "heart": 11, "chest": 11, "gut": 10, "hand": 12, "barrel": 12}, luck_multiplier= .80)
between_legs_high = MissPoint(name= "between legs (high)", accuracy_levels= {"head": 4, "heart": 5, "chest": 6, "gut": 7, "hand": 4, "barrel": 4}, luck_multiplier= .95)
between_legs_low = MissPoint(name= "between legs (low)", accuracy_levels= {"head": 0, "heart": 2, "chest": 2, "gut": 3, "hand": 0, "barrel": 0}, luck_multiplier= .95)

def get_level_to_update(): # called by `level` command, prompts user to choose which level they wish to set, then calls `update_level()` using the user's choice as the skill to be updated and sets the chosen skill's level to the value returned by `update_level()`
    while True:
        reply("Please choose level to set (`dueling` or `luck`) or type `cancel` to cancel.")
        user_input = input(prompt).lower().strip()
        if user_input == "quit":
            quit(termination_message)
        elif user_input == "cancel":
            reply(user_cancel)
            break
        try:
            skill_to_update = skills[user_input]
            new_level = update_level(skill_to_update)
            if new_level:
                skill_to_update.level = new_level
                reply(f"Successfully set {skill_to_update.name} level.")
                break
            else:
                break
        except KeyError:
            reply("Invalid selection. Please try again.")

def update_level(skill_to_update): # called by `get_level_to_update()` function, prompts user to enter the new level of the chosen skill, then returns the new level, if valid
    while True:
        reply(f"Please enter new {skill_to_update.name} level or type `cancel` to cancel.\n(Level must be an integer greater than zero.)")
        user_input = input(prompt).lower().strip()
        if user_input == "quit":
            quit(termination_message)
        elif user_input == "cancel":
            reply(user_cancel)
            return(False)
        elif user_input.isnumeric() and int(user_input) >= 1:
            new_level = int(user_input)
            return(new_level)
        else:
            reply("Invalid level. Please try again.")

def calc_level_curve(skill, curve_mod_1, curve_mod_2):
    accuracy = 1 - e**(-curve_mod_1 * (skill.level-1)) * curve_mod_2 # euler's number to the power of (negative `curve_mod_1` multiplied by (`skill.level` minus one)) multiplied by `curve_mod_2`
    return(accuracy)

def get_is_hit(multiplier): # called by `duel()` function, returns True if shot hits its intended target
    accuracy = calc_level_curve(dueling, 0.05, 0.7) # https://www.desmos.com/calculator/ykwc9eva0l (k = curve steepness modifier, v = early level difficulty (for lack of a better description))
    hit_chance = multiplier * accuracy
    roll = random.random() # returns a random float between 0 and 1
    is_hit = roll < hit_chance # returns True if `roll` is less than `hit_chance`
    return(is_hit)

def get_miss_points(user_aim): # called by `duel()` function if `get_is_hit()` returns False, returns a list of `MissPoint` objects at a randomly chosen distance from the user's aim point
    p = calc_level_curve(dueling, 0.015, 0.9) # sets `p` to the calculated value, using dueling level, (https://www.desmos.com/calculator/ojn7zrufqi (x = user level, y = chance of success (out of 1), k = curve steepness modifier, v = early level difficulty (for lack of a better description)))
    possible_miss_points = []
    while not possible_miss_points: # loops until `possible_miss_points` list is not empty
        roll_accuracy_level = random.binomial(12, p, 1) # chooses a random accuracy level, with higher numbers being more likely the higher the user's dueling level is, (https://www.desmos.com/calculator/lmbauamvk5 (f(x) = accuracy function, l = user level, n = range of numbers to choose from, k = spread positioning modifier, v = early level difficulty (for lack of a better description), p = probability for each given number, idk what the rest of the stuff does specifically))
        for i in miss_points:
            point_accuracy_level = i.accuracy_levels[user_aim.name] # sets `point_accuracy_level` to the accuracy level of the given `MissPoint` object associated with the user's aim point
            if point_accuracy_level == roll_accuracy_level:
                possible_miss_points.append(i) # adds the given `MissPoint` object to `possible_miss_points` if its accuracy level is the same as the randomly chosen accuracy level
    return(possible_miss_points)

def roll_miss(possible_miss_points): # called by `get_miss_points()` function, returns a `MissPoint` object
    possible_miss_points = sorted(possible_miss_points, key=lambda x: x.luck_multiplier, reverse=True) # sorts the possible miss points by their luck multiplier, largest to smallest
    n = len(possible_miss_points) - 1 # sets `n` to the number of miss points in the list of possible miss points (subtracts 1 to account for 0 being 1)
    p = calc_level_curve(luck, 0.015, 0.9) # sets `p` to the calculated value, using luck level, (https://www.desmos.com/calculator/ojn7zrufqi (x = user level, y = chance of success (out of 1), k = curve steepness modifier, v = early level difficulty (for lack of a better description)))
    roll = random.binomial(n, p, 1) # chooses a random miss point, with luckier miss points being more likely the higher the user's luck level is, (https://www.desmos.com/calculator/lmbauamvk5 (f(x) = accuracy function, l = user level, n = range of numbers to choose from, k = spread positioning modifier, v = early level difficulty (for lack of a better description), p = probability for each given number, idk what the rest of the stuff does specifically))
    choice = roll[0] # `random.binomial()` returns a list, so this sets `choice` to the actual number chosen, rather than a list containing the number
    miss = possible_miss_points[choice] # sets `miss` to the `MissPoint` object associated with the chosen number
    return(miss)

def duel(): # called by `duel` command
    while True:
        reply(f"Please enter an aim point or type `cancel` to cancel.")
        print_levels()
        user_aim_raw = input(prompt).lower().strip()
        if user_aim_raw == "quit":
            quit(termination_message)
        elif user_aim_raw == "cancel":
            reply(user_cancel)
            break
        else:
            try: # tries to perform a duel with the user's inputted aim point and returns an error if input is invalid
                user_aim = aim_points[user_aim_raw] # sets `user_aim` to the `AimPoint` object associated with the user's input
                is_hit = get_is_hit(user_aim.accuracy_multiplier) # returns True if the user hit their intended target
                if is_hit:
                    reply(f"hit {user_aim.name}") # notifies the user that they hit their intended target
                    break
                else:
                    possible_miss_points = get_miss_points(user_aim) # gets a list of possible miss points
                    miss = roll_miss(possible_miss_points) # picks a miss point from the list
                    reply(f"miss {user_aim.name}, hit {miss.name}") # notifies the user that they missed their intended target and of what they hit instead, if anything
                    break
            except KeyError:
                reply("Invalid aim point. Please try again.")

def help(): # called by `help` command, creates and prints a list of available commands and their descriptions
    output = "Commands:\n\n\tName:\t\tDescription:\n"
    for i in commands:
        command = commands[i]
        output += f"\n\t{command.name}\t\t{command.info}"
    reply(output)

def list_aim_points(): # called by `list` command, creates and prints a list of available aim points and their accuracy multipliers
    output = "Aim Points:\n\n\tName:\t\tAccuracy Multiplier:\n"
    for i in aim_points:
        output += f"\n\t{i.capitalize()}\t\t{aim_points[i].accuracy_multiplier}"
    reply(output)

def debug(): # called by `debug` command, turns debug mode on or off (debug mode is not yet implemented)
    global debug_state
    debug_state = not debug_state
    state = {
        True: "ON",
        False: "OFF"
    }
    message = f"Debug Mode: [{state[debug_state]}]"
    reply(message)

def print_levels(): # creates and prints a list of the user's skills and their levels
    output = ""
    for i in skills:
        output += f"{i.capitalize()} level: {skills[i].level}\n"
    reply(output.strip())

def reply(message): # print but with a preceding new line
    message = "\n" + message
    print(message)

def run(): # main program loop
    while True:
        try: # checks for `KeyboardInterrupt` error (user terminated program with ctrl + c)
            reply(default_instruction)
            print_levels()
            user_input = input(prompt).lower().strip()
            try: # tries to run the user's input command and returns an error if no such command exists
                command = commands[user_input] # sets `command` to the `Command` object associated with the user's input
                eval(command.run) # runs the selected command
            except KeyError:
                reply("Invalid command. Please try again.")
        except KeyboardInterrupt:
            quit(termination_message)


run() # runs the main program loop