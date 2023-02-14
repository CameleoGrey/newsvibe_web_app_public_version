
from flask import Flask, request
from flask import send_file, render_template
from pathlib import Path
import json
from flask_cors import CORS, cross_origin
import os
import pickle

app = Flask(__name__,
            template_folder="../templates",
            static_folder="../static")
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route("/")
def get_home_page():

    # load keywords
    cached_keywords_path = Path("..", "data", "keywords.pkl")
    with open(cached_keywords_path, "rb") as keywords_file:
        keywords = pickle.load(keywords_file)
    print( keywords )

    # load global_preview
    cached_short_global_overview_path = Path("..", "data", "global_preview.pkl")
    with open(cached_short_global_overview_path, "rb") as global_preview_file:
        global_preview = pickle.load(global_preview_file)
    print(global_preview)

    # load preview_links
    cached_preview_summary_links_path = Path("..", "data", "preview_summary_links.pkl")
    with open(cached_preview_summary_links_path, "rb") as preview_summary_links_file:
        preview_links = pickle.load(preview_summary_links_file)

    full_path = Path("..", "site", "index.html")
    response = render_template("index.html",
                               keywords=keywords,
                               global_preview=global_preview,
                               preview_links=preview_links
                               )

    return response

@app.route("/fresh_content", methods=["GET"])
@cross_origin()
def get_fresh_data():
    full_path = Path( "..", "data", "data_for_frontend.json" )
    response = send_file(full_path, mimetype="text/plain")

    return response

@app.route("/fresh_content", methods=["POST"])
def update_content():

    if request.method == "POST":

        try:
            api_key = request.headers["api-key"]
        except Exception as e:
            print("No api key field")
            return {"code": 403}

        valid_api_keys = []
        api_keys_path = Path( "..", "data", "valid_api_keys.txt")
        with open(api_keys_path, "r") as api_keys_file:
            for key_string in api_keys_file:
                valid_api_keys.append(key_string)

        if api_key not in valid_api_keys:
            print("api key is not valid")
            return {"code": 403}

        full_path = Path("..", "data", "data_for_frontend.json")

        from werkzeug.datastructures import FileStorage
        FileStorage(request.stream).save(full_path)

        #content_update_json = request.get_json()
        #with open(full_path, "w") as frontend_data_file:
        #    json.dump( content_update_json, frontend_data_file )

        # get keywords from frontend json
        json_path = Path("..", "data", "data_for_frontend.json")
        with open(json_path, "r") as front_data_file:
            front_data = json.load(front_data_file)

        # cache keywords
        keywords = front_data["keywords"]
        cached_keywords_path = Path("..", "data", "keywords.pkl")
        with open(cached_keywords_path, "wb") as keywords_file:
            pickle.dump(keywords, keywords_file)

        # cache preview global overview
        short_global_overview = front_data["short_global_overview"]
        cached_short_global_overview_path = Path("..", "data", "global_preview.pkl")
        with open(cached_short_global_overview_path, "wb") as global_preview_file:
            pickle.dump(short_global_overview, global_preview_file)

        # cache preview summary links
        short_global_links = front_data["short_global_links"]
        cached_preview_summary_links_path = Path("..", "data", "preview_summary_links.pkl")
        with open(cached_preview_summary_links_path, "wb") as preview_summary_links_file:
            pickle.dump(short_global_links, preview_summary_links_file)

        return {"code": 200}

@app.route("/robots.txt", methods=["GET"])
@cross_origin()
def get_robots():
    full_path = Path( "..", "data", "robots.txt" )
    response = send_file(full_path, mimetype="text/plain")

    return response

@app.route("/newsvibe_shortcut_192.png", methods=["GET"])
@cross_origin()
def get_shortcut_192():
    full_path = Path( "..", "static", "img", "newsvibe_shortcut_192.png" )
    response = send_file(full_path, mimetype="image/png")

    return response

@app.route("/newsvibe_shortcut_32.png", methods=["GET"])
@cross_origin()
def get_shortcut_32():
    full_path = Path( "..", "static", "img", "newsvibe_shortcut_32.png" )
    response = send_file(full_path, mimetype="image/png")

    return response

@app.route("/newsvibe_shortcut_16.png", methods=["GET"])
@cross_origin()
def get_shortcut_16():
    full_path = Path( "..", "static", "img", "newsvibe_shortcut_16.png" )
    response = send_file(full_path, mimetype="image/png")

    return response