
from pathlib import Path
import fileinput
import argparse

def replace_host_port(file_path, line_to_search, new_host_port):
    for line in fileinput.input(file_path, inplace=True):
        if line_to_search in line:
            splitted_line = line.split("/")
            i = 0
            for i in range(len(splitted_line)):
                if "." in splitted_line[i]:
                    break
            old_host_port = splitted_line[i]
            splitted_line[i] = new_host_port
            updated_line = "/".join(splitted_line)
            print(updated_line, end="")
        else:
            print(line, end="")


parser = argparse.ArgumentParser("Parsing fresh content url")
parser.add_argument("--host", default="newsvibe.online")
parser.add_argument("--port", default="5000")

args = parser.parse_args()

host_name = args.host
port = args.port

if port == "":
    host_port = host_name
else:
    host_port = host_name + ":" + str(port)

content_management_script_path = Path("..", "static", "js", "content_management.js")
replace_host_port( content_management_script_path, "let fresh_content_url", host_port )
