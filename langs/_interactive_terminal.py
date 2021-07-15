
welcome_msg = """
=== Welcome to SixtySecondShell Interactive Terminal ===

NOTE: Navigate to https://sixtysecondshell.srg.id.au to access the full range of features,
including network access and an interactive package manager. For operational safety, network
access is disabled on the interactive terminal.

"""

import json
langs = []

with open("languages.config.json", "r") as f:
    langs = json.loads(f.read())

langs = list(filter(lambda x: not x['noshell'], langs))

print(welcome_msg)
print("Please choose a language:")

for i, v in enumerate(langs):
    print(f"{i + 1}) {v['name']}")

choice = None
while True:

    try:

        choice = int(input(f"\nchoose [1-{len(langs)}]: ")) - 1

        if choice < len(langs):

            print()

            lang = langs[choice]
            print(f"Language chosen: {lang['name']}.")

            if lang['noshell']:
                print("Sorry, the chosen language does not have a shell. You can access a code editor and use this language at https://sixtysecondshell.srg.id.au.")
                print("__ITEM_EXIT|FAILURE|{success:false}")
                exit()

            print("\nYour language choice has been noted. Please wait while a container is provisioned...")
            print("__ITERM_EXIT|SUCCESS|" + json.dumps(lang))
            exit()

        else:
            print("Invalid choice. Please try again.\n")

    except KeyboardInterrupt:
        print("__ITERM_EXIT|FAILURE|{success:false}")
        exit()

    except Exception as e:
        print("Invalid choice, or an error occurred. Please try again.\n")