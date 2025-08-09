# wod.py - Word of the Day utility for Toastmasters
# Uses the Merriam-Webster Collegiate Dictionary API
# https://dictionaryapi.com/

import requests
import json
import secrets
import os
import csv
from dotenv import dotenv_values

# Load configuration from .env file
config = dotenv_values(".env")

class Wod:
    """
    A class to interact with the Merriam-Webster Collegiate Dictionary API
    for retrieving word definitions, synonyms, antonyms, examples, and related words.
    """
    def __init__(self, key):
        """
        Initialize the Wod class.
        Args:
            key (str): API key for the dictionary service.
        """
        self.key = key
        self.url = config["COLLEGIATE_API"]

    def get(self, word):
        """
        Fetch the API response for a given word.
        Args:
            word (str): The word to look up.
        Returns:
            dict or bool: API response as dict if successful, False otherwise.
        """
        r = requests.get(self.url + word + "?key=" + self.key)
        if r.status_code == 200:
            return json.loads(r.text)
        else:
            return False

    def get_definition(self, word):
        """
        Get the short definition of a word.
        Args:
            word (str): The word to define.
        Returns:
            str or bool: Definition if found, False otherwise.
        """
        r = self.get(word)
        if r:
            return r[0]["shortdef"][0]
        else:
            return False

    def get_synonyms(self, word):
        """
        Get synonyms for a word.
        Args:
            word (str): The word to find synonyms for.
        Returns:
            list or bool: List of synonyms if found, False otherwise.
        """
        r = self.get(word)
        if r:
            return r[0]["meta"]["syns"][0]
        else:
            return False

    def get_antonyms(self, word):
        """
        Get antonyms for a word.
        Args:
            word (str): The word to find antonyms for.
        Returns:
            list or bool: List of antonyms if found, False otherwise.
        """
        r = self.get(word)
        if r:
            return r[0]["meta"]["ants"][0]
        else:
            return False

    def get_examples(self, word):
        """
        Get example sentences for a word.
        Args:
            word (str): The word to find examples for.
        Returns:
            str or bool: Example sentence if found, False otherwise.
        """
        r = self.get(word)
        if r:
            return r[0]["meta"]["examples"][0]
        else:
            return False

    def get_related(self, word):
        """
        Get related words for a word.
        Args:
            word (str): The word to find related words for.
        Returns:
            list or bool: List of related words if found, False otherwise.
        """
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
           

