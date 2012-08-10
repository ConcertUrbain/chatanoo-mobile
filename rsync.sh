#!/bin/bash
rsync -avz --delete -e ssh . "root@ns368978.ovh.net:/var/www/vhosts/chatanoo.org/projects/handicap/m/prod/" --exclude-from 'rsync.exclude'