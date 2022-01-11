#!/bin/bash
mysqldump -v -uroot -p1 moco_moco > /var/www/MOCO/api/dumps/$( date '+%Y-%m-%d_%H-%M-%S' ).sql