import os
import os.path
import re
import json
import base64
import string
import asyncio
from bs4 import BeautifulSoup
import aiohttp
import requests
import tkinter as tk
from tkinter import ttk
import threading
import subprocess

base_url = "https://monoschinos2.com/emision?p="
page_number = 1
anime_links = []

while True:
    url = base_url + str(page_number)
    response = requests.get(url)
    soup = BeautifulSoup(response.content, "html.parser")

    page_has_content = False

    for link in soup.find_all("a", href=True):
        if "/anime/" in link["href"]:
            page_has_content = True
            modified_link = link["href"].replace('/anime/', '/ver/').replace('-sub-espanol', '-episodio-')
            anime_links.append(modified_link)

    if not page_has_content:
        break

    page_number += 1

total_anime = len(anime_links)

def clean_filename(filename):
    valid_chars = "-_.() %s%s" % (string.ascii_letters, string.digits)
    cleaned_filename = ''.join(c for c in filename if c in valid_chars)
    return cleaned_filename

def remove_spaces(text):
    return text.replace(" ", "")

def remove_special_chars(text):
    return text.replace(".", "").replace("_", "").replace("-", "")

def ensure_https(url):
    if url.startswith("http://"):
        return url.replace("http://", "https://")
    return url

def get_video_links(soup):
    links = soup.find_all("p", class_="play-video")
    decoded_links = []
    for link in links:
        encoded_link = link["data-player"]
        decoded_link = base64.b64decode(encoded_link).decode('utf-8')
        decoded_links.append(ensure_https(decoded_link))
    return decoded_links

async def episode_exists(session, url):
    async with session.get(url) as response:
        if response.status == 404:
            return False
        soup = BeautifulSoup(await response.text(), 'html.parser')
        error_message = soup.find("div", class_="error-message")
        if error_message:
            return False
    return True

is_paused = False
anime_processed = 0

async def fetch_episode(session, url, episode, anime_name):
    global anime_processed
    async with session.get(url) as response:
        soup = BeautifulSoup(await response.text(), 'html.parser')
        https_urls = get_video_links(soup)

        formatted_data = {}
        formatted_data[str(episode)] = {}
        yourupload_links = []
        ok_links = []
        filemoon_links = []
        other_links = []
        for url in https_urls:
            url = ensure_https(url)
            if "yourupload" in url:
                yourupload_links.append(url)
            elif "ok.ru" in url:
                ok_links.append(url)
            elif "filemoon" in url:
                filemoon_links.append(url)
            else:
                other_links.append(url)

        all_links = yourupload_links + ok_links + filemoon_links + other_links
        for i, url in enumerate(all_links):
            if url.startswith("https://doodstream.com"):
                url = url.replace("https://doodstream.com", "https://dood.yt")
            formatted_data[str(episode)][f"Opción {i + 1}"] = url

        value = anime_processed
        maximum = len(anime_links)

        update_progress_bar(value, maximum)

        while is_paused:
            await asyncio.sleep(1)

        print(f"{anime_name} - Episodio {episode} procesado.")
        update_episode_added_label(episode, anime_name)
        return formatted_data

async def main():
    global anime_processed
    while True:
        new_episodes_found = False
        for base_url in anime_links:
            async with aiohttp.ClientSession() as session:
                response = await session.get(base_url + "1")
                soup = BeautifulSoup(await response.text(), 'html.parser')

                try:
                    anime_name = soup.find("h1", class_="heromain_h1").get_text(strip=True)
                except AttributeError:
                    print(f"No se pudo encontrar el nombre del anime en {base_url}. Saltando a la siguiente URL.")
                    continue

                anime_name = anime_name.replace("Ver ", "").split(" - ")[0]
                print(f"Nombre del anime: {anime_name}")

                anime_name_no_spaces = remove_spaces(anime_name)
                anime_name_no_special_chars = remove_special_chars(anime_name_no_spaces)

                cleaned_anime_name_no_special_chars = clean_filename(anime_name_no_special_chars)
                json_filename = f"{cleaned_anime_name_no_special_chars}.json"

                current_directory = os.path.dirname(os.path.abspath(__file__))

                json_filepath = os.path.join(current_directory, json_filename)

                if os.path.isfile(json_filepath):
                    with open(json_filepath, "r", encoding="utf-8") as file:
                        existing_data = json.load(file)
                else:
                    existing_data = {}

                formatted_data = {}

                last_existing_episode = max([int(x) for x in existing_data.keys()], default=0)
                episode = last_existing_episode + 1
                if await episode_exists(session, base_url + str(episode)):
                    new_episodes_found = True
                    tasks = []
                    while await episode_exists(session, base_url + str(episode)):
                        task = asyncio.ensure_future(fetch_episode(session, base_url + str(episode), episode, anime_name))
                        tasks.append(task)
                        episode += 1

                    results = await asyncio.gather(*tasks)

                    for result in results:
                        formatted_data.update(result)

                    existing_data.update(formatted_data)

                    formatted_json = json.dumps(existing_data, indent=2, ensure_ascii=False)

                    with open(json_filepath, "w", encoding="utf-8") as file:
                        file.write(formatted_json)

                    anime_processed += 1
                    anime_processed = 0

        if new_episodes_found:
            build_and_upload_to_github()
            break

loop = asyncio.get_event_loop()

def run_main_async():
    loop.run_until_complete(main())

    window.destroy()

def build_and_upload_to_github():
    print("Se encontraron nuevos episodios. Construyendo y subiendo a GitHub...")

    try:
        subprocess.run(["npm", "run", "build"], check=True)
        subprocess.run(["git", "add", "."], check=True)
        subprocess.run(["git", "commit", "-m", "Actualización automática de episodios"], check=True)
        subprocess.run(["git", "push"], check=True)

        print("Construcción y carga a GitHub completada.")
    except subprocess.CalledProcessError as error:
        print(f"Error al construir y cargar a GitHub: {error}")

def start_download():
    btn_start.config(state=tk.DISABLED)

    download_thread = threading.Thread(target=run_main_async)
    download_thread.start()

def update_progress_bar(value, maximum):
    progress_bar['value'] = value
    progress_bar['maximum'] = maximum
    info_label['text'] = f"Anime {value + 1} de {maximum}"
    window.update()

def update_episode_added_label(episode, anime_name):
    current_text = episode_added_label["text"]
    new_text = f"Episodio {episode} = {anime_name} añadido"
    if not current_text:
        episode_added_label["text"] = new_text
    else:
        episode_added_label["text"] = current_text + "\n" + new_text
    window.update()

def pause_resume():
    global is_paused
    is_paused = not is_paused

    if is_paused:
        btn_pause_resume.config(text="Reanudar")
    else:
        btn_pause_resume.config(text="Pausar")

window = tk.Tk()
window.title("Descargador de animes")
window.geometry("400x300")

total_anime_label = ttk.Label(window, text=f"Número total de animes: {total_anime}")
total_anime_label.place(x=120, y=10)

btn_start = ttk.Button(window, text="Iniciar descarga", command=start_download)
btn_start.place(x=150, y=50)

btn_pause_resume = ttk.Button(window, text="Pausar", command=pause_resume)
btn_pause_resume.place(x=150, y=80)

progress_bar = ttk.Progressbar(window, orient='horizontal', mode='determinate')
progress_bar.place(x=100, y=120, width=200)

info_label = ttk.Label(window, text="Anime 0 de 0")
info_label.place(x=160, y=150)

episode_added_label = ttk.Label(window, text="", justify="left", wraplength=300)
episode_added_label.place(x=50, y=180)
window.mainloop()