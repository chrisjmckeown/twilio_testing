# Variables
DOMAIN_SID=""
MESSAGING_SERVICE_SID=""
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""

curl -X POST https://messaging.twilio.com/v1/LinkShortening/Domains/"$DOMAIN_SID"/MessagingServices/"$MESSAGING_SERVICE_SID" \
-u "$TWILIO_ACCOUNT_SID":"$TWILIO_AUTH_TOKEN"