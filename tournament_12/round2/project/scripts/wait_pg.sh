# dirty checking that PG is available for connection
while ! curl http://$PGHOST:$PGPORT/ 2>&1 | grep '52'
do
  sleep 1
done