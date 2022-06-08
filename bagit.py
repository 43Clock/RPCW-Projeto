from dataclasses import replace
import sys
import os
import hashlib
import shutil
import json
import zipfile


if sys.argv[1][::-1][0] == "/":
    input = sys.argv[1][:-1]
else:
    input = sys.argv[1]
path = input
pathNew = input +"/temp"
# os.mkdir(path)

# with open(pathNew+"/bagit.txt") as f:
#     f.write("BagIt-Version: M.N")
#     f.write("Tag-File-Character-Encoding: UTF-8")

data = {
    "encoding": "UTF-8",
    "algorithm":"sha256",
    "data":[]
}

try:
    os.mkdir(pathNew)
    # os.mkdir(pathNew+"/data")
except:
    pass
for dir, dirs,files in os.walk(path):
    if not "temp" in dir:
        relativePath = "data"+dir.replace(path,"")
        print(pathNew+"/"+relativePath)
        try:
            os.mkdir(pathNew+"/"+relativePath)
        except:
            pass
        for file in files:
            shutil.copyfile(dir+"/"+file,pathNew+"/"+relativePath+"/"+file)
            with open(dir+"/"+file,"rb") as f:
                bytes  = f.read()
                hash = str(hashlib.sha256(bytes).hexdigest())
            data["data"].append({
                "checksum":hash,
                "path": relativePath+"/"+file
            })

# data["data"] = data["data"][1:]

with open(pathNew+"/RRD-SIP.json","w") as f:
    json.dump(data,f,indent=4)

with zipfile.ZipFile(path+"/"+sys.argv[2]+".zip",mode='w') as zipf:
    folder_path = pathNew
    print(pathNew)
    len_dir_path = len(folder_path)
    for root,_,files in os.walk(folder_path):
        for file in files:
            file_path = os.path.join(root, file)
            zipf.write(file_path, file_path[len_dir_path:])