"""
This code isn't pretty, but it allows me to modify the interface html/css without having to
deal with javascript string formatting
"""

import re
import argparse
from boto.s3.connection import S3Connection
from boto.s3.key import Key

def insert_javascript(filename):
	"""
	overkill for now, but could be useful if I split the javascript files up
	"""
	with open(filename) as fp:
		return fp.read()

def insert_code(filename):
	with open(filename) as fp:
		code = fp.read()
	# get rid of whitespace characters except for spaces to fit on one line
	code = code.replace("'", "\\'").replace('"', '\\"')
	code = re.sub(r'[\t\n\r\f\v]', '', code)
	return code

def upload_to_s3():
	with open('.env') as fp:
		access, secret_access = fp.read().split('\n', 1)
	if access is None or secret_access is None:
		return
	conn = S3Connection(access, secret_access)
	bucket = conn.get_bucket('collectjs')
	k = Key(bucket)
	k.key = 'collect.js'
	k.set_contents_from_filename('collect.js')
	k.set_acl('public-read')
	return
	

def main():
	javascript = insert_javascript('collect_base.js')
	codematch = re.compile(r'{{([a-zA-Z.]+)}}')
	for filename in re.findall(codematch, javascript):
		javascript = javascript.replace('{{%s}}' % filename, insert_code(filename))
	with open('collect.js', 'wb') as fp:
		fp.write(javascript)

if __name__=="__main__":
	parser = argparse.ArgumentParser(description="Build collect.js")
	parser.add_argument('--upload', dest='upload', action='store_const', const=upload_to_s3,
		help='upload collect.js to s3')
	args = parser.parse_args()
	main()
	if args.upload:
		args.upload()