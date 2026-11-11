"""Generate private English dictation clips using local Flite's CMU SLT voice."""
import audioop
import base64
import ctypes as C
import json
import re
import sys
import tempfile
import wave

book_path, output_path = sys.argv[1:]
with open(book_path) as source:
    book = json.load(source)
texts = (block["text"] for page in book["pages"] for block in page["blocks"])
words = sorted(set(re.findall(r"[a-z]+(?:'[a-z]+)?", " ".join(texts).lower().replace("’", "'"))))
flite = C.CDLL("libflite.so.1")
flite.flite_init()
voices = C.CDLL("libflite_cmu_us_slt.so.1")
voices.register_cmu_us_slt.restype = C.c_void_p
voice = voices.register_cmu_us_slt(None)
flite.flite_text_to_speech.argtypes = [C.c_char_p, C.c_void_p, C.c_char_p]
flite.flite_text_to_speech.restype = C.c_float
clips = {}
with tempfile.NamedTemporaryFile(suffix=".wav") as temp:
    for word in words:
        if len(word) > 50:
            continue
        flite.flite_text_to_speech(word.encode(), voice, temp.name.encode())
        with wave.open(temp.name) as wav:
            samples = wav.readframes(wav.getnframes())
            pcm, _ = audioop.ratecv(samples, 2, 1, wav.getframerate(), 8000, None)
        encoded = audioop.lin2ulaw(pcm, 2).strip(b"\xff")
        if encoded:
            packed, _ = audioop.lin2adpcm(audioop.ulaw2lin(encoded, 2), 2, None)
            clips[word] = base64.b64encode(packed).decode()
with open(output_path, "w") as output:
    json.dump(clips, output)
print("Generated", len(clips), "clips")
