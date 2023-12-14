#
# Client-side python app for photoapp, this time working with
# web service, which in turn uses AWS S3 and RDS to implement
# a simple photo application for photo storage and viewing.
#
# Project 02 for CS 310
#
# Authors:
#   Wenxin Zhang
#   Prof. Joe Hummel (initial template)
#   Northwestern University
#   CS 310
#

import requests  # calling web service
import jsons  # relational-object mapping

import uuid
import pathlib
import logging
import sys
import os
import base64

from configparser import ConfigParser

import matplotlib.pyplot as plt
import matplotlib.image as img


###################################################################
#
# classes
#
class User:
  userid: int  # these must match columns from DB table
  email: str
  lastname: str
  firstname: str
  bucketfolder: str


class Asset:
  assetid: int  # these must match columns from DB table
  userid: int
  assetname: str
  bucketkey: str


class BucketItem:
  Key: str  # these must match columns from DB table
  LastModified: str
  ETag: str
  Size: int
  StorageClass: str


class DownloadAsset:
  message: str
  user_id: int
  asset_name: str
  bucket_key: str
  data: str


###################################################################
#
# prompt
#
def prompt():
  """
  Prompts the user and returns the command number
  
  Parameters
  ----------
  None
  
  Returns
  -------
  Command number entered by user (0, 1, 2, ...)
  """
  print()
  print(">> Enter a command:")
  print("   0 => end")
  print("   1 => stats")
  print("   2 => users")
  print("   3 => assets")
  print("   4 => download")
  print("   5 => download and display")
  print("   6 => bucket contents")

  cmd = int(input())
  return cmd


###################################################################
#
# stats
#
def stats(baseurl):
  """
  Prints out S3 and RDS info: bucket status, # of users and 
  assets in the database
  
  Parameters
  ----------
  baseurl: baseurl for web service
  
  Returns
  -------
  nothing
  """

  try:
    #
    # call the web service:
    #
    api = '/stats'
    url = baseurl + api

    res = requests.get(url)
    #
    # let's look at what we got back:
    #
    if res.status_code != 200:
      # failed:
      print("Failed with status code:", res.status_code)
      print("url: " + url)
      if res.status_code == 400:  # we'll have an error message
        body = res.json()
        print("Error message:", body["message"])
      #
      return

    #
    # deserialize and extract stats:
    #
    body = res.json()
    #
    print("bucket status:", body["message"])
    print("# of users:", body["db_numUsers"])
    print("# of assets:", body["db_numAssets"])

  except Exception as e:
    logging.error("stats() failed:")
    logging.error("url: " + url)
    logging.error(e)
    return


###################################################################
#
# users
#
def users(baseurl):
  """
  Prints out all the users in the database
  
  Parameters
  ----------
  baseurl: baseurl for web service
  
  Returns
  -------
  nothing
  """

  try:
    #
    # call the web service:
    #
    api = '/users'
    url = baseurl + api

    res = requests.get(url)

    #
    # let's look at what we got back:
    #
    if res.status_code != 200:
      # failed:
      print("Failed with status code:", res.status_code)
      print("url: " + url)
      if res.status_code == 400:  # we'll have an error message
        body = res.json()
        print("Error message:", body["message"])
      #
      return

    #
    # deserialize and extract users:
    #
    body = res.json()
    #
    # let's map each dictionary into a User object:
    #
    users = []
    for row in body["data"]:
      user = jsons.load(row, User)
      users.append(user)
    #
    # Now we can think OOP:
    #
    for user in users:
      print(user.userid)
      print(" ", user.email)
      print(" ", user.lastname, ",", user.firstname)
      print(" ", user.bucketfolder)

  except Exception as e:
    logging.error("users() failed:")
    logging.error("url: " + url)
    logging.error(e)
    return


###################################################################
#
# users
#
def assets(baseurl):
  """
  Prints out all the assets in the database
  
  Parameters
  ----------
  baseurl: baseurl for web service
  
  Returns
  -------
  nothing
  """

  try:
    #
    # call the web service:
    #
    api = '/assets'
    url = baseurl + api

    res = requests.get(url)

    #
    # let's look at what we got back:
    #
    if res.status_code != 200:
      # failed:
      print("Failed with status code:", res.status_code)
      print("url: " + url)
      if res.status_code == 400:  # we'll have an error message
        body = res.json()
        print("Error message:", body["message"])
      #
      return

    #
    # deserialize and extract users:
    #
    body = res.json()
    #
    # let's map each dictionary into a User object:
    #
    assets = []
    for row in body["data"]:
      asset = jsons.load(row, Asset)
      assets.append(asset)
    #
    # Now we can think OOP:
    #
    for asset in assets:
      print(asset.assetid)
      print(" ", asset.userid)
      print(" ", asset.assetname)
      print(" ", asset.bucketkey)

  except Exception as e:
    logging.error("assets() failed:")
    logging.error("url: " + url)
    logging.error(e)
    return


###################################################################
#
# downloadAssets
#
def downloadAsset(baseurl):
  print("Enter asset id>")
  input_assetid = input()
  try:
    #
    # call the web service:
    #
    api = '/download'
    url = baseurl + api + "/" + input_assetid

    res = requests.get(url)

    #
    # let's look at what we got back:
    #
    if res.status_code != 200:
      # failed:
      if res.status_code == 400:  # we'll have an error message
        body = res.json()
        print("Failed with status code: 400")
        print("url:", url)
        print("Error message:", body["message"])
      #
      return False

    #
    # deserialize and extract respond:
    #
    body = res.json()

    #
    # let's map the json into a DownloadAsset object:
    #
    download_asset = jsons.load(body, DownloadAsset)
    #
    # Now we can think OOP:
    #
    print("userid:", download_asset.user_id)
    print("asset name:", download_asset.asset_name)
    print("bucket key:", download_asset.bucket_key)

    outfile = open(download_asset.asset_name, "wb")

    outfile.write(base64.b64decode(download_asset.data))
    outfile.close()

    print("Downloaded from s3 and saved as \'", download_asset.asset_name,
          "\'")
    return True, download_asset.asset_name

  except Exception as e:
    logging.error("assets() failed:")
    logging.error("url: " + url)
    logging.error(e)
    return False


###################################################################
#
# downloadAndDisplayAsset
#
def downloadAndDisplayAsset(baseurl):
  ret, filename = downloadAsset(baseurl)

  if ret:
    image = img.imread(filename)
    plt.imshow(image)
    plt.show()


###################################################################
#
# bucketContents
#
def bucketContents(baseurl, bucketkey=""):
  try:
    #
    # call the web service:
    #
    api = '/bucket'
    if bucketkey == "":
      url = baseurl + api
    else:
      url = baseurl + api + "?startafter=" + bucketkey

    res = requests.get(url)

    #
    # let's look at what we got back:
    #
    if res.status_code != 200:
      # failed:
      if res.status_code == 400:  # we'll have an error message
        body = res.json()
        print(body["message"])
      #
      return

    #
    # deserialize and extract respond:
    #
    body = res.json()

    buckets = []
    for row in body["data"]:
      bucket = jsons.load(row, BucketItem)
      buckets.append(bucket)

    buckets_len = len(buckets)
    if buckets_len == 0:
      return

    for bucket in buckets:
      print(bucket.Key)
      print(" ", bucket.LastModified)
      print(" ", bucket.Size)

    print("another page? [y/n]")
    cmd = input()
    if cmd == 'y':
      if buckets_len == 12:
        bucketContents(baseurl, buckets[-1].Key)
      else:
        return
    else:
      return

  except Exception as e:
    logging.error("assets() failed:")
    logging.error("url: " + url)
    logging.error(e)
    return False


#########################################################################
# main
#
print('** Welcome to PhotoApp v2 **')
print()

# eliminate traceback so we just get error message:
sys.tracebacklimit = 0

#
# what config file should we use for this session?
#
config_file = 'photoapp-client-config.ini'

print("What config file to use for this session?")
print("Press ENTER to use default (photoapp-client-config.ini),")
print("otherwise enter name of config file>")
s = input()

if s == "":  # use default
  pass  # already set
else:
  config_file = s

#
# does config file exist?
#
if not pathlib.Path(config_file).is_file():
  print("**ERROR: config file '", config_file, "' does not exist, exiting")
  sys.exit(0)

#
# setup base URL to web service:
#
configur = ConfigParser()
configur.read(config_file)
baseurl = configur.get('client', 'webservice')

# print(baseurl)

#
# main processing loop:
#
cmd = prompt()

while cmd != 0:
  #
  if cmd == 1:
    stats(baseurl)
  elif cmd == 2:
    users(baseurl)
  elif cmd == 3:
    assets(baseurl)
  elif cmd == 4:
    downloadAsset(baseurl)
  elif cmd == 5:
    downloadAndDisplayAsset(baseurl)
  elif cmd == 6:
    bucketContents(baseurl)
  else:
    print("** Unknown command, try again...")
  #
  cmd = prompt()

#
# done
#
print()
print('** done **')
