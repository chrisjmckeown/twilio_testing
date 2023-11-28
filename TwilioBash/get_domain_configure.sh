# Variables
DOMAIN_SID=""
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""

curl -X GET https://messaging.twilio.com/v1/LinkShortening/Domains/$DOMAIN_SID/Config \
-u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN 