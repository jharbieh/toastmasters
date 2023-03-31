# https://dictionaryapi.com/

import requests
import json
import secrets
import os
import csv

from dotenv import load_dotenv
from dotenv import dotenv_values

config = dotenv_values(".env")

class Wod:
    def __init__(self, key):
        self.key = key
        self.url = config["COLLEGIATE_API"]

    def get(self, word):
        r = requests.get(self.url + word + "?key=" + self.key)
        if r.status_code == 200:
            return json.loads(r.text)
        else:
            return False

    def get_definition(self, word):
        r = self.get(word)
        if r:
            return r[0]["shortdef"][0]
        else:
            return False

    def get_synonyms(self, word):
        r = self.get(word)
        if r:
            return r[0]["meta"]["syns"][0]
        else:
            return False

    def get_antonyms(self, word):
        r = self.get(word)
        if r:
            return r[0]["meta"]["ants"][0]
        else:
            return False

    def get_examples(self, word):
        r = self.get(word)
        if r:
            return r[0]["meta"]["examples"][0]
        else:
            return False

    def get_related(self, word):
        r = self.get(word)
        if r:
            return r[0]["meta"]["rel_list"][0]
        else:
            return False

    def get_all(self, word):
        r = self.get(word)
        if r:
            return r[0]
        else:
            return False   

    def get_all_json(self, word):
        r = self.get(word)
        if r:
            return json.dumps(r[0])
        else:
            return False     

if __name__ == "__main__":

    # initialize the wod class
    wod = Wod(config["DICTIONARY_COM_API_KEY"])
    
    # read from csv and get the definition
    with open("wod.csv", "r") as f:
        reader = csv.reader(f)
        for row in reader:
            # handle empty rows
            if len(row) == 0:
                continue

            # handle error
            if len(row) != 1:
                print("Error: row should only contain one word")
                continue

            # try to get the definition
            try:
                definition = wod.get_definition(row[0])

                # print the definition
                print(definition)
            except:
                print("Error: word not found. ")
                continue    

            else:
                print("Error: word not found. ")
                continue

            finally:
                print("Done")                  
           

