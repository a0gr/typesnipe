from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import json
import os

try:
    with open("data/counter.txt", "r") as f:
        data_counter = int(f.read())
except:
    data_counter = 0

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://192.168.8.211:3001"],  # or specify domains like ["https://example.com"]
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"],  
    # allow_headers=["*"],  
)

class DeviceOrientationModel(BaseModel):
    alpha: float
    beta: float
    gamma: float

class KeystrokeModel(BaseModel):
    value: str
    orientation: DeviceOrientationModel
    time: int

@app.post("/data", operation_id="postData")
def post_data(keystrokes: list[KeystrokeModel]):
    global data_counter

    filtered_keystrokes = [keystrokes[0]]
    for prev_keystroke, keystroke in zip(keystrokes, keystrokes[1:]):
        # Filter out backspaces
        if len(keystroke.value) > len(prev_keystroke.value):

            # Only take one characters
            filtered_keystrokes.append(KeystrokeModel(
                value=keystroke.value[-1],
                orientation=keystroke.orientation,
                time=keystroke.time
            ))

        else:
            # Backspaces should be performed
            filtered_keystrokes.pop()

    os.makedirs("data/", exist_ok=True)
    with open(f"data/{data_counter}.json", "w") as f:
        json.dump([x.model_dump() for x in filtered_keystrokes], f)

    data_counter += 1
    with open("data/counter.txt", "w") as f:
        f.write(str(data_counter))